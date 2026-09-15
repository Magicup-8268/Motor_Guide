import type { BrandId, CategoryId } from '../types'
import { powerFilterError, type PowerFilter } from '../data/ratedPowerFilter'
import { operatingPointError, type OperatingPoint } from './operatingPoint'
import type { SelectionVoltage, SelectionProtocol } from './selectionFilters'

export const projectStorageKey = 'motor-atlas:projects:v1'
export const projectLimit = 100
export const projectFileLimit = 2 * 1024 * 1024
export type ProjectConditions = {
  query: string; activeBrandId: BrandId; categoryId: CategoryId | 'all'; familyId: string
  robotisLineup: 'current' | 'legacy' | 'all'; powerFloor: number; ratedPowerFilter: PowerFilter
  allBrands: boolean; resultBrand: BrandId | 'all'; operatingPoint: OperatingPoint
  directoryVoltage: SelectionVoltage; directoryProtocol: SelectionProtocol
}
export type SelectionProject = {
  id: string; name: string; note: string; savedAt: string; conditions: ProjectConditions
  models: { id: string; model: string; brand: string; drive: string | null }[]
}
const brands = ['kinco', 'robotis', 'ls-mecapion', 'komotek', 'fastech', 'mikipulley']
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('선정함 파일 형식이 올바르지 않습니다.')
  return value as Record<string, unknown>
}
function text(value: unknown, max: number, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('선정함의 문자열 길이 또는 필수 항목을 확인하세요.')
  return value
}
function option<T extends string>(value: unknown, options: readonly string[]): T {
  if (typeof value !== 'string' || !options.includes(value)) throw new Error('지원하지 않는 검색 조건입니다.')
  return value as T
}
function boolean(value: unknown) {
  if (typeof value !== 'boolean') throw new Error('검색 조건 형식이 올바르지 않습니다.')
  return value
}
function safeId(value: unknown) {
  const id = text(value, 200, true)
  if (['__proto__', 'prototype', 'constructor'].includes(id)) throw new Error('허용되지 않는 식별자입니다.')
  return id
}
export function validateProject(value: unknown): SelectionProject {
  const p = object(value), c = object(p.conditions), w = object(c.ratedPowerFilter), o = object(c.operatingPoint)
  const watts: PowerFilter = { mode: option(w.mode, ['all', 'exact', 'range', 'minimum', 'unknown']), from: text(w.from, 32), to: text(w.to, 32) }
  const point: OperatingPoint = { enabled: boolean(o.enabled), speed: text(o.speed, 32), torque: text(o.torque, 32), includeUnknown: boolean(o.includeUnknown) }
  const error = powerFilterError(watts) || operatingPointError(point)
  if (error) throw new Error(error)
  if (typeof c.powerFloor !== 'number' || !Number.isFinite(c.powerFloor) || c.powerFloor < 0) throw new Error('최소 용량 조건이 올바르지 않습니다.')
  if (!Array.isArray(p.models) || p.models.length > 3) throw new Error('선정 기록은 비교함 기준 최대 3개 제품입니다.')
  const models = p.models.map(value => {
    const m = object(value)
    return { id: safeId(m.id), model: text(m.model, 200, true), brand: text(m.brand, 80, true), drive: m.drive === null ? null : text(m.drive, 300, true) }
  })
  if (new Set(models.map(m => m.id)).size !== models.length) throw new Error('중복된 제품 식별자입니다.')
  const savedAt = text(p.savedAt, 40, true)
  if (!/^\d{4}-\d{2}-\d{2}T/.test(savedAt) || !Number.isFinite(Date.parse(savedAt))) throw new Error('저장 일시가 올바르지 않습니다.')
  return { id: safeId(p.id), name: text(p.name, 80, true).trim(), note: text(p.note, 2000), savedAt, models,
    conditions: { query: text(c.query, 300), activeBrandId: option(c.activeBrandId, brands), categoryId: option(c.categoryId, ['all', 'frameless', 'robot-module', 'integrated', 'ac-servo', 'dc-servo', 'stepper', 'brake']),
      familyId: text(c.familyId, 100, true), robotisLineup: option(c.robotisLineup, ['current','legacy','all']), powerFloor: c.powerFloor, ratedPowerFilter: watts,
      allBrands: boolean(c.allBrands), resultBrand: option(c.resultBrand, ['all', ...brands]), operatingPoint: point,
      directoryVoltage: option(c.directoryVoltage, ['all','5v','12v','24v','48v','96v','220v']), directoryProtocol: option(c.directoryProtocol, ['all','ethercat','canopen','modbus','profinet','pulse','ttl','rs485','uart']) } }
}
export function parseProjectFile(raw: string): SelectionProject[] {
  if (new TextEncoder().encode(raw).length > projectFileLimit) throw new Error('백업 파일은 2 MB 이하여야 합니다.')
  const file = object(JSON.parse(raw))
  if (file.format !== 'magicup-selection-projects' || file.version !== 1 || !Array.isArray(file.projects) || file.projects.length > projectLimit) throw new Error('지원하지 않는 백업 형식 또는 100개 제한 초과입니다.')
  const projects = file.projects.map(validateProject)
  if (new Set(projects.map(p => p.id)).size !== projects.length) throw new Error('백업에 중복된 기록 ID가 있습니다.')
  return projects
}
export function serializeProjects(projects: SelectionProject[]) {
  const raw = JSON.stringify({ format: 'magicup-selection-projects', version: 1, projects }, null, 2)
  parseProjectFile(raw)
  return raw
}
export function mergeProjects(existing: SelectionProject[], incoming: SelectionProject[]) {
  const ids = new Set(existing.map(p => p.id))
  const added = incoming.filter(p => !ids.has(p.id))
  const merged = [...added, ...existing]
  serializeProjects(merged) // Reject the whole import before writing; never truncate or overwrite existing records.
  return { projects: merged, added: added.length, skipped: incoming.length - added.length }
}
