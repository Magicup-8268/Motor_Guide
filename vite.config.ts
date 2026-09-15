import OSS from 'ali-oss'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { drawingArchivesBySeries } from './src/data/drawings'
import { manualPdfBySeries } from './src/data/manuals'

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

async function retrieveKincoDownload(file: KincoDownloadFile) {
  const tokenResponse = await fetch('https://www.kincoautomation.com/api/getToken', { signal: AbortSignal.timeout(20_000) })
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
  const downloadResponse = await fetch(signedUrl, { headers: { Referer: file.refererUrl }, signal: AbortSignal.timeout(60_000) })
  if (!downloadResponse.ok) throw new Error(`Kinco download response ${downloadResponse.status}`)
  return checkedDocument(downloadResponse)
}

async function retrieveFastechDownload(file: KincoDownloadFile) {
  const downloadResponse = await fetch(file.url, {
    signal: AbortSignal.timeout(60_000),
    headers: {
      Referer: file.refererUrl,
      Accept: 'application/pdf,application/zip,application/octet-stream;q=0.9,*/*;q=0.8',
    },
  })
  if (!downloadResponse.ok) throw new Error(`FASTECH download response ${downloadResponse.status}`)
  return checkedDocument(downloadResponse)
}

export async function checkedDocument(response: Response) {
  const maxBytes = 128 * 1024 * 1024
  if (Number(response.headers.get('content-length')) > maxBytes) throw new Error('Document too large')
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Empty document')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.length
      if (size > maxBytes) throw new Error('Document too large')
      chunks.push(value)
    }
  } finally { await reader.cancel() }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  const isPdf = new TextDecoder().decode(bytes.subarray(0, 1024)).includes('%PDF-')
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 3 && bytes[3] === 4
  if (!isPdf && !isZip) throw new Error('Official server returned an error page instead of a document')
  return bytes
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
