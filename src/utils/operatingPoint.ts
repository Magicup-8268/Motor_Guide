import type { MotorProduct } from '../types'

export type OperatingPoint = { enabled: boolean; speed: string; torque: string; includeUnknown: boolean }
export function operatingPointError(point: OperatingPoint) {
  if (!point.enabled) return ''
  return [point.speed, point.torque].every(value => value.trim() && Number.isFinite(Number(value)) && Number(value) > 0)
    ? '' : '필요 속도(rpm)와 연속 토크(Nm)를 모두 0보다 큰 값으로 입력하세요.'
}
export function operatingPointStatus(product: MotorProduct, point: OperatingPoint) {
  if (!point.enabled) return { status: 'off', reason: '' }
  if (operatingPointError(point)) return { status: 'invalid', reason: operatingPointError(point) }
  if (product.categoryId === 'brake') return { status: 'excluded', reason: '브레이크는 회전 구동 모터가 아닙니다.' }
  const s = product.specs
  const speed = Number(point.speed), torque = Number(point.torque)
  // No curve interpolation: aggregate, voltage-qualified and stall/holding values do not establish a continuous operating point.
  const aggregate = (s.ratedPowerOptions?.length ?? 0) > 1 || Boolean(s.ratedTorqueText || s.ratedSpeedText)
  if (!aggregate && !s.maxSpeedText && Number.isFinite(s.maxSpeed) && speed > s.maxSpeed!) return { status: 'excluded', reason: '요구 속도가 공개 최대 속도를 초과합니다.' }
  if (!aggregate && !s.maxTorqueText && Number.isFinite(s.maxTorque) && torque > s.maxTorque!) return { status: 'excluded', reason: '요구 토크가 공개 최대 토크를 초과합니다.' }
  const nonContinuous = /stall|스톨|holding|홀딩/i.test(s.torqueBasis ?? '') || product.categoryId === 'stepper' || s.holdingTorque !== undefined
  if (!aggregate && !nonContinuous && Number.isFinite(s.ratedTorque) && Number.isFinite(s.ratedSpeed)
      && torque <= s.ratedTorque! && speed <= s.ratedSpeed!) {
    return { status: 'candidate', reason: `정격 수치상 후보 (${s.ratedTorque} Nm · ${s.ratedSpeed} rpm) · 운전점 적합성 미확인` }
  }
  return { status: 'review', reason: nonContinuous
    ? '적합성 미확인 · 스톨/홀딩 토크를 연속 토크로 사용할 수 없습니다.'
    : aggregate ? '적합성 미확인 · 조건별/시리즈 사양과 개별 운전 곡선 확인 필요'
    : '적합성 미확인 · 요구 운전점의 연속 토크·속도 근거 부족' }
}
export function matchesOperatingPoint(product: MotorProduct, point: OperatingPoint) {
  const { status } = operatingPointStatus(product, point)
  return status === 'off' || status === 'candidate' || (status === 'review' && point.includeUnknown)
}
