import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './components/Icon'
import { drawingArchivesFor, type DrawingArchive } from './data/drawings'
import { driveCompatibilityFor, type DriveMatch } from './data/drives'
import { fastechVariantSpecs, fastechVariantsFor, type FastechMotorVariant } from './data/fastechVariants'
import { manualFileLabel, manualKindLabel, manualPdfFor } from './data/manuals'
import { brandCatalogs, categories, categoriesForBrand, categoryForBrand, motors, sourceLabel } from './data/motors'
import { categoryProductImageFor, productImageFor } from './data/productImages'
import type { BrandId, CategoryId, MotorProduct, MotorSpecs } from './types'
import { selectionCapabilityValue, supportsSelectionProtocol, supportsSelectionVoltage, type SelectionProtocol, type SelectionVoltage } from './utils/selectionFilters'

const storageKeys = {
  favorites: 'motor-atlas:favorites:v1',
  favoriteMetadata: 'motor-atlas:favorite-metadata:v1',
  drivePairings: 'motor-atlas:drive-pairings:v1',
  bomProjects: 'motor-atlas:bom-projects:v1',
  activeBomProject: 'motor-atlas:active-bom-project:v1',
  activeBrand: 'motor-atlas:active-brand:v1',
  selectionPlans: 'motor-atlas:selection-plans:v1',
  recents: 'motor-atlas:recents:v1',
  theme: 'motor-atlas:theme:v1',
}

type Theme = 'dark' | 'light'
type DetailTab = 'specs' | 'manual'
type FavoriteStatus = 'reviewing' | 'candidate' | 'selected'
type RobotisLineup = 'current' | 'legacy' | 'all'
type BomItemStatus = 'reviewing' | 'quotation' | 'ordered' | 'received'
type BomItemKind = 'motor-drive' | 'accessory'
type SelectionManufacturer = 'all' | BrandId

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface FavoriteMetadata {
  status: FavoriteStatus
  note: string
}

interface SelectionCriteria {
  manufacturer: SelectionManufacturer
  categoryId: CategoryId | 'all'
  voltage: SelectionVoltage
  powerFloor: number
  protocol: SelectionProtocol
}

interface SelectionPlan extends SelectionCriteria {
  id: string
  name: string
  createdAt: string
}

interface BomItem {
  id: string
  kind: BomItemKind
  motor: string
  drive: string
  motorUrl: string
  driveUrl: string
  quantity: number
  status: BomItemStatus
  unitPrice: number
  leadDate: string
  note: string
}

interface BomProject {
  id: string
  name: string
  note: string
  createdAt: string
  items: BomItem[]
}

const defaultFavoriteMetadata: FavoriteMetadata = { status: 'reviewing', note: '' }
const bomStatusOptions: Array<{ value: BomItemStatus; label: string }> = [
  { value: 'reviewing', label: '검토 중' },
  { value: 'quotation', label: '견적 요청' },
  { value: 'ordered', label: '발주 완료' },
  { value: 'received', label: '입고 완료' },
]

const selectionVoltageOptions: Array<{ value: SelectionVoltage; label: string }> = [
  { value: 'all', label: '전원 전체' },
  { value: '5v', label: '5 V DC' },
  { value: '12v', label: '12 V DC' },
  { value: '24v', label: '24 V DC' },
  { value: '48v', label: '48 V DC' },
  { value: '96v', label: '96 V DC' },
  { value: '220v', label: '220 V AC' },
]

const selectionManufacturerOptions: Array<{ value: SelectionManufacturer; label: string }> = [
  { value: 'all', label: '전체 제조사' },
  { value: 'kinco', label: 'KINCO' },
  { value: 'robotis', label: '로보티즈 (DYNAMIXEL)' },
  { value: 'ls-mecapion', label: 'LS메카피온' },
  { value: 'komotek', label: '코모텍' },
  { value: 'fastech', label: '파스텍 (FASTECH)' },
]

const selectionPowerOptions = [
  { value: 0, label: '용량 전체' },
  { value: 100, label: '100 W 이상' },
  { value: 400, label: '400 W 이상' },
  { value: 750, label: '750 W 이상' },
  { value: 1000, label: '1 kW 이상' },
]

const extendedPowerFloors = [100, 400, 750, 1000, 3000, 7500, 15000, 40000, 100000, 800000]

function powerOptionsFor(products: MotorProduct[]) {
  const maximumPublishedPower = Math.max(0, ...products.map(selectionCapabilityValue))
  return [
    { value: 0, label: '용량 전체' },
    ...extendedPowerFloors
      .filter((value) => value <= maximumPublishedPower || value === 100)
      .map((value) => ({ value, label: `${formatNumber(value)} W 이상` })),
  ]
}

const torqueOptions = [
  { value: 0, label: '토크 전체' },
  { value: 0.2, label: '0.2 Nm 이상 토크' },
  { value: 1, label: '1 Nm 이상 토크' },
  { value: 3, label: '3 Nm 이상 토크' },
  { value: 5, label: '5 Nm 이상 토크' },
  { value: 9, label: '9 Nm 이상 토크' },
  { value: 15, label: '15 Nm 이상 토크' },
  { value: 30, label: '30 Nm 이상 토크' },
  { value: 60, label: '60 Nm 이상 토크' },
]

const dynamixelFamilyOrder = ['XW Series', 'XD Series', 'XH Series', 'XM Series', 'XC Series', 'XL Series', 'Y Series', 'P Series', 'MX Series', 'AX Series', 'EX Series', 'DX Series', 'RX Series', 'PRO Series']

function compareDynamixelFamilies(left: string, right: string) {
  const leftOrder = dynamixelFamilyOrder.indexOf(left)
  const rightOrder = dynamixelFamilyOrder.indexOf(right)
  return (leftOrder === -1 ? Number.MAX_SAFE_INTEGER : leftOrder) - (rightOrder === -1 ? Number.MAX_SAFE_INTEGER : rightOrder) || left.localeCompare(right)
}

function isValidSelectionPower(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1_000_000
}

const selectionProtocolOptions: Array<{ value: SelectionProtocol; label: string }> = [
  { value: 'all', label: '통신 전체' },
  { value: 'ethercat', label: 'EtherCAT' },
  { value: 'canopen', label: 'CANopen' },
  { value: 'modbus', label: 'Modbus RTU' },
  { value: 'profinet', label: 'Profinet' },
  { value: 'pulse', label: 'Pulse / I/O' },
  { value: 'ttl', label: 'TTL Half-Duplex' },
  { value: 'rs485', label: 'RS-485' },
  { value: 'uart', label: 'UART Half-Duplex' },
]

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function loadStringList(key: string) {
  try {
    const item = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(item) ? item.filter((value): value is string => typeof value === 'string') : []
  } catch {
    return []
  }
}

const manufacturerByBrandId: Record<BrandId, MotorProduct['brand']> = {
  kinco: 'Kinco',
  robotis: 'ROBOTIS',
  'ls-mecapion': 'LS메카피온',
  komotek: 'KOMOTEK',
  fastech: 'FASTECH',
}

function brandIdForProduct(product: MotorProduct): BrandId {
  return (Object.entries(manufacturerByBrandId).find(([, manufacturer]) => manufacturer === product.brand)?.[0] ?? 'kinco') as BrandId
}

function brandUsesTorque(brandId: BrandId | 'all') {
  return brandId === 'robotis' || brandId === 'fastech'
}

function torqueSelectionLabel(value: number, brandId: BrandId) {
  const basis = brandId === 'fastech' ? '홀딩 토크' : '공개 토크'
  return value === 0 ? `${basis} 전체` : `${formatNumber(value)} Nm 이상 ${basis}`
}

function brandCatalogFor(id: BrandId) {
  return brandCatalogs.find((brand) => brand.id === id)!
}

function loadFavoriteMetadata() {
  try {
    const item = JSON.parse(window.localStorage.getItem(storageKeys.favoriteMetadata) ?? '{}')
    if (!item || typeof item !== 'object' || Array.isArray(item)) return {}
    return Object.fromEntries(Object.entries(item).flatMap(([id, metadata]) => {
      if (!metadata || typeof metadata !== 'object') return []
      const { status, note } = metadata as Partial<FavoriteMetadata>
      if (!['reviewing', 'candidate', 'selected'].includes(status ?? '')) return []
      return [[id, { status: status as FavoriteStatus, note: typeof note === 'string' ? note : '' }]]
    })) as Record<string, FavoriteMetadata>
  } catch {
    return {}
  }
}

function loadDrivePairings() {
  try {
    const item = JSON.parse(window.localStorage.getItem(storageKeys.drivePairings) ?? '{}')
    if (!item || typeof item !== 'object' || Array.isArray(item)) return {}
    return Object.fromEntries(Object.entries(item).flatMap(([productId, driveKey]) => typeof driveKey === 'string' && driveKey ? [[productId, driveKey]] : [])) as Record<string, string>
  } catch {
    return {}
  }
}

function isBomItemStatus(value: unknown): value is BomItemStatus {
  return bomStatusOptions.some((option) => option.value === value)
}

function loadBomProjects() {
  try {
    const item = JSON.parse(window.localStorage.getItem(storageKeys.bomProjects) ?? '[]')
    if (!Array.isArray(item)) return []
    return item.flatMap((project): BomProject[] => {
      if (!project || typeof project !== 'object') return []
      const candidate = project as Partial<BomProject>
      if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string' || typeof candidate.createdAt !== 'string' || !Array.isArray(candidate.items)) return []
      const items = candidate.items.flatMap((entry): BomItem[] => {
        if (!entry || typeof entry !== 'object') return []
        const bomItem = entry as Partial<BomItem>
        if (
          typeof bomItem.id !== 'string' ||
          typeof bomItem.motor !== 'string' ||
          typeof bomItem.drive !== 'string' ||
          typeof bomItem.motorUrl !== 'string' ||
          typeof bomItem.driveUrl !== 'string' ||
          typeof bomItem.leadDate !== 'string' ||
          typeof bomItem.note !== 'string' ||
          (bomItem.kind !== 'motor-drive' && bomItem.kind !== 'accessory') ||
          typeof bomItem.quantity !== 'number' ||
          !Number.isInteger(bomItem.quantity) ||
          bomItem.quantity < 1 ||
          bomItem.quantity > 10_000 ||
          typeof bomItem.unitPrice !== 'number' ||
          !Number.isFinite(bomItem.unitPrice) ||
          bomItem.unitPrice < 0 ||
          bomItem.unitPrice > 1_000_000_000 ||
          !isBomItemStatus(bomItem.status)
        ) return []
        return [{ id: bomItem.id, kind: bomItem.kind, motor: bomItem.motor, drive: bomItem.drive, motorUrl: bomItem.motorUrl, driveUrl: bomItem.driveUrl, quantity: bomItem.quantity, status: bomItem.status, unitPrice: bomItem.unitPrice, leadDate: bomItem.leadDate, note: bomItem.note }]
      })
      return [{ id: candidate.id, name: candidate.name.slice(0, 80), note: typeof candidate.note === 'string' ? candidate.note.slice(0, 500) : '', createdAt: candidate.createdAt, items: items.slice(0, 200) }]
    }).slice(0, 20)
  } catch {
    return []
  }
}

function bomId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function newBomProject(name: string): BomProject {
  const date = new Date().toLocaleDateString('ko-KR').replace(/\./g, '').replace(/\s+/g, '-')
  return { id: bomId('project'), name: name.trim().slice(0, 80) || `새 프로젝트 ${date}`, note: '', createdAt: new Date().toISOString(), items: [] }
}

function loadSelectionPlans() {
  try {
    const item = JSON.parse(window.localStorage.getItem(storageKeys.selectionPlans) ?? '[]')
    if (!Array.isArray(item)) return []
    return item.flatMap((plan): SelectionPlan[] => {
      if (!plan || typeof plan !== 'object') return []
      const candidate = plan as Partial<SelectionPlan>
      const validCategory = candidate.categoryId === 'all' || categories.some((category) => category.id === candidate.categoryId)
      const manufacturer = selectionManufacturerOptions.some((option) => option.value === candidate.manufacturer) ? candidate.manufacturer as SelectionManufacturer : 'all'
      const validVoltage = selectionVoltageOptions.some((option) => option.value === candidate.voltage)
      const validProtocol = selectionProtocolOptions.some((option) => option.value === candidate.protocol)
      const validPower = isValidSelectionPower(candidate.powerFloor)
      if (!validCategory || !validVoltage || !validProtocol || !validPower || typeof candidate.id !== 'string' || typeof candidate.name !== 'string' || typeof candidate.createdAt !== 'string') return []
      return [{ id: candidate.id, name: candidate.name, createdAt: candidate.createdAt, manufacturer, categoryId: candidate.categoryId as CategoryId | 'all', voltage: candidate.voltage as SelectionVoltage, powerFloor: candidate.powerFloor as number, protocol: candidate.protocol as SelectionProtocol }]
    }).slice(0, 12)
  } catch {
    return []
  }
}

function toSearchText(product: MotorProduct) {
  const { specs } = product
  const category = categoryForProduct(product)
  return [
    product.brand,
    product.model,
    product.series,
    category.name,
    category.eyebrow,
    category.description,
    category.useCase,
    product.summary,
    ...product.tags,
    ...product.features,
    specs.ratedVoltage,
    specs.dcInputRange,
    specs.powerRange,
    specs.ratedTorqueText,
    specs.maxTorqueText,
    specs.torqueBasis,
    specs.ratedCurrentText,
    specs.maxCurrentText,
    specs.ratedSpeedText,
    specs.maxSpeedText,
    specs.gearRatio,
    specs.resolution,
    specs.baudRate,
    specs.physicalConnection,
    specs.feedback,
    specs.operatingModes,
    specs.inputCurrent,
    specs.continuousCurrent,
    specs.peakCurrent,
    specs.currentSummary,
    specs.ratedPower !== undefined ? `${specs.ratedPower} W` : undefined,
    ...(specs.ratedPowerOptions?.flatMap((value) => [`${value} W`, `${value}W`]) ?? []),
    specs.phase,
    specs.ipRating,
    specs.encoder,
    specs.brake,
    specs.safety,
    ...(specs.protocols ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()
    .replace(/[^0-9a-z가-힣]+/g, '')
}

function searchTerms(query: string) {
  return query
    .toLocaleLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^0-9a-z가-힣]+/g, ''))
    .filter(Boolean)
}

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000)
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toLocaleString('ko-KR') : value.toLocaleString('ko-KR', { maximumFractionDigits: 3 })
}

function ratedPowerLabel(specs: MotorSpecs) {
  if (specs.ratedPowerOptions?.length) return specs.ratedPowerOptions.map((value) => `${formatNumber(value)} W`).join(' · ')
  if (specs.ratedPower !== undefined) return `${formatNumber(specs.ratedPower)} W`
  return specs.powerRange ?? ''
}

function maxRatedPower(specs: MotorSpecs) {
  return specs.selectionMaxPower ?? (specs.ratedPowerOptions?.length ? Math.max(...specs.ratedPowerOptions) : specs.ratedPower ?? -1)
}

function selectionCapabilityLabel(value: number, brandId: BrandId) {
  if (brandUsesTorque(brandId)) return torqueSelectionLabel(value, brandId)
  return selectionPowerOptions.find((option) => option.value === value)?.label ?? `${formatNumber(value)} W 이상`
}

function metricLabel(text: string | undefined, value: number | undefined, unit: string) {
  return text ?? (value !== undefined ? `${formatNumber(value)} ${unit}` : '')
}

function ratedTorqueLabel(specs: MotorSpecs) {
  return metricLabel(specs.ratedTorqueText, specs.ratedTorque, 'Nm')
}

function maxTorqueLabel(specs: MotorSpecs) {
  return metricLabel(specs.maxTorqueText, specs.maxTorque, 'Nm')
}

function ratedCurrentLabel(specs: MotorSpecs) {
  return metricLabel(specs.ratedCurrentText, specs.ratedCurrent, 'A')
}

function maxCurrentLabel(specs: MotorSpecs) {
  return metricLabel(specs.maxCurrentText, specs.maxCurrent, 'A')
}

function ratedSpeedLabel(specs: MotorSpecs) {
  return metricLabel(specs.ratedSpeedText, specs.ratedSpeed, 'rpm')
}

function maxSpeedLabel(specs: MotorSpecs) {
  return metricLabel(specs.maxSpeedText, specs.maxSpeed, 'rpm')
}

function currentSummaryLabel(specs: MotorSpecs) {
  if (specs.currentSummary) return specs.currentSummary
  const rated = ratedCurrentLabel(specs)
  const maximum = maxCurrentLabel(specs)
  if (!rated && !maximum) return '—'
  return [rated && `정격 ${rated}`, maximum && `최대 ${maximum}`].filter(Boolean).join(' · ')
}

type ComparisonMetric = 'power' | 'rated-torque' | 'max-torque' | 'rated-speed' | 'max-speed' | 'voltage' | 'current' | 'encoder-brake' | 'protection'

function comparisonUnavailableLabel(product: MotorProduct, metric: ComparisonMetric) {
  const isMotorOnly = ['frameless', 'ac-servo', 'dc-servo', 'stepper'].includes(product.categoryId)

  if (product.categoryId === 'stepper') {
    if (metric === 'power') return '정격 출력(W) 미공개 · 홀딩 토크 기준'
    if (metric === 'rated-torque') return '정격 토크 미적용 · 홀딩 토크 기준'
    if (metric === 'max-torque') return '최대 토크 미공개 · 홀딩 토크 기준'
    if (metric === 'rated-speed' || metric === 'max-speed') return '드라이버 전압·부하 조건에 따라 결정'
    if (metric === 'voltage') return '모터 상전압은 드라이버·결선 조건에 따라 결정'
  }

  if (metric === 'encoder-brake' && isMotorOnly) return '모터 단품 · 엔코더/브레이크는 옵션 또는 드라이브 조합'
  if (metric === 'protection' && isMotorOnly) return '공식 사양표에 보호·안전 항목 별도 미기재'
  if (metric === 'current' && isMotorOnly) return '공식 사양표에 전류 수치 미공개'
  if (metric === 'voltage' && isMotorOnly) return '공식 사양표에 정격 전압 수치 미공개'
  return `공식 ${product.series} 사양표에 수치 미공개`
}

function comparisonValue(product: MotorProduct, metric: ComparisonMetric, value: string) {
  return value || comparisonUnavailableLabel(product, metric)
}

function comparisonSourceLabel(product: MotorProduct) {
  const manual = manualPdfFor(product)
  return manual
    ? `공식 ${manual.kind === 'selection-guide' ? '선정표' : '매뉴얼'} 대조 · ${manual.updatedOn}`
    : `${product.brand} 공식 제품 페이지 대조 · ${product.sourceChecked}`
}

function specsToRows(specs: MotorSpecs) {
  const rows: Array<[string, string]> = [
    ['정격 전압', specs.ratedVoltage ?? specs.dcInputRange ?? ''],
    ['출력', ratedPowerLabel(specs)],
    ['정격 토크', ratedTorqueLabel(specs)],
    ['최대 토크', maxTorqueLabel(specs)],
    ['토크 기준', specs.torqueBasis ?? ''],
    ['홀딩 토크', specs.holdingTorque !== undefined ? `${formatNumber(specs.holdingTorque)} Nm` : ''],
    ['입력 전류', specs.inputCurrent ?? ''],
    ['정격 전류', ratedCurrentLabel(specs)],
    ['연속 출력 전류', specs.continuousCurrent ?? ''],
    ['최대 전류', maxCurrentLabel(specs)],
    ['피크 출력 전류', specs.peakCurrent ?? ''],
    ['정격 속도', ratedSpeedLabel(specs)],
    ['최대 속도', maxSpeedLabel(specs)],
    ['감속비', specs.gearRatio ?? ''],
    ['상수', specs.phase ?? ''],
    ['플랜지', specs.flangeText ?? (specs.flange !== undefined ? `${formatNumber(specs.flange)} mm` : '')],
    ['상 저항', specs.phaseResistance ?? ''],
    ['상 인덕턴스', specs.phaseInductance ?? ''],
    ['관성', specs.inertiaText ?? (specs.inertia !== undefined ? `${formatNumber(specs.inertia)} kg·cm²` : '')],
    ['리드 수', specs.leads !== undefined ? `${formatNumber(specs.leads)}` : ''],
    ['샤프트', specs.shaft ?? ''],
    ['길이', specs.length !== undefined ? `${formatNumber(specs.length)} mm` : ''],
    ['질량', specs.weight !== undefined ? `${formatNumber(specs.weight)} kg` : ''],
    ['스텝각', specs.stepAngle !== undefined ? `${formatNumber(specs.stepAngle)}°` : ''],
    ['보호 등급', specs.ipRating ?? ''],
    ['엔코더', specs.encoder ?? ''],
    ['분해능', specs.resolution ?? ''],
    ['브레이크', specs.brake ?? ''],
    ['통신', specs.protocols?.join(' · ') ?? ''],
    ['물리 통신', specs.physicalConnection ?? ''],
    ['통신 속도', specs.baudRate ?? ''],
    ['피드백', specs.feedback ?? ''],
    ['제어 모드', specs.operatingModes ?? ''],
    ['안전 기능', specs.safety ?? ''],
    ['사용 온도', specs.operatingTemperature ?? ''],
  ]
  return rows.filter(([, value]) => value)
}

function capacityLabel(product: MotorProduct) {
  const { specs } = product
  const ratedPower = ratedPowerLabel(specs)
  if (ratedPower) return ratedPower
  if (specs.holdingTorque !== undefined) return `홀딩 ${formatNumber(specs.holdingTorque)} Nm`
  if (specs.ratedTorque !== undefined) return `${formatNumber(specs.ratedTorque)} Nm`
  if (maxTorqueLabel(specs)) return maxTorqueLabel(specs)
  return '공식 사양표 확인'
}

function voltageLabel(product: MotorProduct) {
  return product.specs.ratedVoltage ?? product.specs.dcInputRange
}

function hasRecordedCapacity(product: MotorProduct) {
  return Boolean(ratedPowerLabel(product.specs)) || product.specs.holdingTorque !== undefined || product.specs.ratedTorque !== undefined || Boolean(maxTorqueLabel(product.specs))
}

function modelPowerLabel(product: MotorProduct) {
  if (product.brand === 'ROBOTIS') {
    const torque = ratedTorqueLabel(product.specs) || maxTorqueLabel(product.specs)
    return [voltageLabel(product), torque].filter(Boolean).join(' · ')
  }
  return [voltageLabel(product), hasRecordedCapacity(product) ? capacityLabel(product) : undefined].filter(Boolean).join(' · ')
}

function modelFeatureLabel(product: MotorProduct) {
  return product.features.slice(0, 3).join(' · ') || product.summary
}

function communicationLabel(product: MotorProduct) {
  const protocols = product.specs.protocols
  if (protocols?.length) return protocols.join(' · ')

  if (['frameless', 'ac-servo', 'dc-servo', 'stepper'].includes(product.categoryId)) {
    return '모터 단품 · 호환 드라이브 통신 방식 적용'
  }

  return `${product.brand} 공식 통신 사양 확인`
}

function selectionReasons(product: MotorProduct, categoryId: CategoryId | 'all', voltage: SelectionVoltage, powerFloor: number, protocol: SelectionProtocol) {
  const reasons: string[] = []
  if (categoryId !== 'all') reasons.push(`${categoryForProduct(product).name} 유형`)
  if (voltage !== 'all') reasons.push(`${selectionVoltageOptions.find((item) => item.value === voltage)?.label} 전원`)
  if (powerFloor > 0) reasons.push(product.brand === 'ROBOTIS' ? `${formatNumber(powerFloor)} Nm 이상 공개 토크` : product.brand === 'FASTECH' ? `${formatNumber(powerFloor)} Nm 이상 홀딩 토크` : `${powerFloor.toLocaleString('ko-KR')} W 이상 용량`)
  if (protocol !== 'all') reasons.push(`${selectionProtocolOptions.find((item) => item.value === protocol)?.label} 통신`)
  return reasons.length ? reasons : [modelFeatureLabel(product)]
}

function selectionCriteriaLabel(criteria: SelectionCriteria, brandId: BrandId = 'kinco') {
  const criteriaBrandId = criteria.manufacturer === 'all' ? brandId : criteria.manufacturer
  return [
    criteria.manufacturer !== 'all' ? selectionManufacturerOptions.find((item) => item.value === criteria.manufacturer)?.label : undefined,
    criteria.categoryId !== 'all' ? categoryForBrand(criteriaBrandId, criteria.categoryId).name : undefined,
    criteria.voltage !== 'all' ? selectionVoltageOptions.find((item) => item.value === criteria.voltage)?.label : undefined,
    criteria.powerFloor > 0 ? selectionCapabilityLabel(criteria.powerFloor, criteriaBrandId) : undefined,
    criteria.protocol !== 'all' ? selectionProtocolOptions.find((item) => item.value === criteria.protocol)?.label : undefined,
  ].filter(Boolean).join(' · ')
}

function comparisonTorqueCapacity(product: MotorProduct) {
  return product.specs.maxTorque ?? product.specs.ratedTorque ?? product.specs.holdingTorque ?? -1
}

function comparisonConclusion(products: MotorProduct[]) {
  const rankedByCapability = [...products].sort((left, right) => {
    const outputDifference = maxRatedPower(right.specs) - maxRatedPower(left.specs)
    if (outputDifference !== 0) return outputDifference
    const torqueDifference = comparisonTorqueCapacity(right) - comparisonTorqueCapacity(left)
    if (torqueDifference !== 0) return torqueDifference
    return (right.specs.protocols?.length ?? 0) - (left.specs.protocols?.length ?? 0)
  })
  const primary = rankedByCapability[0]
  const primaryOutput = maxRatedPower(primary.specs)
  const primaryTorque = comparisonTorqueCapacity(primary)
  const primaryReason = primaryOutput >= 0
    ? `공개된 최대 정격 출력 ${formatNumber(primaryOutput)} W로 비교 후보 중 출력 여유가 가장 큽니다.`
    : primaryTorque >= 0
      ? `공개된 토크 ${formatNumber(primaryTorque)} Nm 기준으로 비교 후보 중 구동 여유가 가장 큽니다.`
      : '현재 비교 후보 중 공개된 사양 항목을 우선 기준으로 확인할 모델입니다.'

  const alternative = products
    .filter((product) => product.id !== primary.id)
    .sort((left, right) => {
      const protocolDifference = (right.specs.protocols?.length ?? 0) - (left.specs.protocols?.length ?? 0)
      if (protocolDifference !== 0) return protocolDifference
      return maxRatedPower(right.specs) - maxRatedPower(left.specs)
    })[0]
  const alternativeProtocols = alternative?.specs.protocols ?? []
  const alternativeReason = alternative
    ? alternativeProtocols.length > 0
      ? `통신 방식 ${alternativeProtocols.join(' · ')}을 우선할 때 검토할 대안입니다.`
      : `출력·토크 요구가 1순위보다 낮거나 다른 설치 조건일 때 검토할 대안입니다.`
    : ''

  const voltageValues = [...new Set(products.map((product) => voltageLabel(product)).filter(Boolean))]
  const protocolValues = [...new Set(products.map((product) => communicationLabel(product)))]
  const cautions: string[] = []
  if (voltageValues.length > 1) cautions.push(`전원 조건이 다릅니다: ${voltageValues.join(' / ')}. 전원·드라이브 호환 조합을 먼저 고정하세요.`)
  if (protocolValues.length > 1) cautions.push('통신 방식이 서로 달라 제어기·PLC·드라이브의 실제 통신 옵션을 모델 코드 기준으로 확인해야 합니다.')
  if (!cautions.length) cautions.push('감속기 비율, 엔코더·브레이크 옵션, 가감속 부하 조건은 같은 시리즈라도 모델 코드별로 다시 확인해야 합니다.')

  return { primary, primaryReason, alternative, alternativeReason, cautions }
}

function sharedSelectionUrl(criteria: SelectionCriteria, brandId: BrandId) {
  const url = new URL(window.location.href)
  url.hash = new URLSearchParams({
    selection: '1',
    brand: brandId,
    manufacturer: criteria.manufacturer,
    category: criteria.categoryId,
    voltage: criteria.voltage,
    power: String(criteria.powerFloor),
    protocol: criteria.protocol,
  }).toString()
  return url.toString()
}

function sharedSelectionText(plan: SelectionPlan, url: string, brandId: BrandId) {
  return [
    '[Magicup-Work-Flow | 모터 선정안]',
    plan.name,
    `제조사 라이브러리: ${brandCatalogFor(brandId).name}`,
    `선정 조건: ${selectionCriteriaLabel(plan, brandId)}`,
    '',
    `추천 결과 링크: ${url}`,
    '공식 공개 사양을 기준으로 모델을 다시 추천합니다.',
  ].join('\n')
}

function sharedModelUrl(product: MotorProduct) {
  const url = new URL(window.location.href)
  url.hash = new URLSearchParams({ model: product.id }).toString()
  return url.toString()
}

function sharedModelText(product: MotorProduct, url: string) {
  const category = categoryForProduct(product)
  const specifications = specsToRows(product.specs).map(([label, value]) => `${label}: ${value}`)
  return [
    '[Magicup-Work-Flow | 모터 사양]',
    `제조사: ${product.brand}`,
    `${product.model} · ${product.series}`,
    `제품군: ${category.name}`,
    '',
    ...specifications,
    '',
    `핵심 특징: ${modelFeatureLabel(product)}`,
    `공식 제품 페이지: ${product.officialUrl}`,
    `상세 사양 링크: ${url}`,
    `공식 사양 확인일: ${product.sourceChecked} (KST)`,
  ].join('\n')
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', '')
  textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0'
  document.body.append(textArea)
  textArea.select()
  const copied = document.execCommand('copy')
  textArea.remove()
  if (!copied) throw new Error('Clipboard copy failed')
}

function clearSharedModelHash() {
  const hash = new URLSearchParams(window.location.hash.slice(1))
  if (!hash.has('model')) return
  hash.delete('model')
  const nextHash = hash.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ''}`)
}

function clearSharedSelectionHash() {
  const hash = new URLSearchParams(window.location.hash.slice(1))
  if (!hash.has('selection')) return
  ;['selection', 'brand', 'category', 'voltage', 'power', 'protocol'].forEach((key) => hash.delete(key))
  const nextHash = hash.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ''}`)
}

function operatingSummary(product: MotorProduct) {
  const { specs } = product
  return [
    specs.ratedVoltage ?? specs.dcInputRange,
    capacityLabel(product),
    ratedTorqueLabel(specs) ? `정격 토크 ${ratedTorqueLabel(specs)}` : undefined,
    specs.holdingTorque !== undefined ? `홀딩 토크 ${formatNumber(specs.holdingTorque)} Nm` : undefined,
    ratedSpeedLabel(specs) ? `정격 속도 ${ratedSpeedLabel(specs)}` : undefined,
  ].filter(Boolean).join(' · ')
}

function categoryFor(id: CategoryId) {
  return categories.find((category) => category.id === id)!
}

function categoryForProduct(product: MotorProduct) {
  return categoryForBrand(brandIdForProduct(product), product.categoryId)
}

function Metric({ label, value, unit }: { label: string; value: string | number | undefined; unit?: string }) {
  if (value === undefined || value === '') return null
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{typeof value === 'number' ? formatNumber(value) : value}<small>{unit}</small></strong>
    </div>
  )
}

interface ProductCardProps {
  product: MotorProduct
  favorite: boolean
  compared: boolean
  onSelect: (product: MotorProduct) => void
  onFavorite: (id: string) => void
  onCompare: (id: string) => void
  onOpenOfficial: (product: MotorProduct) => void
}

function ProductThumbnail({ product }: { product: MotorProduct }) {
  const image = productImageFor(product)
  const [imageAvailable, setImageAvailable] = useState(Boolean(image))

  if (image && imageAvailable) {
    return (
      <figure className="product-thumbnail">
        <img src={image.src} alt={image.alt} loading="lazy" decoding="async" onError={() => setImageAvailable(false)} />
      </figure>
    )
  }

  return (
    <span className="product-thumbnail is-placeholder" role="img" aria-label={`${product.series} 공식 제품 이미지 미공개`}>
      <Icon name="spark" size={25} />
    </span>
  )
}

function CategoryThumbnail({ categoryId, categoryName, brand }: { categoryId: CategoryId; categoryName: string; brand: BrandId }) {
  const image = categoryProductImageFor(categoryId, brand)
  const [imageAvailable, setImageAvailable] = useState(Boolean(image))

  if (image && imageAvailable) {
    return (
      <figure className="category-card-thumbnail">
        <img src={image.src} alt={`${categoryName} 대표 제품: ${image.alt}`} loading="lazy" decoding="async" onError={() => setImageAvailable(false)} />
      </figure>
    )
  }

  return <span className="category-card-thumbnail is-placeholder" role="img" aria-label={`${categoryName} 대표 제품 이미지 미공개`}><Icon name="spark" size={22} /></span>
}

function ProductCard({ product, favorite, compared, onSelect, onFavorite, onCompare, onOpenOfficial }: ProductCardProps) {
  const category = categoryForProduct(product)
  const { specs } = product
  const power = modelPowerLabel(product)
  const driveCompatibility = driveCompatibilityFor(product)
  const hasPublishedProtocols = (specs.protocols?.length ?? 0) > 0
  const needsFeatureSummary = !power || !hasPublishedProtocols
  const isRobotis = product.brand === 'ROBOTIS'
  const isFastech = product.brand === 'FASTECH'
  const isTorqueProduct = isRobotis || isFastech
  return (
    <article className={`motor-card accent-${category.accent}`}>
      <button className="card-open-area" aria-label={`${product.model} ${isFastech ? '하위 모델 선택' : '상세 보기'}`} onClick={() => onSelect(product)} />
      <div className="card-topline">
        <span className="category-pill">{category.name}</span>
        <button className={`icon-button card-action ${favorite ? 'is-active' : ''}`} aria-label={`${product.model} 즐겨찾기`} onClick={() => onFavorite(product.id)}>
          <Icon name="bookmark" size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="motor-card-copy">
        <div className="model-title-block">
          <p className="series-label">{product.brand} · {product.series}{product.lifecycle && <span className={`product-lifecycle is-${product.lifecycle}`}>{product.lifecycle === 'legacy' ? '레거시 자료' : '현재 라인업'}</span>}</p>
          <h3>{product.model}</h3>
        </div>
        <ProductThumbnail product={product} />
        <p className="product-card-summary">{product.summary}</p>
      </div>
      <div className="product-card-specs">
        {power && <div className="product-card-power"><span>{isRobotis ? '전압 · 공개 토크' : isFastech ? '전압 · 홀딩 토크' : '전압 · 용량'}</span><strong>{power}</strong></div>}
        {isTorqueProduct && specs.torqueBasis && <div className="product-card-torque-basis"><span>토크 기준</span><strong>{specs.torqueBasis}</strong></div>}
        <div className="product-card-protocol"><span>통신 방식</span><strong>{communicationLabel(product)}</strong></div>
        <div className={`product-card-drive is-${driveCompatibility.requirement}`}><span>드라이브</span><strong>{driveCompatibility.badge}</strong></div>
        {needsFeatureSummary && <div className="product-card-feature"><span>핵심 특징</span><strong>{modelFeatureLabel(product)}</strong></div>}
      </div>
      <div className="card-actions">
        <button className={`compare-button ${compared ? 'is-selected' : ''}`} onClick={() => onCompare(product.id)}>
          <Icon name={compared ? 'check' : 'grid'} size={16} />
          {compared ? '비교함에 담김' : '비교하기'}
        </button>
        <button className="official-link" onClick={() => onOpenOfficial(product)}>
          공식 페이지 <Icon name="arrow-up-right" size={16} />
        </button>
      </div>
    </article>
  )
}

function ManualPanel({ product, onOpenManual, onOpenOfficial, onOpenDrawing }: { product: MotorProduct; onOpenManual: (product: MotorProduct) => void; onOpenOfficial: (product: MotorProduct) => void; onOpenDrawing: (product: MotorProduct, drawing: DrawingArchive) => void }) {
  const category = categoryForProduct(product)
  const manual = manualPdfFor(product)
  const drawings = drawingArchivesFor(product)
  const hasDrawingPages = drawings.some((drawing) => drawing.kind === 'page')

  return (
    <div className="manual-panel">
      <section className="manual-card manual-original">
        {manual ? <>
          <p className="section-eyebrow">{manual.fileExtension === 'zip' ? 'ORIGINAL MANUAL ARCHIVE' : 'ORIGINAL PDF'}</p>
          <h4>{product.brand} 공식 {manualFileLabel(manual)}</h4>
          <p>버튼을 누르면 제조사 공식 다운로드 서버의 원문 PDF를 새 창으로 엽니다.</p>
          <dl className="manual-source-list">
            <div><dt>문서명</dt><dd>{manual.title}</dd></div>
            <div><dt>문서 종류</dt><dd>{manualKindLabel(manual.kind)}</dd></div>
            <div><dt>공식 갱신일</dt><dd>{manual.updatedOn} (KST)</dd></div>
            <div><dt>파일 크기</dt><dd>{manual.fileSize}</dd></div>
          </dl>
          <button className="button primary manual-open" onClick={() => onOpenManual(product)}>
            원문 {manualFileLabel(manual)} 열기 <Icon name="arrow-up-right" size={17} />
          </button>
        </> : <>
        <p className="section-eyebrow">ORIGINAL MANUAL</p>
        <h4>{product.brand} 공식 원문 · {product.series}</h4>
        <p>이 모델은 제조사 공식 제품 페이지 또는 자료실에서 원문 매뉴얼과 도면을 확인합니다.</p>
        <dl className="manual-source-list">
          <div><dt>제품군</dt><dd>{category.name}</dd></div>
          <div><dt>모델</dt><dd>{product.model}</dd></div>
          <div><dt>원문 기준일</dt><dd>{product.sourceChecked} (KST)</dd></div>
        </dl>
        <button className="button primary manual-open" onClick={() => onOpenOfficial(product)}>
          공식 제품 페이지 열기 <Icon name="arrow-up-right" size={17} />
        </button>
        </>}
      </section>
      <section className="manual-card manual-translation">
        <p className="section-eyebrow">KOREAN GUIDE</p>
        <h4>한글 요약 번역</h4>
        <ul>
          <li><strong>적용:</strong> {product.summary}</li>
          <li><strong>확인된 공개 사양:</strong> {operatingSummary(product)}</li>
          <li><strong>시운전 전:</strong> 정격 전원, 호환 드라이브, 엔코더·브레이크 옵션 및 통신 방식을 원문 매뉴얼과 대조합니다.</li>
        </ul>
        <p className="translation-note">이 화면의 한글은 공개 제품 정보를 기준으로 한 요약 번역입니다. 배선도, 파라미터, 경고·안전 절차는 반드시 제조사 원문 매뉴얼을 기준으로 적용하세요.</p>
      </section>
      <section className="manual-card manual-drawing">
        <p className="section-eyebrow">{hasDrawingPages ? 'OFFICIAL DRAWING' : 'DWG · DRAWING ZIP'}</p>
        <h4>{product.brand} 공식 {hasDrawingPages ? '모터 사양·도면' : 'DWG Drawing 파일'}</h4>
        <p>{hasDrawingPages ? '제조사가 공개한 모터 사양·치수 도면 페이지입니다. 프레임 크기와 옵션을 선택해 해당 제품의 기구 도면을 확인하세요.' : '제품 치수·장착 도면이 포함된 제조사 공식 파일입니다. 제품의 IP 등급과 기구 형상을 확인한 뒤 맞는 파일을 선택하세요.'}</p>
        {drawings.length > 0 ? <div className="drawing-downloads">
            {drawings.map((drawing) => <button key={drawing.id} className="drawing-download" onClick={() => onOpenDrawing(product, drawing)}>
              <span><strong>{drawing.title}</strong><small>{drawing.updatedOn} (KST) · {drawing.fileSize}</small></span>
              <span>{drawing.kind === 'page' ? '공식 도면·사양 열기' : 'DWG ZIP 다운로드'} <Icon name="arrow-up-right" size={17} /></span>
            </button>)}
          </div> : <div className="drawing-unavailable">
            <p>이 제품은 현재 등록된 공식 Drawing ZIP이 없습니다. 제조사 제품 페이지 또는 자료실에서 도면 공개 여부를 확인하세요.</p>
            <button className="button secondary" onClick={() => onOpenOfficial(product)}>공식 제품 페이지 확인 <Icon name="arrow-up-right" size={17} /></button>
          </div>}
      </section>
    </div>
  )
}

function driveMatchKey(item: DriveMatch) {
  return `${item.family}:${item.model}`
}

function drivePairingStatusLabel(status: DriveMatch['status']) {
  if (status === 'integrated') return '통합 구동 구성'
  if (status === 'spec-match') return '공개 사양 기준 1차 적합'
  return '구매 전 기술 확인 필요'
}

function drivePairingText(product: MotorProduct, item: DriveMatch) {
  return [
    `${product.brand} MOTOR + DRIVE CONFIGURATION`,
    `모터: ${product.model} (${product.series})`,
    `드라이브: ${item.family} · ${item.model}`,
    `판정: ${drivePairingStatusLabel(item.status)}`,
    `드라이브 사양: ${item.specifications.join(' | ')}`,
    `일치 근거: ${item.reasons.join(' | ')}`,
    item.cautions.length ? `최종 확인: ${item.cautions.join(' | ')}` : '',
    `공식 드라이브 페이지: ${item.officialUrl}`,
    `공개 사양 확인일: ${item.sourceChecked} (KST)`,
  ].filter(Boolean).join('\n')
}

function DriveCompatibilityPanel({ product, onOpenDrive, selectedDriveKey, onSelectDrive, onCopyPairing, onAddToBom }: { product: MotorProduct; onOpenDrive: (url: string) => void; selectedDriveKey?: string; onSelectDrive: (productId: string, driveKey: string | null) => void; onCopyPairing: (product: MotorProduct, item: DriveMatch) => void; onAddToBom: (product: MotorProduct, item: DriveMatch) => void }) {
  const compatibility = driveCompatibilityFor(product)
  const selectedDrive = compatibility.matches.find((item) => driveMatchKey(item) === selectedDriveKey) ?? (compatibility.requirement === 'integrated' ? compatibility.matches[0] : undefined)

  return (
    <section className={`drive-matching is-${compatibility.requirement}`} aria-label="호환 드라이브 매칭">
      <div className="drive-matching-head">
        <div>
          <p className="section-eyebrow">DRIVE MATCH</p>
          <h3>{compatibility.heading}</h3>
          <p>{compatibility.description}</p>
        </div>
        <span className={`drive-requirement is-${compatibility.requirement}`}>{compatibility.badge}</span>
      </div>
      <div className="drive-check-list" aria-label="매칭 확인 항목">
        {compatibility.checks.map((check) => <span key={check}><Icon name="check" size={14} />{check}</span>)}
      </div>
      <div className="drive-match-grid">
        {compatibility.matches.map((item) => {
          const isSelected = selectedDrive ? driveMatchKey(item) === driveMatchKey(selectedDrive) : false
          return <article key={`${item.family}-${item.model}`} className={`drive-match-card is-${item.status}${isSelected ? ' is-selected' : ''}`}>
          <div className="drive-match-card-head"><span>{item.label}</span><strong>{item.family}</strong></div>
          <h4>{item.model}</h4>
          <p>{item.summary}</p>
          <ul className="drive-match-specs">
            {item.specifications.map((specification) => <li key={specification}>{specification}</li>)}
          </ul>
          <div className="drive-match-reasons">
            <b>일치 근거</b>
            {item.reasons.map((reason) => <span key={reason}><Icon name="check" size={13} />{reason}</span>)}
          </div>
          {item.cautions.length > 0 && <div className="drive-match-cautions">
            <b>최종 확인</b>
            {item.cautions.map((caution) => <span key={caution}>{caution}</span>)}
          </div>}
          <button className="text-link drive-official-link" onClick={() => onOpenDrive(item.officialUrl)}>
            공식 드라이브 페이지 <Icon name="arrow-up-right" size={15} />
          </button>
          {compatibility.requirement === 'external' && <button className={`drive-select-button ${isSelected ? 'is-selected' : ''}`} onClick={() => onSelectDrive(product.id, driveMatchKey(item))}>
            <Icon name={isSelected ? 'check' : 'grid'} size={15} />{isSelected ? '선택된 드라이브' : '이 드라이브로 조합'}
          </button>}
          <small>공개 사양 확인: {item.sourceChecked} (KST)</small>
        </article>
        })}
      </div>
      {selectedDrive ? <section className={`drive-pairing-summary is-${selectedDrive.status}`} aria-label="선택 조합 확인">
        <div className="drive-pairing-summary-head">
          <div><p className="section-eyebrow">CONFIGURATION CHECK</p><h4>모터 + 드라이브 조합</h4></div>
          <span>{drivePairingStatusLabel(selectedDrive.status)}</span>
        </div>
        <p><strong>{product.model}</strong><b>+</b><strong>{selectedDrive.family} · {selectedDrive.model}</strong></p>
        <div className="drive-pairing-verdict">
          <Icon name={selectedDrive.status === 'attention' ? 'spark' : 'check'} size={17} />
          <span>{selectedDrive.status === 'attention' ? '공개 사양만으로 주문 조합을 확정할 수 없습니다. 최종 주문 코드와 기술 조건을 확인하세요.' : '공개 사양의 전압·출력·전류 조건을 기준으로 구성한 조합입니다. 주문 전 옵션 코드를 최종 확인하세요.'}</span>
        </div>
        <div className="drive-pairing-actions">
          <button className="button secondary" onClick={() => onCopyPairing(product, selectedDrive)}><Icon name="share" size={16} />조합표 복사</button>
          <button className="button secondary" onClick={() => onAddToBom(product, selectedDrive)}><Icon name="grid" size={16} />프로젝트 BOM 담기</button>
          {compatibility.requirement === 'external' && <button className="button secondary" onClick={() => onSelectDrive(product.id, null)}>선택 해제</button>}
        </div>
        {compatibility.requirement === 'external' && <small>선택한 조합은 이 기기에 자동 저장됩니다.</small>}
      </section> : <div className="drive-pairing-empty"><Icon name="grid" size={18} /><span>후보 드라이브를 선택하면 이곳에서 조합 적합 상태를 확정·저장할 수 있습니다.</span></div>}
      <p className="drive-match-note"><strong>판정 기준:</strong> “공개 사양 일치”는 전압·출력·전류 범위를 대조한 후보이며, “추가 확인”은 권선·엔코더·브레이크·주문 코드 확인이 필요한 조합입니다.</p>
    </section>
  )
}

function BomProjectModal({ projects, activeProjectId, exportPending, onClose, onSelectProject, onCreateProject, onDeleteProject, onUpdateProject, onAddAccessory, onUpdateItem, onRemoveItem, onExportProject }: { projects: BomProject[]; activeProjectId: string | null; exportPending: boolean; onClose: () => void; onSelectProject: (projectId: string) => void; onCreateProject: (name: string) => void; onDeleteProject: (projectId: string) => void; onUpdateProject: (projectId: string, patch: Partial<Pick<BomProject, 'name' | 'note'>>) => void; onAddAccessory: (projectId: string, name: string, quantity: number) => void; onUpdateItem: (projectId: string, itemId: string, patch: Partial<BomItem>) => void; onRemoveItem: (projectId: string, itemId: string) => void; onExportProject: (project: BomProject) => void }) {
  const [newProjectName, setNewProjectName] = useState('')
  const [accessoryName, setAccessoryName] = useState('')
  const [accessoryQuantity, setAccessoryQuantity] = useState('1')
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0]
  const totalCost = activeProject?.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0) ?? 0

  const createProject = () => {
    onCreateProject(newProjectName)
    setNewProjectName('')
  }
  const addAccessory = () => {
    if (!activeProject || !accessoryName.trim()) return
    const quantity = Math.min(10_000, Math.max(1, Math.floor(Number(accessoryQuantity) || 1)))
    onAddAccessory(activeProject.id, accessoryName, quantity)
    setAccessoryName('')
    setAccessoryQuantity('1')
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="bom-modal" role="dialog" aria-modal="true" aria-labelledby="bom-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="bom-modal-head">
        <div><p className="section-eyebrow">PROJECT BOM</p><h2 id="bom-title">프로젝트 BOM · 발주 관리</h2><p>확정한 모터+드라이브 조합과 부속품을 프로젝트별로 관리하고, 발주용 엑셀로 내보낼 수 있습니다.</p></div>
        <button className="icon-button" aria-label="프로젝트 BOM 닫기" onClick={onClose}><Icon name="x" /></button>
      </div>

      <div className="bom-project-bar">
        {projects.length > 0 && <label><span>현재 프로젝트</span><select value={activeProject?.id ?? ''} onChange={(event) => onSelectProject(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>}
        <div className="bom-create-project"><input value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} maxLength={80} placeholder="새 프로젝트명" onKeyDown={(event) => { if (event.key === 'Enter') createProject() }} /><button className="button secondary" onClick={createProject}>새 프로젝트</button></div>
      </div>

      {activeProject ? <>
        <div className="bom-project-fields">
          <label><span>프로젝트명</span><input value={activeProject.name} onChange={(event) => onUpdateProject(activeProject.id, { name: event.target.value.slice(0, 80) })} /></label>
          <label><span>프로젝트 메모</span><textarea value={activeProject.note} onChange={(event) => onUpdateProject(activeProject.id, { note: event.target.value.slice(0, 500) })} maxLength={500} placeholder="설치 위치, 견적 요청처, 구매 조건 등을 기록하세요." /></label>
        </div>
        <div className="bom-summary"><span>구성 품목 <strong>{activeProject.items.length}</strong></span><span>총 수량 <strong>{activeProject.items.reduce((total, item) => total + item.quantity, 0)}</strong></span><span>예상 구매액 <strong>{totalCost > 0 ? `${formatNumber(totalCost)} KRW` : '미입력'}</strong></span><button className="button primary" onClick={() => onExportProject(activeProject)} disabled={activeProject.items.length === 0 || exportPending}>{exportPending ? '엑셀 생성 중…' : 'BOM 엑셀 다운로드'} <Icon name="install" size={16} /></button></div>

        <div className="bom-table-wrap">
          <table className="bom-table">
            <thead><tr><th>구성</th><th>수량</th><th>구매 상태</th><th>견적 단가 (KRW)</th><th>입고 예정일</th><th>메모</th><th aria-label="삭제" /></tr></thead>
            <tbody>{activeProject.items.map((item) => <tr key={item.id}>
              <td><strong>{item.motor || '부속품'}</strong><small>{item.drive}</small></td>
              <td><input type="number" min="1" max="10000" value={item.quantity} onChange={(event) => onUpdateItem(activeProject.id, item.id, { quantity: Math.min(10_000, Math.max(1, Math.floor(Number(event.target.value) || 1))) })} /></td>
              <td><select value={item.status} onChange={(event) => onUpdateItem(activeProject.id, item.id, { status: event.target.value as BomItemStatus })}>{bomStatusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></td>
              <td><input type="number" min="0" max="1000000000" step="1000" value={item.unitPrice || ''} placeholder="미입력" onChange={(event) => onUpdateItem(activeProject.id, item.id, { unitPrice: Math.min(1_000_000_000, Math.max(0, Number(event.target.value) || 0)) })} /></td>
              <td><input type="date" value={item.leadDate} onChange={(event) => onUpdateItem(activeProject.id, item.id, { leadDate: event.target.value })} /></td>
              <td><input value={item.note} maxLength={160} placeholder="메모" onChange={(event) => onUpdateItem(activeProject.id, item.id, { note: event.target.value })} /></td>
              <td><button className="bom-remove" aria-label={`${item.motor || item.drive} 삭제`} onClick={() => onRemoveItem(activeProject.id, item.id)}><Icon name="x" size={15} /></button></td>
            </tr>)}</tbody>
          </table>
          {activeProject.items.length === 0 && <div className="bom-empty"><Icon name="grid" size={22} /><p>상세 화면에서 확정한 모터+드라이브 조합을 BOM에 담아보세요.</p></div>}
        </div>
        <div className="bom-accessory-add"><div><p className="section-eyebrow">ADD ACCESSORY</p><strong>케이블 · 브레이크 · 감속기 등 부속품 추가</strong></div><input value={accessoryName} onChange={(event) => setAccessoryName(event.target.value)} maxLength={100} placeholder="예: EtherCAT 케이블 5 m" /><input type="number" min="1" max="10000" value={accessoryQuantity} onChange={(event) => setAccessoryQuantity(event.target.value)} aria-label="부속품 수량" /><button className="button secondary" onClick={addAccessory} disabled={!accessoryName.trim()}>부속품 추가</button></div>
        <div className="bom-modal-actions"><small>저장 위치: 이 기기 브라우저</small><button className="text-button bom-delete-project" onClick={() => onDeleteProject(activeProject.id)}>현재 프로젝트 삭제</button></div>
      </> : <div className="bom-first-empty"><Icon name="grid" size={28} /><h3>프로젝트를 먼저 만들어 주세요.</h3><p>프로젝트를 만든 뒤 상세 화면의 “프로젝트 BOM 담기”로 조합을 추가할 수 있습니다.</p></div>}
    </section>
  </div>
}

interface ModelBrowserModalProps {
  category: ReturnType<typeof categoryFor>
  products: MotorProduct[]
  seriesName?: string | null
  onClose: () => void
  onSelect: (product: MotorProduct, fastechVariantId?: string) => void
}

function ModelBrowserModal({ category, products, seriesName, onClose, onSelect }: ModelBrowserModalProps) {
  const [filter, setFilter] = useState('')
  const [familyId, setFamilyId] = useState('all')
  const shouldAutoFocusModelSearch = window.matchMedia('(min-width: 761px)').matches
  const normalizedFilter = filter.trim().toLocaleLowerCase()
  const isDynamixelCatalog = products.every((product) => product.brand === 'ROBOTIS')
  const isFastechCatalog = products.length > 0 && products.every((product) => product.brand === 'FASTECH')
  const families = Array.from(new Set(products.flatMap((product) => product.family ? [product.family] : []))).sort(compareDynamixelFamilies)
  const visibleProducts = products
    .filter((product) => familyId === 'all' || product.family === familyId)
    .filter((product) => !normalizedFilter || `${product.model} ${product.series} ${capacityLabel(product)} ${(product.specs.protocols ?? []).join(' ')} ${product.features.join(' ')}`.toLocaleLowerCase().includes(normalizedFilter))
    .sort((a, b) => compareDynamixelFamilies(a.family ?? '', b.family ?? '') || maxRatedPower(b.specs) - maxRatedPower(a.specs) || a.model.localeCompare(b.model))
  const fastechVariants = products.flatMap((product) => fastechVariantsFor(product).map((variant) => ({ product, variant })))
  const visibleFastechVariants = fastechVariants.filter(({ product, variant }) => !normalizedFilter || `${variant.model} ${product.series} ${product.specs.ratedVoltage ?? ''} ${variant.holdingTorque} Nm ${variant.phaseCurrent} A ${(product.specs.protocols ?? []).join(' ')} ${product.features.join(' ')}`.toLocaleLowerCase().includes(normalizedFilter))
  const menuTitle = seriesName ? `${seriesName} 모델 선택` : `${category.name} 모델 선택`
  const menuCount = isFastechCatalog ? fastechVariants.length : products.length

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`model-browser accent-${category.accent}`} role="dialog" aria-modal="true" aria-labelledby="model-browser-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="model-browser-head">
          <div>
            <p className="section-eyebrow">MODEL & CAPACITY</p>
            <h2 id="model-browser-title">{menuTitle}</h2>
            <p>{menuCount}개 모델 · 하위 모델을 누르면 원문 매뉴얼과 한글 안내를 엽니다.</p>
          </div>
          <button className="icon-button" aria-label="모델 선택 창 닫기" onClick={onClose}><Icon name="x" /></button>
        </div>
        <label className="model-browser-search">
          <Icon name="search" size={18} />
          <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="모델명 · 용량 · 통신 방식 검색" autoFocus={shouldAutoFocusModelSearch} />
        </label>
        {isDynamixelCatalog && families.length > 1 && <div className="model-browser-family-filter" aria-label="DYNAMIXEL 하위 제품군 선택">
          <strong>하위 제품군</strong>
          <div>
            <button className={familyId === 'all' ? 'is-active' : ''} onClick={() => setFamilyId('all')}>전체 <span>{products.length}</span></button>
            {families.map((family) => <button key={family} className={familyId === family ? 'is-active' : ''} onClick={() => setFamilyId(family)}>{family}<span>{products.filter((product) => product.family === family).length}</span></button>)}
          </div>
        </div>}
        <div className="model-browser-list">
          {isFastechCatalog ? visibleFastechVariants.map(({ product, variant }: { product: MotorProduct; variant: FastechMotorVariant }) => {
            const variantProduct = { ...product, model: variant.model, specs: fastechVariantSpecs(product, variant) }
            const power = modelPowerLabel(variantProduct)
            return <button key={variant.id} className="model-menu-item" onClick={() => onSelect(product, variant.id)}>
              <span className="model-menu-main">
                <small>{product.brand} · {product.series}</small>
                <strong>{variant.model}</strong>
                <span className="model-menu-specs">
                  <span className="model-menu-power">{power}</span>
                  <dl className="model-menu-characteristics" aria-label={`${variant.model} 모터 특성`}>
                    <div><dt>프레임</dt><dd>□{variant.frameSize} mm</dd></div>
                    <div><dt>상전류</dt><dd>{formatNumber(variant.phaseCurrent)} A</dd></div>
                    <div><dt>로터 관성</dt><dd>{formatNumber(variant.rotorInertiaGcm2)} g·cm²</dd></div>
                    <div><dt>길이 · 중량</dt><dd>{formatNumber(variant.lengthMm)} mm · {formatNumber(variant.weightG)} g</dd></div>
                  </dl>
                  <span className="model-menu-protocol"><b>통신</b><span>{communicationLabel(product)}</span></span>
                </span>
              </span>
              <span className="model-menu-action">매뉴얼 보기 <Icon name="arrow-up-right" size={16} /></span>
            </button>
          }) : visibleProducts.map((product) => {
            const power = modelPowerLabel(product)
            const protocols = product.specs.protocols ?? []
            const needsFeatureSummary = !power || protocols.length === 0

            return <button key={product.id} className="model-menu-item" onClick={() => onSelect(product)}>
              <span className="model-menu-main">
                <small>{product.brand} · {product.series}</small>
                <strong>{product.model}</strong>
                <span className="model-menu-specs">
                  {power && <span className="model-menu-power">{power}</span>}
                  <span className="model-menu-protocol"><b>통신</b><span>{communicationLabel(product)}</span></span>
                  {needsFeatureSummary && <span className="model-menu-features"><b>핵심 특징</b><span>{modelFeatureLabel(product)}</span></span>}
                </span>
              </span>
              <span className="model-menu-action">매뉴얼 보기 <Icon name="arrow-up-right" size={16} /></span>
            </button>
          })}
          {(isFastechCatalog ? visibleFastechVariants.length === 0 : visibleProducts.length === 0) && <p className="model-browser-empty">일치하는 모델이 없습니다.</p>}
        </div>
      </section>
    </div>
  )
}

interface DetailModalProps {
  product: MotorProduct
  favorite: boolean
  compared: boolean
  initialTab: DetailTab
  initialFastechVariantId?: string
  onClose: () => void
  onBackToModels?: () => void
  onFavorite: (id: string) => void
  onCompare: (id: string) => void
  onShare: (product: MotorProduct) => void
  onDownloadSpecPdf: (product: MotorProduct) => void
  pdfDownloadPending: boolean
  onOpenOfficial: (product: MotorProduct) => void
  onOpenDrive: (url: string) => void
  selectedDriveKey?: string
  onSelectDrive: (productId: string, driveKey: string | null) => void
  onCopyPairing: (product: MotorProduct, item: DriveMatch) => void
  onAddToBom: (product: MotorProduct, item: DriveMatch) => void
  onOpenManual: (product: MotorProduct) => void
  onOpenDrawing: (product: MotorProduct, drawing: DrawingArchive) => void
}

function DetailModal({ product, favorite, compared, initialTab, initialFastechVariantId, onClose, onBackToModels, onFavorite, onCompare, onShare, onDownloadSpecPdf, pdfDownloadPending, onOpenOfficial, onOpenDrive, selectedDriveKey, onSelectDrive, onCopyPairing, onAddToBom, onOpenManual, onOpenDrawing }: DetailModalProps) {
  const category = categoryForProduct(product)
  const fastechVariants = fastechVariantsFor(product)
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab)
  const [selectedFastechVariantId, setSelectedFastechVariantId] = useState(initialFastechVariantId ?? fastechVariants[0]?.id ?? '')
  const selectedFastechVariant = fastechVariants.find((variant) => variant.id === selectedFastechVariantId) ?? fastechVariants[0]
  const rows = specsToRows(selectedFastechVariant ? fastechVariantSpecs(product, selectedFastechVariant) : product.specs)

  useEffect(() => setActiveTab(initialTab), [initialTab, product.id])
  useEffect(() => setSelectedFastechVariantId(initialFastechVariantId ?? fastechVariants[0]?.id ?? ''), [initialFastechVariantId, product.id])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className={`detail-hero accent-${category.accent}${onBackToModels ? ' has-return' : ''}`}>
          {onBackToModels && <button className="detail-return" onClick={onBackToModels}><span aria-hidden="true">←</span> 모델 목록</button>}
          <button className="icon-button detail-close" aria-label="상세 창 닫기" onClick={onClose}><Icon name="x" /></button>
          <span className="category-pill">{category.name}</span>
          <p className="series-label">{product.brand} · {product.series}</p>
          <h2 id="detail-title">{selectedFastechVariant?.model ?? product.model}</h2>
          {selectedFastechVariant && <p className="detail-selected-model">선택 하위 모델 · 홀딩 토크 {formatNumber(selectedFastechVariant.holdingTorque)} Nm · 상전류 {formatNumber(selectedFastechVariant.phaseCurrent)} A</p>}
          <p>{product.summary}</p>
          <div className="feature-list">
            {product.features.map((feature) => <span key={feature}><Icon name="check" size={15} />{feature}</span>)}
          </div>
        </div>
        <div className="detail-tabs" role="tablist" aria-label="상세 정보 전환">
          <button className={activeTab === 'specs' ? 'is-active' : ''} role="tab" aria-selected={activeTab === 'specs'} onClick={() => setActiveTab('specs')}>확인된 사양</button>
          <button className={activeTab === 'manual' ? 'is-active' : ''} role="tab" aria-selected={activeTab === 'manual'} onClick={() => setActiveTab('manual')}>원문 · 한글 안내</button>
        </div>
        <div className="detail-content">
          {activeTab === 'specs' ? <>
          <div className="detail-section-head">
            <div>
              <p className="section-eyebrow">SPECIFICATIONS</p>
              <h3>확인된 사양</h3>
            </div>
            <span className="source-mark">{product.sourceChecked} 확인</span>
          </div>
          <dl className="spec-list">
            {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <DriveCompatibilityPanel product={product} onOpenDrive={onOpenDrive} selectedDriveKey={selectedDriveKey} onSelectDrive={onSelectDrive} onCopyPairing={onCopyPairing} onAddToBom={onAddToBom} />
          <p className="source-note">{sourceLabel}. 값이 공개되지 않은 항목은 의도적으로 표시하지 않았습니다.</p>
          </> : <ManualPanel product={product} onOpenManual={onOpenManual} onOpenOfficial={onOpenOfficial} onOpenDrawing={onOpenDrawing} />}
        </div>
        <div className="detail-actions">
          <button className="button secondary pdf-download" onClick={() => onDownloadSpecPdf(product)} disabled={pdfDownloadPending}>
            <Icon name="install" size={17} /> {pdfDownloadPending ? 'PDF 생성 중...' : 'PDF 카드'}
          </button>
          <button className="button secondary share-button" onClick={() => onShare(product)}>
            <Icon name="share" size={17} /> 사양 공유
          </button>
          <button className={`button secondary ${favorite ? 'is-active' : ''}`} onClick={() => onFavorite(product.id)}>
            <Icon name="bookmark" size={17} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? '저장됨' : '즐겨찾기'}
          </button>
          <button className={`button secondary ${compared ? 'is-active' : ''}`} onClick={() => onCompare(product.id)}>
            <Icon name={compared ? 'check' : 'grid'} size={17} /> {compared ? '비교함에 담김' : '비교하기'}
          </button>
          <button className="button primary" onClick={() => onOpenOfficial(product)}>
            공식 제품 페이지 열기 <Icon name="arrow-up-right" size={17} />
          </button>
        </div>
      </section>
    </div>
  )
}

function ComparisonTray({ products, onRemove, onClear, onClose, onOpen, onDownload, downloadPending }: { products: MotorProduct[]; onRemove: (id: string) => void; onClear: () => void; onClose: () => void; onOpen: (product: MotorProduct) => void; onDownload: (products: MotorProduct[]) => void; downloadPending: boolean }) {
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false)
  const conclusion = comparisonConclusion(products)
  const rows = [
    ['정격 출력', (product: MotorProduct) => comparisonValue(product, 'power', ratedPowerLabel(product.specs))],
    ['정격 / 홀딩 토크', (product: MotorProduct) => comparisonValue(product, 'rated-torque', ratedTorqueLabel(product.specs) || (product.specs.holdingTorque !== undefined ? `${formatNumber(product.specs.holdingTorque)} Nm (홀딩)` : ''))],
    ['최대 토크', (product: MotorProduct) => comparisonValue(product, 'max-torque', maxTorqueLabel(product.specs))],
    ['정격 속도', (product: MotorProduct) => comparisonValue(product, 'rated-speed', ratedSpeedLabel(product.specs))],
    ['최대 속도', (product: MotorProduct) => comparisonValue(product, 'max-speed', maxSpeedLabel(product.specs))],
    ['정격 전압', (product: MotorProduct) => comparisonValue(product, 'voltage', product.specs.ratedVoltage ?? product.specs.dcInputRange ?? '')],
    ['전류 (입력 / 연속 / 피크)', (product: MotorProduct) => comparisonValue(product, 'current', currentSummaryLabel(product.specs) === '—' ? '' : currentSummaryLabel(product.specs))],
    ['통신 방식', (product: MotorProduct) => communicationLabel(product)],
    ['드라이브 구성', (product: MotorProduct) => {
      const compatibility = driveCompatibilityFor(product)
      const candidates = compatibility.matches.map((match) => `${match.family} ${match.model}`).join(' / ')
      return compatibility.requirement === 'integrated' ? compatibility.badge : `${compatibility.badge} · ${candidates}`
    }],
    ['엔코더 · 브레이크', (product: MotorProduct) => comparisonValue(product, 'encoder-brake', [product.specs.encoder, product.specs.brake].filter(Boolean).join(' · '))],
    ['보호 · 안전', (product: MotorProduct) => comparisonValue(product, 'protection', [product.specs.ipRating, product.specs.safety].filter(Boolean).join(' · '))],
    ['핵심 특징', (product: MotorProduct) => modelFeatureLabel(product)],
    ['사양 출처 상태', (product: MotorProduct) => comparisonSourceLabel(product)],
  ] as const
  const populatedRows = rows
    .map(([label, render]) => {
      const values = products.map((product) => render(product))
      return {
        label,
        values,
        hasDifference: new Set(values).size > 1,
        hasUnavailableValue: values.some((value) => value.includes('미공개') || value.includes('공개 사양 없음')),
      }
    })
    .filter((row) => row.values.some((value) => value !== '—'))
  const differencePriority = ['정격 전압', '정격 출력', '정격 / 홀딩 토크', '최대 토크', '정격 속도', '최대 속도', '전류 (입력 / 연속 / 피크)', '통신 방식', '엔코더 · 브레이크', '보호 · 안전']
  const keyDifferenceRows = populatedRows
    .filter((row) => row.hasDifference)
    .sort((left, right) => {
      const leftIndex = differencePriority.indexOf(left.label)
      const rightIndex = differencePriority.indexOf(right.label)
      return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
    })
    .slice(0, 3)
  const visibleRows = showDifferencesOnly ? populatedRows.filter((row) => row.hasDifference) : populatedRows

  return (
    <section className="compare-tray" aria-label="선택 모델 비교">
      <div className="compare-tray-head">
        <div><p className="section-eyebrow">COMPARE / {products.length} OF 3</p><h2>선택 모델 비교</h2></div>
        <div className="compare-tray-actions">
          <button className="comparison-export" onClick={() => onDownload(products)} disabled={downloadPending}>{downloadPending ? '엑셀 생성 중…' : '엑셀 다운로드'}</button>
          <button className="text-button comparison-close" onClick={onClose} aria-label="선택 모델 비교 닫기"><Icon name="x" size={14} />닫기</button>
          <button className="text-button" onClick={onClear}>모두 비우기</button>
        </div>
      </div>
      <section className="comparison-conclusion" aria-label="선정 결론 요약">
        <div className="comparison-conclusion-head"><span>SELECTION SUMMARY</span><small>공개 사양 기준의 빠른 검토 결과</small></div>
        <div className="comparison-conclusion-cards">
          <article>
            <span>{products.length > 1 ? '1순위 · 출력/토크 여유' : '현재 후보'}</span>
            <button className="comparison-conclusion-model" onClick={() => onOpen(conclusion.primary)}>{conclusion.primary.model}<Icon name="arrow-up-right" size={13} /></button>
            <p>{conclusion.primaryReason}</p>
          </article>
          {conclusion.alternative && <article>
            <span>대안 · 제어 연동/설치 조건</span>
            <button className="comparison-conclusion-model" onClick={() => onOpen(conclusion.alternative!)}>{conclusion.alternative.model}<Icon name="arrow-up-right" size={13} /></button>
            <p>{conclusion.alternativeReason}</p>
          </article>}
        </div>
        <div className="comparison-cautions"><strong>피해야 할 조합</strong><ul>{conclusion.cautions.map((caution) => <li key={caution}>{caution}</li>)}</ul></div>
      </section>
      <section className="comparison-insights" aria-label="핵심 차이 요약">
        <div className="comparison-insights-head">
          <span>KEY DIFFERENCES</span>
          <div className="comparison-insights-controls">
            <strong>{keyDifferenceRows.length ? `핵심 차이 ${keyDifferenceRows.length}개` : '공개 사양 차이 없음'}</strong>
            <button className={`difference-filter ${showDifferencesOnly ? 'is-active' : ''}`} onClick={() => setShowDifferencesOnly((current) => !current)} aria-pressed={showDifferencesOnly}>
              <Icon name="sliders" size={14} /> {showDifferencesOnly ? '전체 사양 보기' : '차이만 보기'}
            </button>
          </div>
        </div>
        {keyDifferenceRows.length > 0 ? <ul>
          {keyDifferenceRows.map((row) => <li key={row.label} className={row.hasUnavailableValue ? 'has-unavailable' : ''}>
            <strong>{row.label}</strong>
            <span className={`comparison-insight-values count-${products.length}`}>
              {row.values.map((value, index) => <span key={`${row.label}-${products[index].id}`}><small>{products[index].model}</small><b>{value}</b></span>)}
            </span>
          </li>)}
        </ul> : <p>선택한 모델의 공개 사양에서 비교 가능한 차이를 찾지 못했습니다.</p>}
      </section>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th scope="col">항목</th>{products.map((product) => <th scope="col" key={product.id}><button onClick={() => onOpen(product)}>{product.model}</button><button className="remove-model" aria-label={`${product.model} 비교함에서 제거`} onClick={() => onRemove(product.id)}><Icon name="x" size={14} /></button></th>)}</tr></thead>
          <tbody>{visibleRows.length > 0 ? visibleRows.map((row) => <tr key={row.label} className={`${row.hasDifference ? 'has-difference' : 'is-same'}${row.hasUnavailableValue ? ' has-unavailable' : ''}`}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={products[index].id}>{value}</td>)}</tr>) : <tr className="comparison-empty-row"><td colSpan={products.length + 1}>선택한 모델의 공개 사양에서 차이점을 찾지 못했습니다.</td></tr>}</tbody>
        </table>
      </div>
    </section>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [activeBrandId, setActiveBrandId] = useState<BrandId>(() => {
    const saved = window.localStorage.getItem(storageKeys.activeBrand)
    return brandCatalogs.some((brand) => brand.id === saved) ? saved as BrandId : 'kinco'
  })
  const [categoryId, setCategoryId] = useState<CategoryId | 'all'>('all')
  const [familyId, setFamilyId] = useState('all')
  const [robotisLineup, setRobotisLineup] = useState<RobotisLineup>('current')
  const [powerFloor, setPowerFloor] = useState(0)
  const [selectionManufacturer, setSelectionManufacturer] = useState<SelectionManufacturer>('all')
  const [selectionCategoryId, setSelectionCategoryId] = useState<CategoryId | 'all'>('all')
  const [selectionVoltage, setSelectionVoltage] = useState<SelectionVoltage>('all')
  const [selectionPowerFloor, setSelectionPowerFloor] = useState(0)
  const [selectionProtocol, setSelectionProtocol] = useState<SelectionProtocol>('all')
  const [selectionReportTitle, setSelectionReportTitle] = useState('')
  const [selectionReportNote, setSelectionReportNote] = useState('')
  const [selectionReportPending, setSelectionReportPending] = useState(false)
  const [selectionPlans, setSelectionPlans] = useState<SelectionPlan[]>(() => loadSelectionPlans())
  const [selectionPlanName, setSelectionPlanName] = useState('')
  const [favorites, setFavorites] = useState<string[]>(() => loadStringList(storageKeys.favorites))
  const [favoriteMetadata, setFavoriteMetadata] = useState<Record<string, FavoriteMetadata>>(() => loadFavoriteMetadata())
  const [drivePairings, setDrivePairings] = useState<Record<string, string>>(() => loadDrivePairings())
  const [bomProjects, setBomProjects] = useState<BomProject[]>(() => loadBomProjects())
  const [activeBomProjectId, setActiveBomProjectId] = useState<string | null>(() => window.localStorage.getItem(storageKeys.activeBomProject) || null)
  const [bomOpen, setBomOpen] = useState(false)
  const [bomDownloadPending, setBomDownloadPending] = useState(false)
  const [recents, setRecents] = useState<string[]>(() => loadStringList(storageKeys.recents))
  const [comparison, setComparison] = useState<string[]>([])
  const [selected, setSelected] = useState<MotorProduct | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('specs')
  const [detailFastechVariantId, setDetailFastechVariantId] = useState<string | null>(null)
  const [modelMenuCategoryId, setModelMenuCategoryId] = useState<CategoryId | null>(null)
  const [modelMenuFastechSeries, setModelMenuFastechSeries] = useState<string | null>(null)
  const [detailReturnCategoryId, setDetailReturnCategoryId] = useState<CategoryId | null>(null)
  const [notice, setNotice] = useState('')
  const [theme, setTheme] = useState<Theme>(() => (window.localStorage.getItem(storageKeys.theme) as Theme | null) ?? 'dark')
  const [comparisonDownloadPending, setComparisonDownloadPending] = useState(false)
  const [modelPdfPendingId, setModelPdfPendingId] = useState<string | null>(null)
  const [comparisonCollapsed, setComparisonCollapsed] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(isStandaloneMode)
  const searchInput = useRef<HTMLInputElement>(null)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  useEffect(() => { window.localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites)) }, [favorites])
  useEffect(() => { window.localStorage.setItem(storageKeys.favoriteMetadata, JSON.stringify(favoriteMetadata)) }, [favoriteMetadata])
  useEffect(() => { window.localStorage.setItem(storageKeys.drivePairings, JSON.stringify(drivePairings)) }, [drivePairings])
  useEffect(() => { window.localStorage.setItem(storageKeys.bomProjects, JSON.stringify(bomProjects)) }, [bomProjects])
  useEffect(() => { if (activeBomProjectId) window.localStorage.setItem(storageKeys.activeBomProject, activeBomProjectId); else window.localStorage.removeItem(storageKeys.activeBomProject) }, [activeBomProjectId])
  useEffect(() => { window.localStorage.setItem(storageKeys.selectionPlans, JSON.stringify(selectionPlans)) }, [selectionPlans])
  useEffect(() => { window.localStorage.setItem(storageKeys.recents, JSON.stringify(recents)) }, [recents])
  useEffect(() => { window.localStorage.setItem(storageKeys.activeBrand, activeBrandId) }, [activeBrandId])
  useEffect(() => { window.localStorage.setItem(storageKeys.theme, theme); document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const onAppInstalled = () => {
      setInstallPrompt(null)
      setIsStandalone(true)
      setNotice('앱이 홈 화면에 설치되었습니다.')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault()
        searchInput.current?.focus()
      }
      if (event.key === 'Escape') {
        clearSharedModelHash()
        setSelected(null)
        setModelMenuCategoryId(null)
        setModelMenuFastechSeries(null)
        setDetailFastechVariantId(null)
        setDetailReturnCategoryId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    const restoreSharedState = () => {
      const hash = new URLSearchParams(window.location.hash.slice(1))
      const sharedId = new URLSearchParams(window.location.hash.slice(1)).get('model')
      if (sharedId) {
        const product = motors.find((motor) => motor.id === sharedId)
        if (!product) {
          setNotice('공유된 모델을 찾을 수 없습니다.')
          return
        }
        setRecents((current) => [product.id, ...current.filter((id) => id !== product.id)].slice(0, 10))
        setDetailTab('specs')
        setDetailFastechVariantId(null)
        setActiveBrandId(brandIdForProduct(product))
        setDetailReturnCategoryId(null)
        setModelMenuCategoryId(null)
        setSelected(product)
        return
      }

      if (hash.get('selection') !== '1') return
      const brandId = hash.get('brand')
      const manufacturer = hash.get('manufacturer') ?? 'all'
      const categoryId = hash.get('category')
      const voltage = hash.get('voltage')
      const powerFloor = Number(hash.get('power') ?? '0')
      const protocol = hash.get('protocol')
      const validCategory = categoryId === 'all' || categories.some((category) => category.id === categoryId)
      const validVoltage = selectionVoltageOptions.some((option) => option.value === voltage)
      const validPower = isValidSelectionPower(powerFloor)
      const validProtocol = selectionProtocolOptions.some((option) => option.value === protocol)
      const validBrand = !brandId || brandCatalogs.some((brand) => brand.id === brandId)
      const validManufacturer = selectionManufacturerOptions.some((option) => option.value === manufacturer)
      if (!validCategory || !validVoltage || !validPower || !validProtocol || !validBrand || !validManufacturer) {
        setNotice('공유된 선정 조건을 불러오지 못했습니다.')
        return
      }
      if (brandId) setActiveBrandId(brandId as BrandId)
      setSelectionManufacturer(manufacturer as SelectionManufacturer)
      setSelectionCategoryId(categoryId as CategoryId | 'all')
      setSelectionVoltage(voltage as SelectionVoltage)
      setSelectionPowerFloor(powerFloor)
      setSelectionProtocol(protocol as SelectionProtocol)
      setNotice('공유된 선정 조건을 불러왔습니다.')
    }

    restoreSharedState()
    window.addEventListener('hashchange', restoreSharedState)
    return () => window.removeEventListener('hashchange', restoreSharedState)
  }, [])

  const activeBrand = brandCatalogFor(activeBrandId)
  const brandMotors = useMemo(() => motors.filter((motor) => motor.brand === manufacturerByBrandId[activeBrandId]), [activeBrandId])
  const catalogMotors = useMemo(() => activeBrandId !== 'robotis' || robotisLineup === 'all'
    ? brandMotors
    : brandMotors.filter((product) => robotisLineup === 'legacy' ? product.lifecycle === 'legacy' : product.lifecycle !== 'legacy'), [activeBrandId, brandMotors, robotisLineup])
  const activeCategories = useMemo(() => categoriesForBrand(activeBrandId).filter((category) => catalogMotors.some((motor) => motor.categoryId === category.id)), [activeBrandId, catalogMotors])
  const selectionCandidateMotors = useMemo(() => motors
    .filter((product) => product.lifecycle !== 'legacy')
    .filter((product) => selectionManufacturer === 'all' || product.brand === manufacturerByBrandId[selectionManufacturer]), [selectionManufacturer])
  const selectionCategories = useMemo(() => {
    const categorySource = selectionManufacturer === 'all' ? categories : categoriesForBrand(selectionManufacturer)
    return categorySource.filter((category) => selectionCandidateMotors.some((motor) => motor.categoryId === category.id))
  }, [selectionCandidateMotors, selectionManufacturer])
  const categoryCounts = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, catalogMotors.filter((motor) => motor.categoryId === category.id).length])), [catalogMotors])
  const robotisFamilies = useMemo(() => Array.from(new Set(catalogMotors.flatMap((motor) => motor.family ? [motor.family] : []))).sort(compareDynamixelFamilies), [catalogMotors])
  const visibleMotors = useMemo(() => {
    const terms = searchTerms(query)
    return catalogMotors
      .filter((product) => categoryId === 'all' || product.categoryId === categoryId)
      .filter((product) => familyId === 'all' || product.family === familyId)
      .filter((product) => powerFloor === 0 || selectionCapabilityValue(product) >= powerFloor)
      .filter((product) => !terms.length || terms.every((term) => toSearchText(product).includes(term)))
      .sort((a, b) => b.weight - a.weight)
  }, [activeBrandId, catalogMotors, categoryId, familyId, powerFloor, query])
  const visibleMotorGroups = useMemo(() => activeBrandId === 'robotis' && familyId === 'all'
    ? robotisFamilies.map((family) => ({ family, products: visibleMotors.filter((product) => product.family === family) })).filter((group) => group.products.length > 0)
    : [], [activeBrandId, familyId, robotisFamilies, visibleMotors])
  const selectionActive = selectionManufacturer !== 'all' || selectionCategoryId !== 'all' || selectionVoltage !== 'all' || selectionPowerFloor > 0 || selectionProtocol !== 'all'
  const selectionMatchResult = useMemo(() => {
    if (!selectionActive) return { matches: [] as MotorProduct[] }
    const matchProducts = (products: MotorProduct[]) => products
      .filter((product) => product.lifecycle !== 'legacy')
      .filter((product) => selectionManufacturer === 'all' || product.brand === manufacturerByBrandId[selectionManufacturer])
      .filter((product) => selectionCategoryId === 'all' || product.categoryId === selectionCategoryId)
      .filter((product) => supportsSelectionVoltage(product, selectionVoltage))
      .filter((product) => selectionPowerFloor === 0 || selectionCapabilityValue(product) >= selectionPowerFloor)
      .filter((product) => supportsSelectionProtocol(product, selectionProtocol))
      .sort((a, b) => {
        const powerGapA = selectionPowerFloor > 0 ? Math.max(0, selectionCapabilityValue(a) - selectionPowerFloor) : 0
        const powerGapB = selectionPowerFloor > 0 ? Math.max(0, selectionCapabilityValue(b) - selectionPowerFloor) : 0
        return (powerGapA - powerGapB) || (b.weight - a.weight)
      })

    return { matches: matchProducts(motors) }
  }, [selectionActive, selectionCategoryId, selectionManufacturer, selectionPowerFloor, selectionProtocol, selectionVoltage])
  const selectionMatches = selectionMatchResult.matches
  const selectionResults = selectionMatches
  const selectionReportResults = selectionMatches.slice(0, 3)
  const currentSelectionCriteria: SelectionCriteria = { manufacturer: selectionManufacturer, categoryId: selectionCategoryId, voltage: selectionVoltage, powerFloor: selectionPowerFloor, protocol: selectionProtocol }
  const directoryPowerChoices = useMemo(() => {
    const options = brandUsesTorque(activeBrandId) ? torqueOptions : powerOptionsFor(catalogMotors)
    return options.some((option) => option.value === powerFloor)
      ? options
      : [...options, { value: powerFloor, label: `${selectionCapabilityLabel(powerFloor, activeBrandId)} (현재)` }]
  }, [activeBrandId, catalogMotors, powerFloor])
  const selectionPowerChoices = useMemo(() => {
    if (selectionManufacturer === 'all') return [{ value: 0, label: '제조사 선택 후 설정' }]
    const options = brandUsesTorque(selectionManufacturer) ? torqueOptions : powerOptionsFor(selectionCandidateMotors)
    return options.some((option) => option.value === selectionPowerFloor)
      ? options
      : [...options, { value: selectionPowerFloor, label: `${selectionCapabilityLabel(selectionPowerFloor, selectionManufacturer)} (현재 조건)` }]
  }, [selectionCandidateMotors, selectionManufacturer, selectionPowerFloor])

  useEffect(() => {
    if (selectionManufacturer === 'all' && selectionPowerFloor !== 0) setSelectionPowerFloor(0)
  }, [selectionManufacturer, selectionPowerFloor])
  const recommendation = catalogMotors[dayOfYear(new Date()) % catalogMotors.length] ?? motors[0]
  const searchExamples = activeBrandId === 'robotis'
    ? [{ label: 'XM430', query: 'XM430' }, { label: '4.1 Nm', query: '4.1 Nm' }, { label: 'RS-485', query: 'RS-485' }]
    : activeBrandId === 'ls-mecapion'
      ? [{ label: 'PEGA', query: 'PEGA' }, { label: 'DD 모터', query: 'DD' }, { label: 'BiSS-C', query: 'BiSS-C' }]
      : activeBrandId === 'komotek'
        ? [{ label: 'KANZ', query: 'KANZ' }, { label: '48 V', query: '48 V' }, { label: '중공축', query: '중공축' }]
        : activeBrandId === 'fastech'
          ? [{ label: 'Ezi-SERVO', query: 'Ezi-SERVO' }, { label: '12 Nm', query: '12 Nm' }, { label: 'EtherCAT', query: 'EtherCAT' }]
        : [{ label: '48V 프레임리스', query: '48V 프레임리스' }, { label: '750W', query: '750W' }, { label: 'EtherCAT', query: 'EtherCAT' }]
  const comparisonProducts = comparison.map((id) => motors.find((motor) => motor.id === id)).filter((product): product is MotorProduct => Boolean(product))
  const favoriteProducts = favorites.map((id) => motors.find((motor) => motor.id === id)).filter((product): product is MotorProduct => Boolean(product))
  const recentProducts = recents.map((id) => motors.find((motor) => motor.id === id)).filter((product): product is MotorProduct => Boolean(product))
  const modelMenuProducts = modelMenuCategoryId
    ? catalogMotors
      .filter((motor) => motor.categoryId === modelMenuCategoryId)
      .filter((motor) => familyId === 'all' || motor.family === familyId)
      .filter((motor) => !modelMenuFastechSeries || motor.series === modelMenuFastechSeries)
    : []

  const selectBrand = (brandId: BrandId) => {
    clearSharedSelectionHash()
    setActiveBrandId(brandId)
    setCategoryId('all')
    setFamilyId('all')
    setRobotisLineup('current')
    setModelMenuCategoryId(null)
    setModelMenuFastechSeries(null)
    setPowerFloor(0)
    if (brandUsesTorque(brandId) !== brandUsesTorque(activeBrandId)) setSelectionPowerFloor(0)
    setSelectionCategoryId('all')
    setQuery('')
  }

  const openDetail = (product: MotorProduct, tab: DetailTab = 'specs', returnCategoryId: CategoryId | null = null, fastechVariantId: string | null = null) => {
    setRecents((current) => [product.id, ...current.filter((id) => id !== product.id)].slice(0, 10))
    setDetailTab(tab)
    setDetailFastechVariantId(fastechVariantId)
    setDetailReturnCategoryId(returnCategoryId)
    setSelected(product)
  }
  const openFastechModelMenu = (product: MotorProduct) => {
    setActiveBrandId('fastech')
    setCategoryId(product.categoryId)
    setFamilyId('all')
    setModelMenuFastechSeries(product.series)
    setModelMenuCategoryId(product.categoryId)
  }
  const openCatalogItem = (product: MotorProduct) => product.brand === 'FASTECH' ? openFastechModelMenu(product) : openDetail(product)
  const closeDetail = () => {
    clearSharedModelHash()
    setSelected(null)
    setDetailFastechVariantId(null)
    setDetailReturnCategoryId(null)
  }
  const returnToModelList = () => {
    if (!detailReturnCategoryId) return
    const categoryId = detailReturnCategoryId
    clearSharedModelHash()
    setSelected(null)
    setDetailFastechVariantId(null)
    setDetailReturnCategoryId(null)
    setModelMenuCategoryId(categoryId)
  }
  const openOfficial = (product: MotorProduct) => {
    setRecents((current) => [product.id, ...current.filter((id) => id !== product.id)].slice(0, 10))
    window.open(product.officialUrl, '_blank', 'noopener,noreferrer')
  }
  const openDriveOfficial = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
  const selectDrivePairing = (productId: string, driveKey: string | null) => {
    setDrivePairings((current) => {
      if (driveKey) return { ...current, [productId]: driveKey }
      const next = { ...current }
      delete next[productId]
      return next
    })
    setNotice(driveKey ? '모터+드라이브 조합을 이 기기에 저장했습니다.' : '저장한 드라이브 조합을 해제했습니다.')
  }
  const copyDrivePairing = async (product: MotorProduct, item: DriveMatch) => {
    try {
      await copyText(drivePairingText(product, item))
      setNotice('모터+드라이브 조합표를 복사했습니다.')
    } catch {
      setNotice('조합표를 복사하지 못했습니다. 다시 시도해 주세요.')
    }
  }
  const createBomProject = (name: string) => {
    const project = newBomProject(name)
    setBomProjects((current) => [project, ...current])
    setActiveBomProjectId(project.id)
    setNotice('새 프로젝트 BOM을 만들었습니다.')
  }
  const updateBomProject = (projectId: string, patch: Partial<Pick<BomProject, 'name' | 'note'>>) => {
    setBomProjects((current) => current.map((project) => project.id === projectId ? { ...project, ...patch, name: (patch.name ?? project.name).slice(0, 80), note: (patch.note ?? project.note).slice(0, 500) } : project))
  }
  const deleteBomProject = (projectId: string) => {
    const remaining = bomProjects.filter((project) => project.id !== projectId)
    setBomProjects(remaining)
    setActiveBomProjectId(remaining[0]?.id ?? null)
    setNotice('프로젝트 BOM을 삭제했습니다.')
  }
  const updateBomItem = (projectId: string, itemId: string, patch: Partial<BomItem>) => {
    setBomProjects((current) => current.map((project) => project.id === projectId ? { ...project, items: project.items.map((item) => item.id === itemId ? { ...item, ...patch } : item) } : project))
  }
  const removeBomItem = (projectId: string, itemId: string) => {
    setBomProjects((current) => current.map((project) => project.id === projectId ? { ...project, items: project.items.filter((item) => item.id !== itemId) } : project))
    setNotice('BOM 품목을 삭제했습니다.')
  }
  const addBomAccessory = (projectId: string, name: string, quantity: number) => {
    const item: BomItem = { id: bomId('accessory'), kind: 'accessory', motor: '', drive: name.trim().slice(0, 100), motorUrl: '', driveUrl: '', quantity, status: 'reviewing', unitPrice: 0, leadDate: '', note: '' }
    setBomProjects((current) => current.map((project) => project.id === projectId ? { ...project, items: [...project.items, item].slice(0, 200) } : project))
    setNotice('부속품을 BOM에 추가했습니다.')
  }
  const addDrivePairingToBom = (product: MotorProduct, item: DriveMatch) => {
    const bomItem: BomItem = { id: bomId('motor-drive'), kind: 'motor-drive', motor: `${product.model} (${product.series})`, drive: `${item.family} · ${item.model}`, motorUrl: product.officialUrl, driveUrl: item.officialUrl, quantity: 1, status: 'reviewing', unitPrice: 0, leadDate: '', note: drivePairingStatusLabel(item.status) }
    const activeId = activeBomProjectId && bomProjects.some((project) => project.id === activeBomProjectId) ? activeBomProjectId : bomProjects[0]?.id
    if (!activeId) {
      const project = newBomProject('')
      setBomProjects([{ ...project, items: [bomItem] }])
      setActiveBomProjectId(project.id)
      setBomOpen(true)
      setNotice('새 프로젝트 BOM에 모터+드라이브 조합을 담았습니다.')
      return
    }
    setBomProjects((current) => current.map((project) => {
      if (project.id !== activeId) return project
      const existing = project.items.find((saved) => saved.kind === 'motor-drive' && saved.motor === bomItem.motor && saved.drive === bomItem.drive)
      return existing ? { ...project, items: project.items.map((saved) => saved.id === existing.id ? { ...saved, quantity: Math.min(10_000, saved.quantity + 1) } : saved) } : { ...project, items: [...project.items, bomItem].slice(0, 200) }
    }))
    setActiveBomProjectId(activeId)
    setBomOpen(true)
    setNotice('프로젝트 BOM에 모터+드라이브 조합을 담았습니다.')
  }
  const downloadBomProject = async (project: BomProject) => {
    setBomDownloadPending(true)
    try {
      const response = await fetch(new URL('/api/project-bom-xlsx', window.location.origin), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project }) })
      if (!response.ok) throw new Error(`BOM export failed with ${response.status}`)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${project.name.replace(/[\\/:*?"<>|]/g, '_').slice(0, 60) || 'Project'}-BOM.xlsx`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000)
      setNotice('프로젝트 BOM 엑셀 파일을 다운로드했습니다.')
    } catch {
      setNotice('프로젝트 BOM 엑셀 파일을 만들지 못했습니다. 다시 시도해 주세요.')
    } finally {
      setBomDownloadPending(false)
    }
  }
  const shareModel = async (product: MotorProduct) => {
    const url = sharedModelUrl(product)
    const text = sharedModelText(product, url)

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `${product.model} | ${product.brand} 모터 사양`, text, url })
        setNotice('모델 사양을 공유했습니다.')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await copyText(text)
      setNotice('사양과 공유 링크를 복사했습니다.')
    } catch {
      setNotice('사양 정보를 복사하지 못했습니다. 다시 시도해 주세요.')
    }
  }
  const openManual = (product: MotorProduct) => {
    const manual = manualPdfFor(product)
    if (!manual) return
    setRecents((current) => [product.id, ...current.filter((id) => id !== product.id)].slice(0, 10))
    const manualUrl = new URL('/api/manual-pdf', window.location.origin)
    manualUrl.searchParams.set('series', product.series)
    window.open(manualUrl.toString(), '_blank', 'noopener,noreferrer')
  }
  const openDrawing = (product: MotorProduct, drawing: DrawingArchive) => {
    setRecents((current) => [product.id, ...current.filter((id) => id !== product.id)].slice(0, 10))
    if (drawing.kind === 'page') {
      window.open(drawing.url, '_blank', 'noopener,noreferrer')
      return
    }
    const drawingUrl = new URL('/api/drawing-zip', window.location.origin)
    drawingUrl.searchParams.set('series', product.series)
    drawingUrl.searchParams.set('id', drawing.id)
    window.open(drawingUrl.toString(), '_blank', 'noopener,noreferrer')
  }
  const updateFavoriteMetadata = (id: string, patch: Partial<FavoriteMetadata>) => {
    setFavoriteMetadata((current) => ({ ...current, [id]: { ...(current[id] ?? defaultFavoriteMetadata), ...patch } }))
  }
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites((current) => current.filter((item) => item !== id))
      setFavoriteMetadata((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      return
    }
    setFavorites((current) => [id, ...current])
  }
  const toggleCompare = (id: string) => {
    if (!comparison.includes(id)) setComparisonCollapsed(false)
    setComparison((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length === 3) {
        setNotice('비교함에는 최대 3개 모델까지 담을 수 있습니다.')
        return current
      }
      return [...current, id]
    })
  }
  const resetSelection = () => {
    clearSharedSelectionHash()
    setSelectionManufacturer('all')
    setSelectionCategoryId('all')
    setSelectionVoltage('all')
    setSelectionPowerFloor(0)
    setSelectionProtocol('all')
    setSelectionPlanName('')
  }
  const applySelectionPlan = (plan: SelectionPlan) => {
    clearSharedSelectionHash()
    setSelectionManufacturer(plan.manufacturer)
    setSelectionCategoryId(plan.categoryId)
    setSelectionVoltage(plan.voltage)
    setSelectionPowerFloor(plan.powerFloor)
    setSelectionProtocol(plan.protocol)
    setNotice(`'${plan.name}' 선정안을 불러왔습니다.`)
  }
  const saveSelectionPlan = () => {
    if (!selectionActive) return
    const plan: SelectionPlan = {
      id: globalThis.crypto?.randomUUID?.() ?? `selection-plan-${Date.now()}`,
      name: selectionPlanName.trim() || selectionCriteriaLabel(currentSelectionCriteria, activeBrandId) || '새 선정안',
      ...currentSelectionCriteria,
      createdAt: new Date().toISOString(),
    }
    setSelectionPlans((current) => [plan, ...current].slice(0, 12))
    setSelectionPlanName('')
    setNotice(`'${plan.name}' 선정안을 저장했습니다.`)
  }
  const shareSelectionPlan = async (plan: SelectionPlan) => {
    const url = sharedSelectionUrl(plan, activeBrandId)
    const text = sharedSelectionText(plan, url, activeBrandId)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `${plan.name} | Magicup-Work-Flow`, text, url })
        setNotice('선정안을 공유했습니다.')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    try {
      await copyText(text)
      setNotice('선정안 공유 링크를 복사했습니다.')
    } catch {
      setNotice('선정안 공유 링크를 복사하지 못했습니다. 다시 시도해 주세요.')
    }
  }

  const downloadComparison = async (products: MotorProduct[]) => {
    setComparisonDownloadPending(true)
    try {
      const downloadUrl = new URL('/api/comparison-xlsx', window.location.origin)
      products.forEach((product) => downloadUrl.searchParams.append('id', product.id))
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error(`Comparison export failed with ${response.status}`)

      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'Magicup-Motor-Atlas-Comparison.xlsx'
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000)
      setNotice('선택 비교표 엑셀 파일을 다운로드했습니다.')
    } catch {
      setNotice('엑셀 파일을 만들지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setComparisonDownloadPending(false)
    }
  }
  const downloadModelSpecPdf = async (product: MotorProduct) => {
    setModelPdfPendingId(product.id)
    try {
      const downloadUrl = new URL('/api/model-spec-pdf', window.location.origin)
      downloadUrl.searchParams.set('id', product.id)
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error(`Model PDF export failed with ${response.status}`)

      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${product.id}-${product.brand}-Spec-Card.pdf`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000)
      setNotice('모델 사양 PDF 카드를 다운로드했습니다.')
    } catch {
      setNotice('모델 사양 PDF 카드를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setModelPdfPendingId(null)
    }
  }
  const downloadSelectionReport = async () => {
    if (!selectionActive) {
      setNotice('먼저 선정 조건을 적용해 주세요.')
      return
    }
    setSelectionReportPending(true)
    try {
      const response = await fetch(new URL('/api/selection-report-pdf', window.location.origin), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectionReportTitle.trim().slice(0, 80),
          note: selectionReportNote.trim().slice(0, 1_000),
          brandId: activeBrandId,
          criteria: currentSelectionCriteria,
          comparisonIds: comparison,
          recommendedIds: selectionReportResults.map((product) => product.id),
        }),
      })
      if (!response.ok) throw new Error(`Selection report export failed with ${response.status}`)

      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'Magicup-Motor-Selection-Report.pdf'
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000)
      setNotice('선정 결과 보고서 PDF를 다운로드했습니다.')
    } catch {
      setNotice('선정 결과 보고서 PDF를 만들지 못했습니다. 잠시 뒤 다시 시도해 주세요.')
    } finally {
      setSelectionReportPending(false)
    }
  }
  const installApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      setInstallPrompt(null)
      if (outcome === 'accepted') setNotice('홈 화면 설치를 진행합니다.')
      return
    }

    if (!window.isSecureContext) {
      setNotice(isIOS
        ? 'Safari 공유 버튼 → 홈 화면에 추가를 누르세요. PC와 휴대폰이 같은 Wi-Fi에 연결되어 있어야 합니다.'
        : 'Chrome 메뉴(⋮) → 홈 화면에 추가를 누르세요. PC와 휴대폰이 같은 Wi-Fi에 연결되어 있어야 합니다.')
      return
    }
    if (isIOS) {
      setNotice('Safari 공유 메뉴에서 “홈 화면에 추가”를 선택해 설치하세요.')
      return
    }
    setNotice('브라우저 메뉴에서 “앱 설치” 또는 “홈 화면에 추가”를 선택하세요.')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Magicup-Work-Flow 처음으로">
          <img className="brand-logo" src="/magicup-logo.svg" alt="Magicup 로고" />
          <span><strong>Magicup-Work-Flow</strong></span>
        </a>
        <div className={`top-actions ${!isStandalone ? 'has-install' : ''}`}>
          <button className="bom-open-button" onClick={() => setBomOpen(true)}><Icon name="grid" size={17} /><span>프로젝트 BOM</span><b>{bomProjects.reduce((total, project) => total + project.items.length, 0)}</b></button>
          {!isStandalone && <button className="install-button" onClick={installApp}><Icon name="install" size={17} /><span>{window.isSecureContext ? '앱 설치' : '홈 화면'}</span></button>}
          <button className="shortcut-button" aria-label="모터 검색" onClick={() => searchInput.current?.focus()}><Icon name="search" size={17} /> <span>빠른 검색</span><kbd>⌘ K</kbd></button>
          <button className="icon-button" aria-label={theme === 'dark' ? '라이트 테마로 바꾸기' : '다크 테마로 바꾸기'} onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} /></button>
        </div>
      </header>

      <main id="top">
        <nav className="brand-switcher" aria-label="제조사 라이브러리 선택">
          <div className="brand-switcher-title"><Icon name="grid" size={17} /><span>제조사 라이브러리</span></div>
          <div className="brand-switcher-list">
            {brandCatalogs.map((brand) => <button key={brand.id} className={`brand-switcher-item ${activeBrandId === brand.id ? 'is-active' : ''}`} onClick={() => selectBrand(brand.id)} aria-pressed={activeBrandId === brand.id}>
              <strong>{brand.name}</strong><small>{brand.englishName}</small>
            </button>)}
          </div>
        </nav>
        <section className="hero-layout">
          <div className="hero-copy">
            <p className="eyebrow"><span /> {`${activeBrand.englishName} MOTOR LIBRARY`}</p>
            <h1>모터 선정,<br /><em>이제 사양표를 넘기지 마세요.</em></h1>
            <p className="hero-description">{activeBrand.description}</p>
            <div className="search-box">
              <Icon name="search" size={22} />
              <input ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="모델명, 종류, 토크, 통신 방식 검색" aria-label={`${activeBrand.name} 모터 검색`} />
              {query && <button className="clear-search" onClick={() => setQuery('')} aria-label="검색어 지우기"><Icon name="x" size={16} /></button>}
              <kbd>⌘ K</kbd>
            </div>
            <p className="search-note">예: {searchExamples.map((example, index) => <span key={example.query}>{index > 0 && <i>·</i>}<button onClick={() => setQuery(example.query)}>{example.label}</button></span>)}</p>
          </div>
          <aside className="recommendation-card">
            <div className="recommendation-top"><span className="today-mark"><Icon name="spark" size={16} /> 오늘의 탐색</span><span>{recommendation.series}</span></div>
            <div className="recommendation-device"><i /><b /><span /><span /><span /></div>
            <p>하루 동안 바뀌지 않는 추천</p>
            <h2>{recommendation.model}</h2>
            <p className="recommendation-summary">{recommendation.summary}</p>
            <button className="text-link" onClick={() => openDetail(recommendation)}>사양 먼저 보기 <Icon name="arrow-up-right" size={17} /></button>
          </aside>
        </section>

        <section className="selection-assistant" aria-labelledby="selection-assistant-title">
          <div className="selection-assistant-head">
            <div>
              <p className="section-eyebrow">SMART SELECT</p>
              <h2 id="selection-assistant-title">조건에 맞는 모델을 바로 추천받으세요.</h2>
              <p>전원·용량·통신·유형 조건을 조합하면 전체 제조사의 공식 공개 사양을 기준으로 일치 모델을 모두 보여줍니다.</p>
            </div>
            {selectionActive && <button className="text-button selection-reset" onClick={resetSelection}><Icon name="x" size={15} /> 조건 초기화</button>}
          </div>
          <div className="selection-controls" aria-label="빠른 모델 선정 조건">
            <label className="selection-control"><span>제조사</span><select value={selectionManufacturer} onChange={(event) => { clearSharedSelectionHash(); setSelectionManufacturer(event.target.value as SelectionManufacturer); setSelectionCategoryId('all'); setSelectionPowerFloor(0) }}>{selectionManufacturerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><Icon name="chevron-down" size={15} /></label>
            <label className="selection-control"><span>모터 유형</span><select value={selectionCategoryId} onChange={(event) => { clearSharedSelectionHash(); setSelectionCategoryId(event.target.value as CategoryId | 'all') }}><option value="all">유형 전체</option>{selectionCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><Icon name="chevron-down" size={15} /></label>
            <label className="selection-control"><span>전원</span><select value={selectionVoltage} onChange={(event) => { clearSharedSelectionHash(); setSelectionVoltage(event.target.value as SelectionVoltage) }}>{selectionVoltageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><Icon name="chevron-down" size={15} /></label>
            <label className="selection-control"><span>{selectionManufacturer === 'robotis' ? '최소 공개 토크' : selectionManufacturer === 'fastech' ? '최소 홀딩 토크' : selectionManufacturer === 'all' ? '용량 · 토크 기준' : '최소 용량'}</span><select value={selectionPowerFloor} disabled={selectionManufacturer === 'all'} onChange={(event) => { clearSharedSelectionHash(); setSelectionPowerFloor(Number(event.target.value)) }}>{selectionPowerChoices.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><Icon name="chevron-down" size={15} /></label>
            <label className="selection-control"><span>통신 방식</span><select value={selectionProtocol} onChange={(event) => { clearSharedSelectionHash(); setSelectionProtocol(event.target.value as SelectionProtocol) }}>{selectionProtocolOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><Icon name="chevron-down" size={15} /></label>
          </div>
          {selectionManufacturer === 'robotis' && <p className="selection-basis-note">DYNAMIXEL 토크는 제품군별로 스톨·연속·최대 기준이 다릅니다. 추천 결과의 <b>토크 기준</b>을 확인하고, 서로 다른 기준의 수치는 직접 비교하지 마세요.</p>}
          {selectionManufacturer === 'fastech' && <p className="selection-basis-note">파스텍의 제품군 토크는 <b>홀딩 토크(정지 유지 기준)</b>입니다. 실제 운전 토크는 속도·전원·구동 조건에 따라 달라지므로 공식 토크 곡선과 매뉴얼을 함께 확인하세요.</p>}
          {selectionActive && <div className="selection-plan-save">
            <label><span>선정안 이름</span><input value={selectionPlanName} onChange={(event) => setSelectionPlanName(event.target.value)} maxLength={48} placeholder={selectionCriteriaLabel(currentSelectionCriteria, activeBrandId)} /></label>
            <button className="button secondary" onClick={saveSelectionPlan}><Icon name="bookmark" size={16} /> 선정안 저장</button>
            <small>이 기기에만 저장됩니다.</small>
          </div>}
          {!selectionActive ? <div className="selection-placeholder"><Icon name="sliders" size={20} /><span>필요한 조건 한 가지만 선택해도 추천을 시작합니다.</span></div> : selectionResults.length > 0 ? <div className="selection-results">
            <div className="selection-result-head"><strong>{selectionManufacturer === 'all' ? '전체 제조사' : `${selectionManufacturerOptions.find((item) => item.value === selectionManufacturer)?.label}`} 조건 일치 <em>{selectionMatches.length}</em>개 모델</strong><span>{selectionManufacturer === 'robotis' ? '제품별 토크 기준을 확인해 같은 기준끼리 비교하세요.' : selectionManufacturer === 'fastech' ? '파스텍 결과는 제품군별 공개 홀딩 토크 기준입니다. 실제 운전 토크 곡선을 함께 확인하세요.' : '용량 조건 선택 시 요구 용량에 가까운 순으로 정렬합니다.'}</span></div>
            <div className="selection-result-grid">
              {selectionResults.map((product, index) => <article className="selection-result-card" key={product.id}>
                <span className="selection-rank">0{index + 1}</span>
                <div className="selection-card-meta">
                  <span className="selection-manufacturer">제조사 · {product.brand}</span>
                  <span className="selection-family">{categoryForProduct(product).name} · {product.series}</span>
                </div>
                <strong>{product.model}</strong>
                <div className="selection-match-area" role="button" tabIndex={0} aria-label={`${product.model} 필터 일치 사양 상세 보기`} onClick={() => openCatalogItem(product)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCatalogItem(product) } }}>
                  <small>{modelPowerLabel(product) || '공식 제품 페이지에서 세부 사양 확인'}</small>
                  <ul>{[...selectionReasons(product, selectionCategoryId, selectionVoltage, selectionPowerFloor, selectionProtocol), ...((product.brand === 'ROBOTIS' || product.brand === 'FASTECH') && product.specs.torqueBasis ? [`토크 기준: ${product.specs.torqueBasis}`] : [])].map((reason) => <li key={reason}><Icon name="check" size={14} />{reason}</li>)}</ul>
                  <span className="selection-match-open">필터 일치 사양 상세 보기 <Icon name="arrow-up-right" size={16} /></span>
                </div>
              </article>)}
            </div>
          </div> : <div className="selection-empty"><Icon name="search" size={21} /><strong>현재 조건에 모두 맞는 공식 등록 모델이 없습니다.</strong><button className="text-button" onClick={resetSelection}>조건 다시 설정</button></div>}
          {selectionPlans.length > 0 && <section className="selection-plan-list" aria-label="저장한 선정안">
            <div><p>저장한 선정안 <span>{selectionPlans.length}</span></p><small>저장된 조건을 다시 열거나 링크로 공유할 수 있습니다.</small></div>
            <ul>{selectionPlans.map((plan) => <li key={plan.id}>
              <button className="selection-plan-open" onClick={() => applySelectionPlan(plan)}><strong>{plan.name}</strong><span>{selectionCriteriaLabel(plan, activeBrandId)}</span></button>
              <button className="icon-button selection-plan-share" onClick={() => shareSelectionPlan(plan)} aria-label={`${plan.name} 선정안 공유`}><Icon name="share" size={16} /></button>
              <button className="icon-button selection-plan-remove" onClick={() => setSelectionPlans((current) => current.filter((item) => item.id !== plan.id))} aria-label={`${plan.name} 선정안 삭제`}><Icon name="x" size={16} /></button>
            </li>)}</ul>
          </section>}
        </section>

        <section className="selection-report" aria-labelledby="selection-report-title">
          <div className="selection-report-head"><div><p className="section-eyebrow">PROJECT REPORT</p><h2 id="selection-report-title">선정 결과를 바로 공유 가능한 PDF로 만드세요.</h2><p>현재 선정 조건, 추천 후보 Top 3, 비교 대상과 프로젝트 메모를 두 페이지 보고서로 정리합니다.</p></div></div>
          <div className="selection-report-fields">
            <label><span>보고서 제목</span><input value={selectionReportTitle} onChange={(event) => setSelectionReportTitle(event.target.value)} maxLength={80} placeholder="예: AGV 구동축 1차 선정" /></label>
            <label><span>프로젝트 메모 (선택)</span><textarea value={selectionReportNote} onChange={(event) => setSelectionReportNote(event.target.value)} maxLength={1_000} placeholder="예: 설치 전원, 제어기 통신 방식, 확인이 필요한 조건을 적어두세요." /></label>
          </div>
          <div className="selection-report-action"><small>{selectionActive ? `조건 일치 ${selectionResults.length}개 중 상위 ${selectionReportResults.length}개 · ${comparisonProducts.length ? `현재 비교함 ${comparisonProducts.length}개` : '추천 후보 자동 비교'}가 보고서에 포함됩니다.` : '선정 조건을 적용하면 보고서를 만들 수 있습니다.'}</small><button className="button primary" onClick={downloadSelectionReport} disabled={!selectionActive || selectionReportPending}>{selectionReportPending ? 'PDF 생성 중…' : '선정 결과 PDF 다운로드'} <Icon name="arrow-up-right" size={16} /></button></div>
        </section>

        <section className="summary-grid" aria-label="카탈로그 현황">
          <div><span>{activeBrandId === 'robotis' && robotisLineup === 'legacy' ? '공식 레거시 자료' : '공식 모델/시리즈'}</span><strong>{catalogMotors.length}</strong><small>{activeBrandId === 'robotis' && robotisLineup === 'current' ? '현재 라인업 우선 표시' : '공식 원문 확인'}</small></div>
          <div><span>모터 유형</span><strong>{activeCategories.length}</strong><small>검색·비교 지원</small></div>
          <div><span>개인 보관함</span><strong>{favorites.length}</strong><small>이 기기에서만 저장</small></div>
          <div><span>최근 확인</span><strong>{recentProducts.length}</strong><small>최대 10개까지</small></div>
        </section>

        <section className="category-map" aria-labelledby="category-map-title">
          <div className="section-heading"><div><p className="section-eyebrow">MOTOR MAP</p><h2 id="category-map-title">어떤 구동 방식이 필요한가요?</h2></div><p>용도에서 시작해 사양으로 좁혀보세요.</p></div>
          <div className="category-grid">
            {activeCategories.map((category) => <button key={category.id} className={`category-card accent-${category.accent} ${categoryId === category.id ? 'is-current' : ''}`} onClick={() => { setCategoryId(category.id); setFamilyId('all'); setModelMenuFastechSeries(null); setModelMenuCategoryId(category.id) }}>
              <span className="category-card-index">0{activeCategories.indexOf(category) + 1}</span>
              <CategoryThumbnail categoryId={category.id} categoryName={category.name} brand={activeBrandId} />
              <span className="category-card-copy"><small>{category.eyebrow}</small><strong>{category.name}</strong><em>{category.useCase}</em></span>
              <span className="category-card-count"><span>{categoryCounts[category.id]} 모델</span><span className="category-card-goal">모델·용량 보기 <Icon name="arrow-up-right" size={17} /></span></span>
            </button>)}
          </div>
        </section>

        <section className="directory-section" id="directory" aria-labelledby="directory-title">
          <div className="directory-head">
            <div><p className="section-eyebrow">PRODUCT DIRECTORY</p><h2 id="directory-title">사양으로 비교할 모델 찾기</h2></div>
            <p><strong>{visibleMotors.length}</strong>개 모델이 현재 조건에 맞습니다.</p>
          </div>
          <div className="filter-row" aria-label="모델 필터">
            <div className="filter-label"><Icon name="sliders" size={18} /> 필터</div>
            <div className="filter-group">
              <button className={categoryId === 'all' ? 'is-active' : ''} onClick={() => setCategoryId('all')}>전체 <span>{catalogMotors.length}</span></button>
              {activeCategories.map((category) => <button key={category.id} className={categoryId === category.id ? 'is-active' : ''} onClick={() => setCategoryId(category.id)}>{category.name}<span>{categoryCounts[category.id]}</span></button>)}
            </div>
            <div className="power-filter">
              <label htmlFor="power-select">{activeBrandId === 'robotis' ? '최소 공개 토크' : activeBrandId === 'fastech' ? '최소 홀딩 토크' : '최소 출력'}</label>
              <select id="power-select" value={powerFloor} onChange={(event) => setPowerFloor(Number(event.target.value))}>
                {directoryPowerChoices.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <Icon name="chevron-down" size={15} />
            </div>
          </div>
          {activeBrandId === 'robotis' && robotisFamilies.length > 0 && <div className="family-filter" aria-label="DYNAMIXEL 제품군 필터">
            <strong>표시 범위</strong>
            <div>
              <button className={robotisLineup === 'current' ? 'is-active' : ''} onClick={() => { setRobotisLineup('current'); setFamilyId('all'); setCategoryId('all') }}>현재 라인업 <span>{brandMotors.filter((product) => product.lifecycle !== 'legacy').length}</span></button>
              <button className={robotisLineup === 'legacy' ? 'is-active' : ''} onClick={() => { setRobotisLineup('legacy'); setFamilyId('all'); setCategoryId('all') }}>레거시 자료 <span>{brandMotors.filter((product) => product.lifecycle === 'legacy').length}</span></button>
              <button className={robotisLineup === 'all' ? 'is-active' : ''} onClick={() => { setRobotisLineup('all'); setFamilyId('all'); setCategoryId('all') }}>전체 <span>{brandMotors.length}</span></button>
            </div>
          </div>}
          {activeBrandId === 'robotis' && robotisFamilies.length > 0 && <div className="family-filter" aria-label="DYNAMIXEL 제품군 필터">
            <strong>제품군</strong>
            <div>
              <button className={familyId === 'all' ? 'is-active' : ''} onClick={() => setFamilyId('all')}>전체 <span>{catalogMotors.length}</span></button>
              {robotisFamilies.map((family) => <button key={family} className={familyId === family ? 'is-active' : ''} onClick={() => setFamilyId(family)}>{family}<span>{catalogMotors.filter((product) => product.family === family).length}</span></button>)}
            </div>
          </div>}
          {activeBrandId === 'robotis' && <aside className="robotis-catalog-note" aria-label="DYNAMIXEL 카탈로그 기준 안내">
            <Icon name="spark" size={18} />
            <div>
              <strong>공식 DYNAMIXEL e-Manual 기준 · {robotisLineup === 'current' ? '현재 라인업 우선 표시' : robotisLineup === 'legacy' ? '레거시 공식 자료 표시' : '현재·레거시 전체 표시'}</strong>
              <p>X·MX·AX 등은 스톨 토크, Y는 연속/최대 토크, P는 연속 토크를 표시합니다. 토크 기준이 다른 모델은 절대값만으로 직접 비교하지 마세요.</p>
            </div>
            {activeBrand.officialUrl && <a href={activeBrand.officialUrl} target="_blank" rel="noreferrer">공식 e-Manual <Icon name="arrow-up-right" size={15} /></a>}
          </aside>}
          {visibleMotorGroups.length > 0 ? <div className="motor-family-groups">
            {visibleMotorGroups.map((group) => <section key={group.family} className="motor-family-group" aria-label={`${group.family} 모델`}>
              <div className="motor-family-group-head"><div><span>DYNAMIXEL FAMILY</span><h3>{group.family}</h3></div><strong>{group.products.length}개 모델</strong></div>
              <div className="motor-grid">{group.products.map((product) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} compared={comparison.includes(product.id)} onSelect={openCatalogItem} onFavorite={toggleFavorite} onCompare={toggleCompare} onOpenOfficial={openOfficial} />)}</div>
            </section>)}
          </div> : <div className="motor-grid">
            {visibleMotors.map((product) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} compared={comparison.includes(product.id)} onSelect={openCatalogItem} onFavorite={toggleFavorite} onCompare={toggleCompare} onOpenOfficial={openOfficial} />)}
            {visibleMotors.length === 0 && <div className="empty-state"><Icon name="search" size={28} /><h3>조건에 맞는 모델이 없습니다.</h3><p>모델명 일부나 더 넓은 조건으로 다시 검색해보세요.</p><button className="text-button" onClick={() => { setQuery(''); setCategoryId('all'); setFamilyId('all'); setRobotisLineup('current'); setPowerFloor(0) }}>필터 초기화</button></div>}
          </div>}
        </section>

        {favoriteProducts.length > 0 && <section className="favorites-section" aria-labelledby="favorites-title">
          <div className="section-heading">
            <div><p className="section-eyebrow">SAVED MODELS</p><h2 id="favorites-title">관심 모델</h2></div>
            <div className="favorites-heading-actions"><span><strong>{favoriteProducts.length}</strong>개 보관 중</span><button className="text-button" onClick={() => { setFavorites([]); setFavoriteMetadata({}) }}>모두 비우기</button></div>
          </div>
          <div className="favorite-list">
            {favoriteProducts.map((product) => <article key={product.id} className="favorite-card">
              <button className="favorite-main" onClick={() => openDetail(product)}>
                <span>{categoryForProduct(product).name}</span><strong>{product.model}</strong><small>{modelPowerLabel(product) || '공식 제품 페이지에서 사양 확인'}</small>
              </button>
              <div className="favorite-project">
                <label className="favorite-status-field"><span>프로젝트 상태</span><select value={(favoriteMetadata[product.id] ?? defaultFavoriteMetadata).status} onChange={(event) => updateFavoriteMetadata(product.id, { status: event.target.value as FavoriteStatus })} aria-label={`${product.model} 프로젝트 상태`}><option value="reviewing">검토 중</option><option value="candidate">후보</option><option value="selected">선정</option></select></label>
                <label className="favorite-note-field"><span>프로젝트 메모</span><input value={(favoriteMetadata[product.id] ?? defaultFavoriteMetadata).note} onChange={(event) => updateFavoriteMetadata(product.id, { note: event.target.value })} maxLength={80} placeholder="예: 고객사 A 견적 · EtherCAT 필수" aria-label={`${product.model} 프로젝트 메모`} /></label>
                <small className="favorite-save-note">이 기기에 자동 저장</small>
              </div>
              <div className="favorite-actions">
                <button className={`favorite-compare ${comparison.includes(product.id) ? 'is-selected' : ''}`} onClick={() => toggleCompare(product.id)}><Icon name={comparison.includes(product.id) ? 'check' : 'grid'} size={15} />{comparison.includes(product.id) ? '비교함에 담김' : '비교하기'}</button>
                <button className="favorite-remove" aria-label={`${product.model} 관심 모델에서 제거`} onClick={() => toggleFavorite(product.id)}><Icon name="bookmark" size={16} fill="currentColor" />관심 해제</button>
              </div>
            </article>)}
          </div>
        </section>}

        {recentProducts.length > 0 && <section className="recent-section"><div className="section-heading"><div><p className="section-eyebrow">RECENTLY VIEWED</p><h2>최근 확인한 모델</h2></div><button className="text-button" onClick={() => setRecents([])}>기록 지우기</button></div><div className="recent-list">{recentProducts.slice(0, 4).map((product) => <button key={product.id} onClick={() => openDetail(product)}><span>{categoryForProduct(product).name}</span><strong>{product.model}</strong><Icon name="arrow-up-right" size={17} /></button>)}</div></section>}

        <section className="data-policy" aria-label="데이터 출처">
          <p><strong>공식 데이터 기준</strong> · {`${activeBrand.name} 공식 제품 페이지와 공개 매뉴얼의 사양만 반영하며, 공개되지 않은 값은 추정하지 않습니다.`}</p>
          {activeBrand.officialUrl && <a href={activeBrand.officialUrl} target="_blank" rel="noreferrer">{activeBrand.name} 공식 제품 센터 <Icon name="arrow-up-right" size={17} /></a>}
        </section>
      </main>

      <footer><span>Motor Atlas · Multi Brand Edition</span><span>{sourceLabel}</span><span>로그인·서버 동기화 없음</span></footer>

      {comparisonProducts.length > 0 && !comparisonCollapsed && <ComparisonTray products={comparisonProducts} onRemove={(id) => setComparison((current) => current.filter((item) => item !== id))} onClear={() => { setComparison([]); setComparisonCollapsed(false) }} onClose={() => setComparisonCollapsed(true)} onOpen={openDetail} onDownload={downloadComparison} downloadPending={comparisonDownloadPending} />}
      {comparisonProducts.length > 0 && comparisonCollapsed && <button className="comparison-reopen" onClick={() => setComparisonCollapsed(false)}><Icon name="grid" size={16} />비교표 열기 <span>{comparisonProducts.length}</span></button>}
      {bomOpen && <BomProjectModal projects={bomProjects} activeProjectId={activeBomProjectId} exportPending={bomDownloadPending} onClose={() => setBomOpen(false)} onSelectProject={setActiveBomProjectId} onCreateProject={createBomProject} onDeleteProject={deleteBomProject} onUpdateProject={updateBomProject} onAddAccessory={addBomAccessory} onUpdateItem={updateBomItem} onRemoveItem={removeBomItem} onExportProject={downloadBomProject} />}
      {modelMenuCategoryId && <ModelBrowserModal category={categoryForBrand(activeBrandId, modelMenuCategoryId)} products={modelMenuProducts} seriesName={modelMenuFastechSeries} onClose={() => { setModelMenuCategoryId(null); setModelMenuFastechSeries(null) }} onSelect={(product, fastechVariantId) => { const returnCategoryId = modelMenuCategoryId; setModelMenuCategoryId(null); openDetail(product, 'manual', returnCategoryId, fastechVariantId ?? null) }} />}
      {selected && <DetailModal product={selected} favorite={favorites.includes(selected.id)} compared={comparison.includes(selected.id)} initialTab={detailTab} initialFastechVariantId={detailFastechVariantId ?? undefined} onClose={closeDetail} onBackToModels={detailReturnCategoryId ? returnToModelList : undefined} onFavorite={toggleFavorite} onCompare={toggleCompare} onShare={shareModel} onDownloadSpecPdf={downloadModelSpecPdf} pdfDownloadPending={modelPdfPendingId === selected.id} onOpenOfficial={openOfficial} onOpenDrive={openDriveOfficial} selectedDriveKey={drivePairings[selected.id]} onSelectDrive={selectDrivePairing} onCopyPairing={copyDrivePairing} onAddToBom={addDrivePairingToBom} onOpenManual={openManual} onOpenDrawing={openDrawing} />}
      {notice && <div className="toast" role="status"><Icon name="spark" size={17} />{notice}</div>}
    </div>
  )
}
