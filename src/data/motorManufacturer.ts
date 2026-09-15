import type { MotorProduct } from '../types'

// Official Motor specification, checked 2026-09-15 KST. Do not infer from "coreless" alone.
const confirmedXModels = new Set([
  'XH430-W210', 'XH430-W350', 'XH430-V210', 'XH430-V350',
  'XH540-W150', 'XH540-W270', 'XH540-V150', 'XH540-V270',
  'XD430-T210', 'XD430-T350', 'XD540-T150', 'XD540-T270',
  'XW430-T200', 'XW430-T333', 'XW540-T140', 'XW540-T260',
])

export function maxonSourceFor(product: Pick<MotorProduct, 'brand' | 'model'>) {
  if (product.brand !== 'ROBOTIS') return undefined
  const base = product.model.replace(/-(?:T|R|T\/R)$/, '')
  if (confirmedXModels.has(base)) return 'https://emanual.robotis.com/docs/en/dxl/x/'
  if (/^MX-(28|64|106)(T\/R|T|R|AT|AR)(?:\(2\.0\))?$/.test(product.model)) return 'https://emanual.robotis.com/docs/en/dxl/mx/'
  return undefined
}
