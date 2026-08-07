import type { MotorProduct, MotorSpecs } from '../types'

/**
 * Individual FASTECH integrated-motor variants transcribed from the official
 * motor specification tables.  The family record remains useful for search;
 * this table provides the selectable frame/torque-level data in the detail UI.
 */
export interface FastechMotorVariant {
  id: string
  model: string
  frameSize: number
  holdingTorque: number
  phaseCurrent: number
  rotorInertiaGcm2: number
  lengthMm: number
  weightG: number
}

type VariantRow = readonly [suffix: string, holdingTorque: number, phaseCurrent: number, rotorInertiaGcm2: number, lengthMm: number, weightG: number]

function variants(series: string, rows: readonly VariantRow[]): FastechMotorVariant[] {
  const idPrefix = series.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return rows.map(([suffix, holdingTorque, phaseCurrent, rotorInertiaGcm2, lengthMm, weightG]) => ({
    id: `${idPrefix}-${suffix.toLowerCase()}`,
    model: `${series}-${suffix}`,
    frameSize: Number.parseInt(suffix, 10),
    holdingTorque,
    phaseCurrent,
    rotorInertiaGcm2,
    lengthMm,
    weightG,
  }))
}

export const fastechVariantsBySeries: Record<string, FastechMotorVariant[]> = {
  'Ezi-SERVO II BT': variants('Ezi-SERVO II BT', [
    ['28S', 0.069, 0.95, 9, 32, 170], ['28M', 0.098, 0.95, 13, 45, 227], ['28L', 0.118, 0.95, 18, 50, 257],
    ['42S', 0.32, 1.2, 35, 34, 340], ['42M', 0.44, 1.2, 54, 40, 400], ['42L', 0.5, 1.2, 77, 48, 470], ['42XL', 0.65, 1.2, 114, 60, 600],
    ['56S', 0.64, 3, 180, 46, 640], ['56M', 1, 3, 280, 55, 800], ['56L', 1.5, 3, 520, 80, 1320],
    ['60S', 0.88, 4, 240, 47, 1075], ['60M', 1.28, 4, 490, 56, 1240], ['60L', 2.4, 4, 690, 85, 1800],
  ]),
  'Ezi-SERVO ALL': variants('Ezi-SERVO ALL', [
    ['28S', 0.069, 0.95, 9, 32, 170], ['28M', 0.098, 0.95, 13, 45, 227], ['28L', 0.118, 0.95, 18, 50, 257],
    ['42S', 0.32, 1.2, 35, 34, 340], ['42M', 0.44, 1.2, 54, 40, 400], ['42L', 0.5, 1.2, 77, 48, 470], ['42XL', 0.65, 1.2, 114, 60, 600],
    ['56S', 0.64, 3, 180, 46, 640], ['56M', 1, 3, 280, 55, 800], ['56L', 1.5, 3, 520, 80, 1320], ['60L', 2.4, 4, 690, 85, 1800],
  ]),
  'Ezi-SERVO II EtherCAT ALL': variants('Ezi-SERVO II EtherCAT ALL', [
    ['42M', 0.44, 1.2, 54, 40, 440], ['42L', 0.5, 1.2, 77, 48, 520], ['42XL', 0.65, 1.2, 114, 60, 660],
    ['56S', 0.64, 3, 180, 46, 760], ['56M', 1, 3, 280, 55, 920], ['56L', 1.5, 3, 520, 80, 1360],
    ['60S', 0.88, 4, 240, 47, 840], ['60M', 1.28, 4, 490, 56, 980], ['60L', 2.4, 4, 690, 85, 1540],
    ['86M', 4.5, 6, 1800, 78, 2682], ['86L', 8.5, 6, 3600, 117, 4226], ['86XL', 12, 6, 5400, 155, 5756],
  ]),
  'Ezi-STEP BT': variants('Ezi-STEP BT', [
    ['42S', 0.32, 1.2, 35, 34, 309], ['42M', 0.44, 1.2, 54, 40, 373], ['42L', 0.5, 1.2, 77, 48, 480], ['42XL', 0.65, 1.2, 114, 60, 570],
    ['56S', 0.64, 3, 180, 46, 614], ['56M', 1, 3, 280, 55, 773], ['56L', 1.5, 3, 520, 80, 1261],
    ['86M', 4.5, 6, 1800, 78, 2566], ['86L', 8.5, 6, 3600, 117, 4127], ['86XL', 12, 6, 5400, 155, 5617],
  ]),
  'Ezi-STEP ALL': variants('Ezi-STEP ALL', [
    ['42S', 0.32, 1.2, 35, 34, 340], ['42M', 0.44, 1.2, 54, 40, 405], ['42L', 0.5, 1.2, 77, 48, 480], ['42XL', 0.65, 1.2, 114, 60, 601],
    ['56S', 0.64, 3, 180, 46, 643], ['56M', 1, 3, 280, 55, 802], ['56L', 1.5, 3, 520, 80, 1290],
  ]),
}

/**
 * Frame-specific drive values transcribed from the official 제품보기 drive
 * specification table on each series page.  A family record can only publish the
 * combined range ("24 VDC ±10% / 48 VDC ±10% (모델별)"), which is misleading on a
 * single frame, so the confirmed per-frame value is used whenever one exists.
 * 확인일: 2026-08-07 · 출처: fastech-motions.com 시리즈별 제품보기 드라이브 사양 표.
 */
export interface FastechFrameDriveSpec {
  ratedVoltage: string
  ratedSpeedText?: string
  maxSpeedText?: string
  maxSpeed?: number
}

const fastechFrameDriveSpecs: Record<string, Record<number, FastechFrameDriveSpec>> = {
  'Ezi-SERVO II EtherCAT ALL': {
    42: { ratedVoltage: '24 VDC ±10%', ratedSpeedText: '0–3,000 rpm', maxSpeedText: '3,000 rpm', maxSpeed: 3000 },
    56: { ratedVoltage: '24 VDC ±10%', ratedSpeedText: '0–3,000 rpm', maxSpeedText: '3,000 rpm', maxSpeed: 3000 },
    60: { ratedVoltage: '24 VDC ±10%', ratedSpeedText: '0–3,000 rpm', maxSpeedText: '3,000 rpm', maxSpeed: 3000 },
    86: { ratedVoltage: '48 VDC ±10%', ratedSpeedText: '0–2,000 rpm', maxSpeedText: '2,000 rpm', maxSpeed: 2000 },
  },
  'Ezi-STEP BT': {
    42: { ratedVoltage: '24 VDC ±10%' },
    56: { ratedVoltage: '24 VDC ±10%' },
    86: { ratedVoltage: '40–70 VDC' },
  },
}

export function fastechFrameDriveSpec(series: string, frameSize: number) {
  return fastechFrameDriveSpecs[series]?.[frameSize]
}

export function fastechVariantsFor(product: Pick<MotorProduct, 'brand' | 'series'>) {
  return product.brand === 'FASTECH' ? fastechVariantsBySeries[product.series] ?? [] : []
}

export function fastechVariantSpecs(product: MotorProduct, variant: FastechMotorVariant): MotorSpecs {
  const frame = fastechFrameDriveSpec(product.series, variant.frameSize)
  return {
    ...product.specs,
    ratedVoltage: frame?.ratedVoltage ?? product.specs.ratedVoltage,
    holdingTorque: variant.holdingTorque,
    // The family range must not leak into a single sub-model.
    holdingTorqueText: undefined,
    ratedTorque: undefined,
    ratedTorqueText: undefined,
    torqueBasis: '홀딩 토크(정지 유지 기준)',
    ratedCurrent: undefined,
    ratedCurrentText: undefined,
    phaseCurrentText: `${variant.phaseCurrent} A`,
    currentSummary: `상전류 ${variant.phaseCurrent} A`,
    ratedSpeedText: frame?.ratedSpeedText ?? product.specs.ratedSpeedText,
    maxSpeedText: frame?.maxSpeedText ?? product.specs.maxSpeedText,
    maxSpeed: frame?.maxSpeed ?? product.specs.maxSpeed,
    flange: undefined,
    flangeText: `□${variant.frameSize} mm`,
    inertia: undefined,
    inertiaText: `${variant.rotorInertiaGcm2.toLocaleString('ko-KR')} g·cm² (로터)`,
    length: variant.lengthMm,
    weight: variant.weightG / 1000,
  }
}
