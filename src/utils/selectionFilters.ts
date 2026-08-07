import type { MotorProduct } from '../types'

export type SelectionVoltage = 'all' | '5v' | '12v' | '24v' | '48v' | '96v' | '220v'
export type SelectionProtocol = 'all' | 'ethercat' | 'canopen' | 'modbus' | 'profinet' | 'pulse' | 'ttl' | 'rs485' | 'uart'
export type SelectionCapabilityUnit = 'power' | 'torque'

const voltageBySelection: Record<Exclude<SelectionVoltage, 'all'>, number> = {
  '5v': 5,
  '12v': 12,
  '24v': 24,
  '48v': 48,
  '96v': 96,
  '220v': 220,
}

const protocolNeedle: Record<Exclude<SelectionProtocol, 'all'>, string> = {
  ethercat: 'ethercat',
  canopen: 'canopen',
  modbus: 'modbus',
  profinet: 'profinet',
  pulse: 'pulse',
  ttl: 'ttl',
  rs485: 'rs485',
  uart: 'uart',
}

function voltageSource(product: MotorProduct) {
  // 48 V 제품의 "로직 전원 24 V"는 모터 구동 전원이 아니므로 제외한다.
  return `${product.specs.ratedVoltage ?? ''} ${product.specs.dcInputRange ?? ''}`
    .replace(/\([^)]*(?:로직\s*전원|logic\s*supply)[^)]*\)/gi, ' ')
    .toLocaleLowerCase()
}

function publishedVoltageRanges(product: MotorProduct) {
  const source = voltageSource(product)
  return [...source.matchAll(/(\d+(?:\.\d+)?)\s*(?:[–—~-]\s*(\d+(?:\.\d+)?))?\s*v(?:dc|ac)?/g)]
    .map(([, start, end]) => {
      const first = Number(start)
      const second = end === undefined ? first : Number(end)
      return { minimum: Math.min(first, second), maximum: Math.max(first, second) }
    })
}

export function supportsSelectionVoltage(product: MotorProduct, selection: SelectionVoltage) {
  if (selection === 'all') return true

  const source = voltageSource(product)
  const requested = voltageBySelection[selection]
  const isAcRequest = selection === '220v'
  const hasAcSupply = /vac|\bac\b/.test(source) || (product.categoryId === 'ac-servo' && requested >= 100)
  const hasDcSupply = /vdc/.test(source)

  if (isAcRequest ? !hasAcSupply : hasAcSupply && !hasDcSupply) return false
  return publishedVoltageRanges(product).some((range) => requested >= range.minimum && requested <= range.maximum)
}

function normalizedCommunicationSource(product: MotorProduct) {
  return [...(product.specs.protocols ?? []), product.specs.physicalConnection ?? '']
    .join(' ')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function supportsSelectionProtocol(product: MotorProduct, selection: SelectionProtocol) {
  if (selection === 'all') return true
  return normalizedCommunicationSource(product).includes(protocolNeedle[selection])
}

export function selectionCapabilityUnit(product: MotorProduct): SelectionCapabilityUnit {
  return product.brand === 'ROBOTIS' || product.brand === 'FASTECH' ? 'torque' : 'power'
}

export function selectionCapabilityValue(product: MotorProduct) {
  if (selectionCapabilityUnit(product) === 'torque') {
    return product.specs.maxTorque ?? product.specs.ratedTorque ?? product.specs.holdingTorque ?? -1
  }

  return product.specs.selectionMaxPower
    ?? (product.specs.ratedPowerOptions?.length ? Math.max(...product.specs.ratedPowerOptions) : product.specs.ratedPower ?? -1)
}
