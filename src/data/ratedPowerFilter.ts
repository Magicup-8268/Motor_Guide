import type { MotorProduct } from '../types'

export type PowerMode = 'all' | 'exact' | 'range' | 'minimum' | 'unknown'
export type PowerFilter = { mode: PowerMode; from: string; to: string }
export function ratedPowers(product: MotorProduct): number[] {
  if (product.categoryId === 'brake') return []
  return [...new Set([...(product.specs.ratedPowerOptions ?? []), product.specs.ratedPower]
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0))]
}
export function powerFilterError(filter: PowerFilter) {
  if (filter.mode === 'all' || filter.mode === 'unknown') return ''
  if (!filter.from.trim() || !Number.isFinite(Number(filter.from)) || Number(filter.from) <= 0) return '정격 출력을 0보다 큰 W 값으로 입력하세요.'
  if (filter.mode === 'range' && (!filter.to.trim() || !Number.isFinite(Number(filter.to)) || Number(filter.to) < Number(filter.from))) return '최대 출력은 최소 출력 이상으로 입력하세요.'
  return ''
}
export function matchingRatedPowers(product: MotorProduct, filter: PowerFilter) {
  if (powerFilterError(filter)) return []
  return ratedPowers(product).filter(watts => filter.mode === 'all' || (filter.mode === 'exact' ? watts === Number(filter.from)
    : filter.mode === 'minimum' ? watts >= Number(filter.from)
    : filter.mode === 'range' && watts >= Number(filter.from) && watts <= Number(filter.to)))
}
export function matchesRatedPower(product: MotorProduct, filter: PowerFilter) {
  if (filter.mode === 'all') return true
  if (product.categoryId === 'brake' || powerFilterError(filter)) return false
  return filter.mode === 'unknown' ? ratedPowers(product).length === 0 : matchingRatedPowers(product, filter).length > 0
}
