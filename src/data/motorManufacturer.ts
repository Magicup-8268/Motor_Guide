import type { MotorProduct } from '../types'

// Official ROBOTIS motor specifications, checked 2026-09-28 KST. Do not infer from "coreless" alone.
export const maxonCheckedOn = '2026-09-28'

const confirmedXModels = new Set([
  'XH430-W210', 'XH430-W350', 'XH430-V210', 'XH430-V350',
  'XH540-W150', 'XH540-W270', 'XH540-V150', 'XH540-V270',
  'XD430-T210', 'XD430-T350', 'XD540-T150', 'XD540-T270',
  'XW430-T200', 'XW430-T333', 'XW540-T140', 'XW540-T260',
])

const pMotorTypes = new Map<string, 'BLDC' | '코어리스'>([
  ['PH54-200-S500-R', 'BLDC'], ['PH54-100-S500-R', 'BLDC'],
  ['PH42-020-S300-R', '코어리스'],
  ['PM54-060-S250-R', 'BLDC'], ['PM54-040-S250-R', 'BLDC'],
  ['PM42-010-S260-R', '코어리스'],
])

const legacyCorelessSources = new Map([
  ['EX-106+', 'https://emanual.robotis.com/docs/kr/dxl/ex/ex-106%2B/'],
  ['RX-28', 'https://emanual.robotis.com/docs/kr/dxl/rx/rx-28/'],
  ['RX-64', 'https://emanual.robotis.com/docs/kr/dxl/rx/rx-64/'],
])

export function maxonMotorFor(product: Pick<MotorProduct, 'brand' | 'model'>) {
  if (product.brand !== 'ROBOTIS') return undefined
  const base = product.model.replace(/-(?:T|R|T\/R)$/, '')
  if (confirmedXModels.has(base)) return { type: '코어리스', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' }
  if (/^MX-(28|64|106)(T\/R|T|R|AT|AR)(?:\(2\.0\))?$/.test(product.model)) return { type: '코어리스', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/mx/' }
  const pType = pMotorTypes.get(product.model)
  if (pType) return { type: pType, sourceUrl: `https://emanual.robotis.com/docs/en/dxl/p/${product.model.toLowerCase()}/` }
  if (product.model === 'H54-200-S500-R') return { type: 'BLDC', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/pro/h54-200-s500-r/' }
  const legacySource = legacyCorelessSources.get(product.model)
  if (legacySource) return { type: '코어리스', sourceUrl: legacySource }
  return undefined
}
