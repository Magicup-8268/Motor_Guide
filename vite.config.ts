import OSS from 'ali-oss'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { drawingArchivesBySeries } from './src/data/drawings'
import { fastechVariantSpecs, fastechVariantsFor } from './src/data/fastechVariants'
import { manualPdfBySeries } from './src/data/manuals'
import { categories, motors } from './src/data/motors'
import { selectionCapabilityValue, supportsSelectionProtocol, supportsSelectionVoltage } from './src/utils/selectionFilters'

interface KincoToken {
  accessKeyId: string
  accessKeySecret: string
  bucketName: string
  region: string
  securityToken: string
}

interface KincoDownloadFile {
  url: string
  refererUrl: string
}

interface ComparisonWorkbookBuilder {
  buildComparisonXlsx: (products: typeof motors) => Promise<Uint8Array>
  buildBomXlsx: (project: BomXlsxProject) => Promise<Uint8Array>
}

let comparisonWorkbookBuilder: Promise<ComparisonWorkbookBuilder> | undefined

function getComparisonWorkbookBuilder() {
  if (!comparisonWorkbookBuilder) {
    const moduleUrl = pathToFileURL(resolve(process.cwd(), 'tmp/xlsx-runtime/comparisonWorkbook.mjs')).href
    comparisonWorkbookBuilder = import(moduleUrl) as Promise<ComparisonWorkbookBuilder>
  }
  return comparisonWorkbookBuilder
}

interface ModelSpecPdfPayload {
  model: string
  series: string
  category: string
  summary: string
  features: string[]
  specifications: Array<[string, string]>
  official_url: string
  share_url: string
  source_checked: string
}

interface SelectionReportCriteria {
  manufacturer?: 'all' | 'kinco' | 'robotis' | 'ls-mecapion' | 'komotek' | 'fastech'
  categoryId: string
  voltage: string
  powerFloor: number
  protocol: string
}

interface SelectionReportRequest {
  title?: string
  note?: string
  brandId?: 'kinco' | 'robotis' | 'ls-mecapion' | 'komotek' | 'fastech'
  criteria: SelectionReportCriteria
  comparisonIds?: string[]
  recommendedIds?: string[]
}

interface SelectionReportPdfPayload {
  title: string
  generated_at: string
  conditions: string[]
  recommendations: Array<{ rank: number; model: string; series: string; category: string; power: string; voltage: string; protocols: string; features: string; source_checked: string }>
  comparison_label: string
  comparison_products: string[]
  comparison_rows: Array<{ label: string; values: string[] }>
  note: string
  source_note: string
}

interface BomXlsxItem {
  id: string
  kind: 'motor-drive' | 'accessory'
  motor: string
  drive: string
  motorUrl: string
  driveUrl: string
  quantity: number
  status: 'reviewing' | 'quotation' | 'ordered' | 'received'
  unitPrice: number
  leadDate: string
  note: string
}

interface BomXlsxProject {
  id: string
  name: string
  note: string
  createdAt: string
  items: BomXlsxItem[]
}

interface BomXlsxRequest {
  project: BomXlsxProject
}

function formatPdfNumber(value: number) {
  return Number.isInteger(value) ? value.toLocaleString('ko-KR') : value.toLocaleString('ko-KR', { maximumFractionDigits: 3 })
}

function modelSpecRows(product: typeof motors[number]) {
  const { specs } = product
  const ratedPower = specs.ratedPowerOptions?.length
    ? specs.ratedPowerOptions.map((value) => `${formatPdfNumber(value)} W`).join(' · ')
    : specs.ratedPower !== undefined ? `${formatPdfNumber(specs.ratedPower)} W` : specs.powerRange ?? ''
  const ratedTorque = specs.ratedTorqueText ?? (specs.ratedTorque !== undefined ? `${formatPdfNumber(specs.ratedTorque)} Nm` : '')
  const holdingTorque = specs.holdingTorqueText ?? (specs.holdingTorque !== undefined ? `${formatPdfNumber(specs.holdingTorque)} Nm` : '')
  const maxTorque = specs.maxTorqueText ?? (specs.maxTorque !== undefined ? `${formatPdfNumber(specs.maxTorque)} Nm` : '')
  const ratedSpeed = specs.ratedSpeedText ?? (specs.ratedSpeed !== undefined ? `${formatPdfNumber(specs.ratedSpeed)} rpm` : '')
  const maxSpeed = specs.maxSpeedText ?? (specs.maxSpeed !== undefined ? `${formatPdfNumber(specs.maxSpeed)} rpm` : '')
  const current = specs.currentSummary ?? [
    specs.inputCurrent && `입력 ${specs.inputCurrent}`,
    specs.ratedCurrentText ?? (specs.ratedCurrent !== undefined ? `정격 ${formatPdfNumber(specs.ratedCurrent)} A` : ''),
    specs.continuousCurrent && `연속 ${specs.continuousCurrent}`,
    specs.maxCurrentText ?? (specs.maxCurrent !== undefined ? `최대 ${formatPdfNumber(specs.maxCurrent)} A` : ''),
    specs.peakCurrent && `피크 ${specs.peakCurrent}`,
  ].filter(Boolean).join(' · ')

  const rows: Array<[string, string]> = [
    ['정격 전압', specs.ratedVoltage ?? specs.dcInputRange ?? ''],
    ['정격 출력', ratedPower],
    ['정격 / 홀딩 토크', ratedTorque || holdingTorque],
    ['최대 토크', maxTorque],
    ['토크 기준', specs.torqueBasis ?? ''],
    ['전류', current],
    ['정격 속도', ratedSpeed],
    ['최대 속도', maxSpeed],
    ['통신 방식', specs.protocols?.join(' · ') ?? ''],
    ['엔코더 · 브레이크', [specs.encoder, specs.brake].filter(Boolean).join(' · ')],
    ['보호 · 안전', [specs.ipRating, specs.safety].filter(Boolean).join(' · ')],
  ]
  return rows.filter(([, value]) => Boolean(value))
}

function modelSpecPdfPayload(product: typeof motors[number], origin: string): ModelSpecPdfPayload {
  return {
    model: product.model,
    series: product.series,
    category: categories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId,
    summary: product.summary,
    features: product.features,
    specifications: modelSpecRows(product),
    official_url: product.officialUrl,
    share_url: `${origin}/#model=${encodeURIComponent(product.id)}`,
    source_checked: product.sourceChecked,
  }
}

function isNumberWithin(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum
}

function isSelectionReportRequest(value: unknown): value is SelectionReportRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Partial<SelectionReportRequest>
  const criteria = candidate.criteria
  if (!criteria || typeof criteria !== 'object' || Array.isArray(criteria)) return false
  const categoryIsValid = criteria.categoryId === 'all' || categories.some((category) => category.id === criteria.categoryId)
  const manufacturerIsValid = criteria.manufacturer === undefined || ['all', 'kinco', 'robotis', 'ls-mecapion', 'komotek', 'fastech'].includes(criteria.manufacturer)
  const voltageIsValid = ['all', '5v', '12v', '24v', '48v', '96v', '220v'].includes(criteria.voltage ?? '')
  const protocolIsValid = ['all', 'ethercat', 'canopen', 'modbus', 'profinet', 'pulse', 'ttl', 'rs485', 'uart'].includes(criteria.protocol ?? '')
  const titleIsValid = candidate.title === undefined || (typeof candidate.title === 'string' && candidate.title.length <= 80)
  const noteIsValid = candidate.note === undefined || (typeof candidate.note === 'string' && candidate.note.length <= 1_000)
  const comparisonIsValid = candidate.comparisonIds === undefined || (Array.isArray(candidate.comparisonIds) && candidate.comparisonIds.length <= 3 && candidate.comparisonIds.every((id) => typeof id === 'string'))
  const recommendationsAreValid = candidate.recommendedIds === undefined || (Array.isArray(candidate.recommendedIds) && candidate.recommendedIds.length <= 3 && candidate.recommendedIds.every((id) => typeof id === 'string'))
  const brandIsValid = candidate.brandId === undefined || ['kinco', 'robotis', 'ls-mecapion', 'komotek', 'fastech'].includes(candidate.brandId)
  if (!categoryIsValid || !manufacturerIsValid || !voltageIsValid || !protocolIsValid || !isNumberWithin(criteria.powerFloor, 0, 1_000_000) || !titleIsValid || !noteIsValid || !comparisonIsValid || !recommendationsAreValid || !brandIsValid) return false
  return true
}

function isBomXlsxRequest(value: unknown): value is BomXlsxRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const project = (value as Partial<BomXlsxRequest>).project
  if (!project || typeof project !== 'object' || Array.isArray(project) || !Array.isArray(project.items) || project.items.length < 1 || project.items.length > 200) return false
  const textIsValid = (text: unknown, maximum: number) => typeof text === 'string' && text.length <= maximum
  if (!textIsValid(project.id, 100) || !textIsValid(project.name, 80) || !textIsValid(project.note, 500) || !textIsValid(project.createdAt, 80)) return false

  return project.items.every((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false
    const candidate = item as Partial<BomXlsxItem>
    const validText = textIsValid(candidate.id, 100) && textIsValid(candidate.motor, 160) && textIsValid(candidate.drive, 160) && textIsValid(candidate.motorUrl, 500) && textIsValid(candidate.driveUrl, 500) && textIsValid(candidate.leadDate, 20) && textIsValid(candidate.note, 160)
    const validStatus = ['reviewing', 'quotation', 'ordered', 'received'].includes(candidate.status ?? '')
    const validKind = candidate.kind === 'motor-drive' || candidate.kind === 'accessory'
    const validQuantity = typeof candidate.quantity === 'number' && Number.isInteger(candidate.quantity) && candidate.quantity >= 1 && candidate.quantity <= 10_000
    const validPrice = isNumberWithin(candidate.unitPrice, 0, 1_000_000_000)
    const validDate = candidate.leadDate === '' || (typeof candidate.leadDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(candidate.leadDate))
    return validText && validStatus && validKind && validQuantity && validPrice && validDate
  })
}

function reportRatedPower(product: typeof motors[number]) {
  if (product.specs.ratedPowerOptions?.length) return product.specs.ratedPowerOptions.map((value) => `${formatPdfNumber(value)} W`).join(' · ')
  if (product.specs.ratedPower !== undefined) return `${formatPdfNumber(product.specs.ratedPower)} W`
  return product.specs.powerRange ?? '공개 사양 확인'
}

function reportPublishedTorque(product: typeof motors[number]) {
  return reportMetric(
    product.specs.maxTorqueText ?? product.specs.ratedTorqueText,
    product.specs.maxTorque ?? product.specs.ratedTorque,
    'Nm',
  )
}

function reportHoldingTorque(product: typeof motors[number]) {
  return reportMetric(product.specs.ratedTorqueText, product.specs.holdingTorque ?? product.specs.ratedTorque, 'Nm')
}

function reportMaxRatedPower(product: typeof motors[number]) {
  return product.specs.selectionMaxPower ?? (product.specs.ratedPowerOptions?.length ? Math.max(...product.specs.ratedPowerOptions) : product.specs.ratedPower ?? -1)
}

function reportVoltage(product: typeof motors[number]) {
  return product.specs.ratedVoltage ?? product.specs.dcInputRange ?? '공개 사양 확인'
}

function reportMetric(text: string | undefined, value: number | undefined, unit: string) {
  return text ?? (value !== undefined ? `${formatPdfNumber(value)} ${unit}` : '공개 사양 확인')
}

function selectionReportMatches(criteria: SelectionReportCriteria) {
  const manufacturerBySelection = { kinco: 'Kinco', robotis: 'ROBOTIS', 'ls-mecapion': 'LS메카피온', komotek: 'KOMOTEK', fastech: 'FASTECH' } as const
  return motors
    .filter((product) => product.lifecycle !== 'legacy')
    .filter((product) => !criteria.manufacturer || criteria.manufacturer === 'all' || product.brand === manufacturerBySelection[criteria.manufacturer])
    .filter((product) => criteria.categoryId === 'all' || product.categoryId === criteria.categoryId)
    .filter((product) => supportsSelectionVoltage(product, criteria.voltage as Parameters<typeof supportsSelectionVoltage>[1]))
    .filter((product) => criteria.powerFloor === 0 || selectionCapabilityValue(product) >= criteria.powerFloor)
    .filter((product) => supportsSelectionProtocol(product, criteria.protocol as Parameters<typeof supportsSelectionProtocol>[1]))
    .sort((left, right) => {
      const leftGap = criteria.powerFloor > 0 ? Math.max(0, selectionCapabilityValue(left) - criteria.powerFloor) : 0
      const rightGap = criteria.powerFloor > 0 ? Math.max(0, selectionCapabilityValue(right) - criteria.powerFloor) : 0
      return (leftGap - rightGap) || (right.weight - left.weight)
    })
    .slice(0, 3)
}

function selectionReportPayload(request: SelectionReportRequest): SelectionReportPdfPayload {
  const category = categories.find((item) => item.id === request.criteria.categoryId)
  const requestedRecommendationIds = [...new Set(request.recommendedIds ?? [])]
  const requestedRecommendations = requestedRecommendationIds
    .map((id) => motors.find((product) => product.id === id))
    .filter((product): product is typeof motors[number] => Boolean(product))
  const recommendations = requestedRecommendations.length ? requestedRecommendations : selectionReportMatches(request.criteria)
  const usesRobotisTorque = recommendations.length > 0 ? recommendations.every((product) => product.brand === 'ROBOTIS') : request.brandId === 'robotis'
  const usesFastechTorque = recommendations.length > 0 ? recommendations.every((product) => product.brand === 'FASTECH') : request.brandId === 'fastech'
  const manufacturerLabels: Record<string, string> = { all: '전체 제조사', kinco: 'KINCO', robotis: '로보티즈 (DYNAMIXEL)', 'ls-mecapion': 'LS메카피온', komotek: '코모텍', fastech: '파스텍 (FASTECH)' }
  const voltageLabels: Record<string, string> = { all: '전원 전체', '5v': '5 V DC', '12v': '12 V DC', '24v': '24 V DC', '48v': '48 V DC', '96v': '96 V DC', '220v': '220 V AC' }
  const protocolLabels: Record<string, string> = { all: '통신 전체', ethercat: 'EtherCAT', canopen: 'CANopen', modbus: 'Modbus RTU', profinet: 'Profinet', pulse: 'Pulse / I/O', ttl: 'TTL Half-Duplex', rs485: 'RS-485', uart: 'UART Half-Duplex' }
  const conditions = [
    manufacturerLabels[request.criteria.manufacturer ?? 'all'],
    category?.name ?? '유형 전체',
    voltageLabels[request.criteria.voltage],
    request.criteria.powerFloor > 0
      ? usesRobotisTorque ? `${formatPdfNumber(request.criteria.powerFloor)} Nm 이상 공개 토크` : usesFastechTorque ? `${formatPdfNumber(request.criteria.powerFloor)} Nm 이상 홀딩 토크` : `${formatPdfNumber(request.criteria.powerFloor)} W 이상`
      : usesRobotisTorque ? '공개 토크 전체' : usesFastechTorque ? '홀딩 토크 전체' : '용량 전체',
    protocolLabels[request.criteria.protocol],
  ]
  const comparisonIds = [...new Set(request.comparisonIds ?? [])]
  const selectedComparison = comparisonIds
    .map((id) => motors.find((product) => product.id === id))
    .filter((product): product is typeof motors[number] => Boolean(product))
    .filter((product) => !usesRobotisTorque || product.lifecycle !== 'legacy')
  const comparisonProducts = selectedComparison.length ? selectedComparison : recommendations
  const comparisonRows = usesRobotisTorque
    ? [
        { label: '공개 토크', values: comparisonProducts.map(reportPublishedTorque) },
        { label: '토크 기준', values: comparisonProducts.map((product) => product.specs.torqueBasis ?? '공식 사양 확인') },
        { label: '무부하 속도', values: comparisonProducts.map((product) => reportMetric(product.specs.maxSpeedText, product.specs.maxSpeed, 'rpm')) },
        { label: '정격 전압', values: comparisonProducts.map(reportVoltage) },
        { label: '전류 (공개 기준)', values: comparisonProducts.map((product) => product.specs.maxCurrentText ?? product.specs.currentSummary ?? '공개 사양 확인') },
        { label: '물리 통신', values: comparisonProducts.map((product) => product.specs.physicalConnection ?? product.specs.protocols?.join(' · ') ?? '공개 사양 확인') },
        { label: '감속비', values: comparisonProducts.map((product) => product.specs.gearRatio ?? '공개 사양 확인') },
        { label: '엔코더 / 분해능', values: comparisonProducts.map((product) => [product.specs.encoder, product.specs.resolution].filter(Boolean).join(' · ') || '공개 사양 확인') },
      ]
    : usesFastechTorque
      ? [
        { label: '홀딩 토크', values: comparisonProducts.map(reportHoldingTorque) },
        { label: '토크 기준', values: comparisonProducts.map((product) => product.specs.torqueBasis ?? '공식 사양 확인') },
        { label: '입력 전압', values: comparisonProducts.map(reportVoltage) },
        { label: '속도 범위', values: comparisonProducts.map((product) => reportMetric(product.specs.maxSpeedText ?? product.specs.ratedSpeedText, product.specs.maxSpeed ?? product.specs.ratedSpeed, 'rpm')) },
        { label: '전류', values: comparisonProducts.map((product) => product.specs.currentSummary ?? product.specs.ratedCurrentText ?? '공식 사양 확인') },
        { label: '통신 방식', values: comparisonProducts.map((product) => product.specs.protocols?.join(' · ') ?? '공식 사양 확인') },
        { label: '엔코더 / 제어', values: comparisonProducts.map((product) => [product.specs.encoder, product.specs.resolution, product.specs.operatingModes].filter(Boolean).join(' · ') || '공식 사양 확인') },
      ]
    : [
        { label: '정격 출력', values: comparisonProducts.map(reportRatedPower) },
        { label: '정격 전압', values: comparisonProducts.map(reportVoltage) },
        { label: '정격 / 홀딩 토크', values: comparisonProducts.map((product) => reportMetric(product.specs.ratedTorqueText, product.specs.ratedTorque ?? product.specs.holdingTorque, 'Nm')) },
        { label: '최대 토크', values: comparisonProducts.map((product) => reportMetric(product.specs.maxTorqueText, product.specs.maxTorque, 'Nm')) },
        { label: '정격 속도', values: comparisonProducts.map((product) => reportMetric(product.specs.ratedSpeedText, product.specs.ratedSpeed, 'rpm')) },
        { label: '통신 방식', values: comparisonProducts.map((product) => product.specs.protocols?.join(' · ') ?? '모터 단품 - 호환 드라이브 확인') },
      ]
  return {
    title: request.title?.trim() || 'Magicup 모터 선정 보고서',
    generated_at: new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date()),
    conditions,
    recommendations: recommendations.map((product, index) => ({
      rank: index + 1,
      model: product.model,
      series: product.series,
      category: categories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId,
      power: usesRobotisTorque ? reportPublishedTorque(product) : usesFastechTorque ? reportHoldingTorque(product) : reportRatedPower(product),
      voltage: reportVoltage(product),
      protocols: product.specs.protocols?.join(' · ') ?? '호환 드라이브 통신 방식 적용',
      features: product.features.slice(0, 2).join(' · ') || product.summary,
      source_checked: product.sourceChecked,
    })),
    comparison_label: selectedComparison.length ? '현재 비교함 모델' : '추천 후보 자동 비교',
    comparison_products: comparisonProducts.map((product) => product.model),
    comparison_rows: comparisonRows,
    note: request.note?.trim() || '프로젝트 메모가 입력되지 않았습니다.',
    source_note: '본 보고서는 제조사 공식 공개 페이지와 등록된 공식 매뉴얼 정보를 기준으로 생성됩니다. 모델 코드, 감속기, 엔코더, 브레이크 및 실제 부하 조건은 최종 발주 전에 다시 확인해야 합니다.',
  }
}

function pdfPythonExecutable() {
  const relativeRuntimePath = ['.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'python.exe']
  const candidates = [
    process.env.CODEX_PYTHON,
    resolve(homedir(), ...relativeRuntimePath),
    resolve(process.env.USERPROFILE ?? homedir(), ...relativeRuntimePath),
  ].filter((candidate): candidate is string => Boolean(candidate))
  return candidates.find((candidate) => existsSync(candidate)) ?? process.env.PYTHON ?? 'python'
}

function buildModelSpecPdf(payload: ModelSpecPdfPayload) {
  return new Promise<Uint8Array>((resolvePdf, rejectPdf) => {
    const generator = resolve(process.cwd(), 'scripts', 'generate_model_spec_pdf.py')
    const child = spawn(pdfPythonExecutable(), [generator], { stdio: ['pipe', 'pipe', 'pipe'] })
    const chunks: Buffer[] = []
    let errorOutput = ''

    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
    child.stderr.on('data', (chunk: Buffer) => { errorOutput += chunk.toString() })
    child.on('error', rejectPdf)
    child.on('close', (code) => {
      if (code === 0) {
        resolvePdf(new Uint8Array(Buffer.concat(chunks)))
        return
      }
      rejectPdf(new Error(errorOutput || `PDF generator exited with code ${code}`))
    })
    child.stdin.end(JSON.stringify(payload))
  })
}

function buildSelectionReportPdf(payload: SelectionReportPdfPayload) {
  return new Promise<Uint8Array>((resolvePdf, rejectPdf) => {
    const generator = resolve(process.cwd(), 'scripts', 'generate_selection_report_pdf.py')
    const child = spawn(pdfPythonExecutable(), [generator], { stdio: ['pipe', 'pipe', 'pipe'] })
    const chunks: Buffer[] = []
    let errorOutput = ''

    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
    child.stderr.on('data', (chunk: Buffer) => { errorOutput += chunk.toString() })
    child.on('error', rejectPdf)
    child.on('close', (code) => {
      if (code === 0) {
        resolvePdf(new Uint8Array(Buffer.concat(chunks)))
        return
      }
      rejectPdf(new Error(errorOutput || `Selection report PDF generator exited with code ${code}`))
    })
    child.stdin.end(JSON.stringify(payload))
  })
}

async function readJsonRequest(request: AsyncIterable<Uint8Array | string>, maximumBytes = 16_384) {
  const chunks: Buffer[] = []
  let totalBytes = 0
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk)
    totalBytes += buffer.byteLength
    if (totalBytes > maximumBytes) throw new Error('Request body is too large.')
    chunks.push(buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf-8')) as unknown
}

async function retrieveKincoDownload(file: KincoDownloadFile) {
  const tokenResponse = await fetch('https://www.kincoautomation.com/api/getToken')
  const tokenPayload = await tokenResponse.json() as { code?: string; data?: KincoToken }
  if (!tokenResponse.ok || tokenPayload.code !== '000000' || !tokenPayload.data) throw new Error('Kinco temporary access token was unavailable')

  const token = tokenPayload.data
  const client = new OSS({
    region: token.region,
    authorizationV4: true,
    secure: true,
    accessKeyId: token.accessKeyId,
    accessKeySecret: token.accessKeySecret,
    stsToken: token.securityToken,
    bucket: token.bucketName,
  })
  const objectPath = decodeURIComponent(new URL(file.url).pathname.slice(1))
  const signedUrl = client.signatureUrl(objectPath, { expires: 60 })
  const downloadResponse = await fetch(signedUrl, { headers: { Referer: file.refererUrl } })
  if (!downloadResponse.ok) throw new Error(`Kinco download response ${downloadResponse.status}`)
  return new Uint8Array(await downloadResponse.arrayBuffer())
}

async function retrieveFastechDownload(file: KincoDownloadFile) {
  const downloadResponse = await fetch(file.url, {
    headers: {
      Referer: file.refererUrl,
      Accept: 'application/pdf,application/zip,application/octet-stream;q=0.9,*/*;q=0.8',
    },
  })
  if (!downloadResponse.ok) throw new Error(`FASTECH download response ${downloadResponse.status}`)
  return new Uint8Array(await downloadResponse.arrayBuffer())
}

function manualPdfProxy(): Plugin {
  return {
    name: 'kinco-manual-pdf-proxy',
    configureServer(server) {
      server.middlewares.use('/api/manual-pdf', async (request, response, next) => {
        if (request.method !== 'GET') return next()

        const series = new URL(request.url ?? '', 'http://localhost').searchParams.get('series')
        const manual = series ? manualPdfBySeries[series] : undefined
        if (!manual) {
          response.statusCode = 404
          response.end('Manual PDF is not registered for this series.')
          return
        }

        try {
          const isFastech = new URL(manual.url).hostname === 'fastech-motions.com'
          const pdf = isFastech ? await retrieveFastechDownload(manual) : await retrieveKincoDownload(manual)
          const isZipArchive = manual.fileExtension === 'zip'
          response.statusCode = 200
          response.setHeader('Content-Type', isZipArchive ? 'application/zip' : 'application/pdf')
          response.setHeader('Content-Length', String(pdf.byteLength))
          response.setHeader('Content-Disposition', `${isZipArchive ? 'attachment' : 'inline'}; filename="${series}-manual.${isZipArchive ? 'zip' : 'pdf'}"`)
          response.setHeader('Cache-Control', 'no-store')
          response.setHeader('X-Content-Type-Options', 'nosniff')
          response.end(pdf)
        } catch {
          response.statusCode = 502
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end('Official manual could not be retrieved. Please try again shortly.')
        }
      })

      server.middlewares.use('/api/drawing-zip', async (request, response, next) => {
        if (request.method !== 'GET') return next()

        const searchParams = new URL(request.url ?? '', 'http://localhost').searchParams
        const series = searchParams.get('series')
        const drawingId = searchParams.get('id')
        const drawing = series && drawingId ? drawingArchivesBySeries[series]?.find((item) => item.id === drawingId) : undefined
        if (!drawing) {
          response.statusCode = 404
          response.end('Drawing ZIP is not registered for this model.')
          return
        }

        try {
          const zip = await retrieveKincoDownload(drawing)
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/zip')
          response.setHeader('Content-Length', String(zip.byteLength))
          response.setHeader('Content-Disposition', `attachment; filename="${drawing.id}.zip"`)
          response.setHeader('Cache-Control', 'no-store')
          response.setHeader('X-Content-Type-Options', 'nosniff')
          response.end(zip)
        } catch {
          response.statusCode = 502
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end('Kinco drawing ZIP could not be retrieved. Please try again shortly.')
        }
      })

      server.middlewares.use('/api/comparison-xlsx', async (request, response, next) => {
        if (request.method !== 'GET') return next()

        const requestedIds = new URL(request.url ?? '', 'http://localhost').searchParams.getAll('id')
        const requestedProducts = requestedIds
          .map((id) => motors.find((product) => product.id === id))
          .filter((product): product is typeof motors[number] => Boolean(product))

        if (requestedProducts.length < 1 || requestedProducts.length > 3 || requestedProducts.length !== requestedIds.length) {
          response.statusCode = 400
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end('Select one to three registered motor models before exporting.')
          return
        }

        try {
          const { buildComparisonXlsx } = await getComparisonWorkbookBuilder()
          const xlsx = await buildComparisonXlsx(requestedProducts)
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          response.setHeader('Content-Length', String(xlsx.byteLength))
          response.setHeader('Content-Disposition', 'attachment; filename="Magicup-Motor-Atlas-Comparison.xlsx"')
          response.setHeader('Cache-Control', 'no-store')
          response.setHeader('X-Content-Type-Options', 'nosniff')
          response.end(xlsx)
        } catch (error) {
          console.error('Comparison XLSX export failed:', error)
          response.statusCode = 500
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end('Comparison XLSX could not be created. Please try again shortly.')
        }
      })

      server.middlewares.use('/api/project-bom-xlsx', async (request, response, next) => {
        if (request.method !== 'POST') return next()

        try {
          const requestBody = await readJsonRequest(request, 131_072)
          if (!isBomXlsxRequest(requestBody)) {
            response.statusCode = 400
            response.setHeader('Content-Type', 'text/plain; charset=utf-8')
            response.end('Project BOM request is invalid.')
            return
          }

          const { buildBomXlsx } = await getComparisonWorkbookBuilder()
          const xlsx = await buildBomXlsx(requestBody.project)
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          response.setHeader('Content-Length', String(xlsx.byteLength))
          response.setHeader('Content-Disposition', 'attachment; filename="Magicup-Project-BOM.xlsx"')
          response.setHeader('Cache-Control', 'no-store')
          response.setHeader('X-Content-Type-Options', 'nosniff')
          response.end(xlsx)
        } catch (error) {
          console.error('Project BOM XLSX export failed:', error)
          response.statusCode = 500
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end('Project BOM XLSX could not be created. Please try again shortly.')
        }
      })
    },
  }
}

function modelSpecPdfRoute(): Plugin {
  return {
    name: 'model-spec-pdf',
    configureServer(server) {
      server.middlewares.use('/api/model-spec-pdf', async (request, response, next) => {
        if (request.method !== 'GET') return next()

        const requestParams = new URL(request.url ?? '', 'http://localhost').searchParams
        const modelId = requestParams.get('id')
        const product = modelId ? motors.find((item) => item.id === modelId) : undefined
        if (!product) {
          response.statusCode = 404
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end('Registered motor model was not found.')
          return
        }

        // A FASTECH family covers many frame sizes, so the card has to be built from
        // the sub-model the user actually selected in the detail view.
        const variantId = requestParams.get('variant')
        const variant = variantId ? fastechVariantsFor(product).find((item) => item.id === variantId) : undefined
        const target = variant ? { ...product, model: variant.model, specs: fastechVariantSpecs(product, variant) } : product

        try {
          const origin = `http://${request.headers.host ?? 'localhost'}`
          const pdf = await buildModelSpecPdf(modelSpecPdfPayload(target, origin))
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/pdf')
          response.setHeader('Content-Length', String(pdf.byteLength))
          response.setHeader('Content-Disposition', `attachment; filename="${product.id}-spec-card.pdf"`)
          response.setHeader('Cache-Control', 'no-store')
          response.setHeader('X-Content-Type-Options', 'nosniff')
          response.end(pdf)
        } catch (error) {
          console.error('Model specification PDF export failed:', error)
          response.statusCode = 500
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end('Model specification PDF could not be created. Please try again shortly.')
        }
      })
    },
  }
}

function selectionReportPdfRoute(): Plugin {
  return {
    name: 'selection-report-pdf',
    configureServer(server) {
      server.middlewares.use('/api/selection-report-pdf', async (request, response, next) => {
        if (request.method !== 'POST') return next()

        try {
          const requestBody = await readJsonRequest(request)
          if (!isSelectionReportRequest(requestBody)) {
            response.statusCode = 400
            response.setHeader('Content-Type', 'text/plain; charset=utf-8')
            response.end('Selection report request is invalid.')
            return
          }

          const pdf = await buildSelectionReportPdf(selectionReportPayload(requestBody))
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/pdf')
          response.setHeader('Content-Length', String(pdf.byteLength))
          response.setHeader('Content-Disposition', 'attachment; filename="Magicup-Motor-Selection-Report.pdf"')
          response.setHeader('Cache-Control', 'no-store')
          response.setHeader('X-Content-Type-Options', 'nosniff')
          response.end(pdf)
        } catch (error) {
          console.error('Selection report PDF export failed:', error)
          response.statusCode = 500
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end('Selection report PDF could not be created. Please try again shortly.')
        }
      })
    },
  }
}

// GitHub Pages는 https://<user>.github.io/Motor_Guide/ 하위 경로에서 제공되므로
// 정적 배포 빌드에서는 base 경로를 지정해야 자산(JS/CSS/이미지) 경로가 깨지지 않는다.
// (로컬 npm run dev / npm run build에는 영향 없음 — GH_PAGES=true 일 때만 적용)
const isGithubPagesBuild = process.env.GH_PAGES === 'true'

export default defineConfig({
  base: isGithubPagesBuild ? '/Motor_Guide/' : '/',
  plugins: [react(), manualPdfProxy(), modelSpecPdfRoute(), selectionReportPdfRoute()],
})
