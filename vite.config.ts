import OSS from 'ali-oss'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { drawingArchivesBySeries } from './src/data/drawings'
import { manualPdfBySeries } from './src/data/manuals'
import { motors } from './src/data/motors'

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
}

let comparisonWorkbookBuilder: Promise<ComparisonWorkbookBuilder> | undefined

function getComparisonWorkbookBuilder() {
  if (!comparisonWorkbookBuilder) {
    const moduleUrl = pathToFileURL(resolve(process.cwd(), 'tmp/xlsx-runtime/comparisonWorkbook.mjs')).href
    comparisonWorkbookBuilder = import(moduleUrl) as Promise<ComparisonWorkbookBuilder>
  }
  return comparisonWorkbookBuilder
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
    },
  }
}

// GitHub Pages는 https://<user>.github.io/Motor_Guide/ 하위 경로에서 제공되므로
// 정적 배포 빌드에서는 base 경로를 지정해야 자산(JS/CSS/이미지) 경로가 깨지지 않는다.
// (로컬 npm run dev / npm run build에는 영향 없음 — GH_PAGES=true 일 때만 적용)
const isGithubPagesBuild = process.env.GH_PAGES === 'true'

export default defineConfig({
  base: isGithubPagesBuild ? '/Motor_Guide/' : '/',
  plugins: [react(), manualPdfProxy()],
})
