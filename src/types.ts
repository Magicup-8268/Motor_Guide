export type CategoryId = 'frameless' | 'robot-module' | 'integrated' | 'ac-servo' | 'dc-servo' | 'stepper' | 'brake'

export type BrandId = 'kinco' | 'robotis' | 'ls-mecapion' | 'komotek' | 'fastech' | 'mikipulley'

export type Manufacturer = 'Kinco' | 'ROBOTIS' | 'LS메카피온' | 'KOMOTEK' | 'FASTECH' | '미키풀리'

/** 모터가 아닌 제동용 부품(무여자 작동형 브레이크 등)을 구분한다. */
export const brakeCategoryId: CategoryId = 'brake'

/** Whether a catalog entry is intended for new selection or retained as an official legacy reference. */
export type ProductLifecycle = 'current' | 'legacy'

export interface BrandCatalog {
  id: BrandId
  name: string
  englishName: string
  description: string
  officialUrl?: string
  accent: string
}

export interface MotorCategory {
  id: CategoryId
  name: string
  eyebrow: string
  description: string
  useCase: string
  accent: string
}

export interface MotorSpecs {
  ratedVoltage?: string
  dcInputRange?: string
  ratedPower?: number
  ratedPowerOptions?: number[]
  powerRange?: string
  /** A published family-range upper bound used only for minimum-power filtering. */
  selectionMaxPower?: number
  ratedTorque?: number
  ratedTorqueText?: string
  maxTorque?: number
  maxTorqueText?: string
  /** Published torque basis such as stall, continuous, or peak. */
  torqueBasis?: string
  holdingTorque?: number
  /** Published holding-torque range text when a family covers several frame sizes. */
  holdingTorqueText?: string
  ratedCurrent?: number
  ratedCurrentText?: string
  /** Published per-phase current for stepping/closed-loop stepping motors, which is not a rated servo current. */
  phaseCurrentText?: string
  maxCurrent?: number
  maxCurrentText?: string
  ratedSpeed?: number
  ratedSpeedText?: string
  maxSpeed?: number
  maxSpeedText?: string
  gearRatio?: string
  resolution?: string
  baudRate?: string
  physicalConnection?: string
  feedback?: string
  operatingModes?: string
  inputCurrent?: string
  continuousCurrent?: string
  peakCurrent?: string
  currentSummary?: string
  phase?: string
  flange?: number
  flangeText?: string
  phaseResistance?: string
  phaseInductance?: string
  inertia?: number
  /** Manufacturer-published inertia text when the native unit is not kg·cm². */
  inertiaText?: string
  leads?: number
  shaft?: string
  length?: number
  weight?: number
  stepAngle?: number
  ipRating?: string
  encoder?: string
  brake?: string
  protocols?: string[]
  safety?: string
  operatingTemperature?: string

  // ── 브레이크(무여자 작동형) 전용 공개 사양 ──────────────────────────────
  /** 정지 마찰 토크(Nm). 브레이크의 대표 성능값이며 모터의 정격 토크와 다르다. */
  staticFrictionTorque?: number
  /** 제품군이 여러 프레임을 포함할 때의 정지 마찰 토크 범위 표기. */
  staticFrictionTorqueText?: string
  /** 브레이크 작동 방식(예: 무여자 작동형 — 전원 차단 시 스프링으로 제동). */
  brakeAction?: string
  /** 아마추어 흡인 시간(초). 통전 후 제동이 풀리기까지의 시간. */
  armaturePullInTime?: string
  /** 공개된 백래시 값. */
  backlashText?: string
  /** 총 제동 일량(J). */
  totalBrakingEnergy?: string
  /** 코일 저항(Ω). */
  coilResistance?: string
  /** 외경(A) 치수. */
  outerDiameterText?: string
  /** 볼트 원 지름(B) 치수. */
  boltCircleText?: string
  /** 스테이터 내경(C) 치수. */
  statorInnerDiameterText?: string
  /** 전고(K) 치수. */
  overallHeightText?: string
  /** 표준 축공 지름 범위. */
  boreRangeText?: string
  /** 선택 가능한 허브 방식과 해당 품번. */
  hubOptions?: string
}

export interface MotorProduct {
  id: string
  brand: Manufacturer
  model: string
  series: string
  /** Product-family label used when a manufacturer has multiple actuator platforms. */
  family?: string
  /** Current selection lineup or legacy/maintenance reference. */
  lifecycle?: ProductLifecycle
  categoryId: CategoryId
  summary: string
  features: string[]
  tags: string[]
  specs: MotorSpecs
  officialUrl: string
  sourceChecked: string
  weight: number
}
