export type CategoryId = 'frameless' | 'robot-module' | 'integrated' | 'ac-servo' | 'dc-servo' | 'stepper'

export type BrandId = 'kinco' | 'robotis' | 'ls-mecapion' | 'komotek' | 'fastech'

export type Manufacturer = 'Kinco' | 'ROBOTIS' | 'LS메카피온' | 'KOMOTEK' | 'FASTECH'

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
