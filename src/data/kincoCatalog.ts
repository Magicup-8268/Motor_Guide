import type { CategoryId, MotorProduct, MotorSpecs } from '../types'

const checked = '2026-07-14'

const urls = {
  fmc: 'https://www.kincoautomation.com/product/robot/fmc',
  ifmh: 'https://www.kincoautomation.com/product/robot/273',
  igmk: 'https://www.kincoautomation.com/product/robot/igmk-2',
  ismk: 'https://www.kincoautomation.com/product/robot/ismk-2',
  md: 'https://www.kincoautomation.com/product/robot/md-2',
  iswv: 'https://www.kincoautomation.com/product/robot/iswv',
  iwmc: 'https://www.kincoautomation.com/product/robot/iwmc',
  productCenter: 'https://www.kincoautomation.com/products/',
  smkAc: 'https://www.kincoautomation.com/product/automation/smk',
  smh: 'https://www.kincoautomation.com/product/automation/smh',
  smcDc48: 'https://www.kincoautomation.com/product/automation/smc-48v',
  smkDc48: 'https://www.kincoautomation.com/product/automation/smk-48v',
  smkDc96: 'https://www.kincoautomation.com/product/automation/smk-96v',
  stepper: 'https://www.kincoautomation.com/product/automation/stepper',
}

function idFor(model: string) {
  return model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const verifiedAcModelSpecs: Array<{ prefix: string; suffix?: string; specs: MotorSpecs }> = [
  { prefix: 'SMK40S-0005', specs: { ratedVoltage: '220 VAC', ratedPower: 50, ratedTorque: 0.16, maxTorque: 0.56, ratedSpeed: 3000, maxSpeed: 6000, ratedCurrent: 0.88, maxCurrent: 3.3, ipRating: 'IP65 (축단 IP54)', brake: 'A: 브레이크 없음 / B: 0.32 Nm 브레이크 옵션', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK40S-0010', specs: { ratedVoltage: '220 VAC', ratedPower: 100, ratedTorque: 0.32, maxTorque: 1.11, ratedSpeed: 3000, maxSpeed: 6000, ratedCurrent: 1.2, maxCurrent: 4.4, ipRating: 'IP65 (축단 IP54)', brake: 'A: 브레이크 없음 / B: 0.32 Nm 브레이크 옵션', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK60S-0020', specs: { ratedVoltage: '220 VAC', ratedPower: 200, ratedTorque: 0.64, maxTorque: 1.92, ratedSpeed: 3000, maxSpeed: 6000, ratedCurrent: 1.55, maxCurrent: 5, ipRating: 'IP65 (축단 IP54)', brake: 'A: 브레이크 없음 / B: 2 Nm 브레이크 옵션', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK60S-0040', specs: { ratedVoltage: '220 VAC', ratedPower: 400, ratedTorque: 1.27, maxTorque: 3.81, ratedSpeed: 3000, maxSpeed: 6000, ratedCurrent: 2.93, maxCurrent: 9.4, ipRating: 'IP65 (축단 IP54)', brake: 'A: 브레이크 없음 / B: 2 Nm 브레이크 옵션', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK80S-0075', specs: { ratedVoltage: '220 VAC', ratedPower: 750, ratedTorque: 2.39, maxTorque: 7.17, ratedSpeed: 3000, maxSpeed: 6000, ratedCurrent: 3.9, maxCurrent: 12.4, ipRating: 'IP65 (축단 IP54)', brake: 'A: 브레이크 없음 / B: 4 Nm 브레이크 옵션', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK80S-0100', specs: { ratedVoltage: '220 VAC', ratedPower: 1000, ratedTorque: 3.18, maxTorque: 9.54, ratedSpeed: 3000, maxSpeed: 5000, ratedCurrent: 5.3, maxCurrent: 16, ipRating: 'IP65 (축단 IP54)', brake: 'A: 브레이크 없음 / B: 4 Nm 브레이크 옵션', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK60D-0020', specs: { ratedVoltage: '220 VAC', ratedPower: 200, ratedTorque: 0.64, maxTorque: 2.26, ratedSpeed: 3000, ratedCurrent: 1.3, maxCurrent: 5, ipRating: 'IP65 (축단 IP54)', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK60D-0040', specs: { ratedVoltage: '220 VAC', ratedPower: 400, ratedTorque: 1.27, maxTorque: 4.45, ratedSpeed: 3000, ratedCurrent: 2.3, maxCurrent: 9, ipRating: 'IP65 (축단 IP54)', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK80D-0075', specs: { ratedVoltage: '220 VAC', ratedPower: 750, ratedTorque: 2.39, maxTorque: 7.17, ratedSpeed: 3000, ratedCurrent: 4, maxCurrent: 12.7, ipRating: 'IP65 (축단 IP54)', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK80D-0100', specs: { ratedVoltage: '220 VAC', ratedPower: 1000, ratedTorque: 3.18, maxTorque: 9.54, ratedSpeed: 3000, ratedCurrent: 5.5, maxCurrent: 16.9, ipRating: 'IP65 (축단 IP54)', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK130G-0085', specs: { ratedVoltage: '220 VAC', ratedPower: 850, ratedTorque: 5.39, maxTorque: 16.2, ratedSpeed: 1500, maxSpeed: 3500, ratedCurrent: 5.4, maxCurrent: 16.7, ipRating: 'IP65 (축단 IP54)', brake: '20 Nm 브레이크 옵션', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMK130G-0130', specs: { ratedVoltage: '220 VAC', ratedPower: 1300, ratedTorque: 8.27, maxTorque: 24.81, ratedSpeed: 1500, maxSpeed: 3500, ratedCurrent: 7.5, maxCurrent: 22.8, ipRating: 'IP65 (축단 IP54)', brake: '20 Nm 브레이크 옵션', protocols: ['RS485 · Pulse', 'EtherCAT (옵션)'], operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMC130D-0100-20', specs: { ratedVoltage: '300 VDC 링크', ratedPower: 1000, ratedTorque: 4.78, maxTorque: 14.34, ratedSpeed: 2000, ratedCurrent: 4.5, maxCurrent: 14.5, ipRating: 'IP65 (축단 IP54)', operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMC130D-0100-10', specs: { ratedVoltage: '300 VDC 링크', ratedPower: 1000, ratedTorque: 9.55, maxTorque: 20, ratedSpeed: 1000, ratedCurrent: 4.6, maxCurrent: 10, ipRating: 'IP65 (축단 IP54)', operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMC130D-0150-20', specs: { ratedVoltage: '300 VDC 링크', ratedPower: 1500, ratedTorque: 7.16, maxTorque: 21.5, ratedSpeed: 2000, ratedCurrent: 7.7, maxCurrent: 25, ipRating: 'IP65 (축단 IP54)', operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMC130D-0200-20', specs: { ratedVoltage: '300 VDC 링크', ratedPower: 2000, ratedTorque: 9.55, maxTorque: 28.65, ratedSpeed: 2000, ratedCurrent: 9.5, maxCurrent: 30, ipRating: 'IP65 (축단 IP54)', operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMC130D-0150-20', suffix: '5HSP', specs: { ratedVoltage: '560 VDC 링크', ratedPower: 1500, ratedTorque: 7.16, maxTorque: 21.5, ratedSpeed: 2000, ratedCurrent: 3.85, maxCurrent: 12.5, ipRating: 'IP65 (축단 IP54)', operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMC130D-0150-10', suffix: '5HSP', specs: { ratedVoltage: '560 VDC 링크', ratedPower: 1500, ratedTorque: 14.33, maxTorque: 30, ratedSpeed: 1000, ratedCurrent: 3.8, maxCurrent: 7.6, ipRating: 'IP65 (축단 IP54)', operatingTemperature: '-20–40 °C' } },
  { prefix: 'SMC130D-0200-20', suffix: '5HSP', specs: { ratedVoltage: '560 VDC 링크', ratedPower: 2000, ratedTorque: 9.55, maxTorque: 28.65, ratedSpeed: 2000, ratedCurrent: 4.75, maxCurrent: 15, ipRating: 'IP65 (축단 IP54)', operatingTemperature: '-20–40 °C' } },
]

const verifiedDcModelSpecs: Array<{ prefix: string; suffix?: string; specs: MotorSpecs }> = [
  { prefix: 'SMC40S-0005', specs: { ratedVoltage: '48 VDC', ratedPower: 50, ratedTorque: 0.16, maxTorque: 0.48, ratedSpeed: 3000, ratedCurrent: 1.5, maxCurrent: 5.5 } },
  { prefix: 'SMC40S-0010', specs: { ratedVoltage: '48 VDC', ratedPower: 100, ratedTorque: 0.32, maxTorque: 0.96, ratedSpeed: 3000, ratedCurrent: 3.2, maxCurrent: 11.5 } },
  { prefix: 'SMC60S-0020', specs: { ratedVoltage: '48 VDC', ratedPower: 200, ratedTorque: 0.64, maxTorque: 1.92, ratedSpeed: 3000, ratedCurrent: 5.7, maxCurrent: 18.2 } },
  { prefix: 'SMC60S-0040', specs: { ratedVoltage: '48 VDC', ratedPower: 400, ratedTorque: 1.27, maxTorque: 3.81, ratedSpeed: 3000, ratedCurrent: 10.6, maxCurrent: 33.9 } },
  { prefix: 'SMC60S-0060', specs: { ratedVoltage: '48 VDC', ratedPower: 600, ratedTorque: 1.91, maxTorque: 5.73, ratedSpeed: 3000, ratedCurrent: 16.5, maxCurrent: 52.8 } },
  { prefix: 'SMC80S-0075', specs: { ratedVoltage: '48 VDC', ratedPower: 750, ratedTorque: 2.39, maxTorque: 7.17, ratedSpeed: 3000, ratedCurrent: 19.9, maxCurrent: 62.7 } },
  { prefix: 'SMC80S-0100', specs: { ratedVoltage: '48 VDC', ratedPower: 1000, ratedTorque: 3.18, maxTorque: 9.57, ratedSpeed: 3000, ratedCurrent: 26.4, maxCurrent: 83 } },
  { prefix: 'SMC80S-0120', specs: { ratedVoltage: '48 VDC', ratedPower: 1200, ratedTorque: 3.82, maxTorque: 11.5, ratedSpeed: 3000, ratedCurrent: 34, maxCurrent: 107.1 } },
  { prefix: 'SMC80S-0150', specs: { ratedVoltage: '48 VDC', ratedPower: 1500, ratedTorque: 4.77, maxTorque: 14.31, ratedSpeed: 3000, ratedCurrent: 36, maxCurrent: 112.2 } },
  { prefix: 'SMC60S-0020-30W', specs: { ratedVoltage: '48 VDC', ratedPower: 200, ratedTorque: 0.64, maxTorque: 1.28, ratedSpeed: 3000, ratedCurrent: 5.7, maxCurrent: 11.4 } },
  { prefix: 'SMC60S-0040-30W', specs: { ratedVoltage: '48 VDC', ratedPower: 400, ratedTorque: 1.27, maxTorque: 2.54, ratedSpeed: 3000, ratedCurrent: 10.6, maxCurrent: 21.2 } },
  { prefix: 'SMC60S-0040-30Z', specs: { ratedVoltage: '48 VDC', ratedPower: 400, ratedTorque: 1.27, maxTorque: 2.54, ratedSpeed: 3000, ratedCurrent: 10.6, maxCurrent: 21.2 } },
]

const verifiedStepperSpecs: Array<{ prefix: string; specs: MotorSpecs }> = [
  { prefix: '2S57Q-1376', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 1.3, ratedCurrentText: '2.8 A (직렬) / 5.6 A (병렬)', phaseResistance: '1.0 Ω', phaseInductance: '2.1 mH', inertia: 0.48, leads: 8, shaft: 'Ø6.35 mm', length: 76, weight: 1, ipRating: 'IP40' } },
  { prefix: '2S57Q-2280', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 2.2, ratedCurrentText: '2.8 A (직렬) / 5.6 A (병렬)', phaseResistance: '0.8 Ω', phaseInductance: '1.8 mH', inertia: 0.53, leads: 8, shaft: 'Ø8 mm', length: 80, weight: 1.1, ipRating: 'IP40' } },
  { prefix: '2S57Q-25B2', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 2.5, ratedCurrent: 2.5, phaseResistance: '1.0 Ω', phaseInductance: '1.8 mH', inertia: 0.8, leads: 6, shaft: 'Ø8 mm', length: 112, weight: 1.7, ipRating: 'IP40' } },
  { prefix: '2S86Q-3465', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 3.4, ratedCurrent: 6, phaseResistance: '0.3 Ω', phaseInductance: '1.7 mH', inertia: 1, leads: 4, shaft: 'Ø13 mm', length: 65, weight: 1.7, ipRating: 'IP40' } },
  { prefix: '2S86Q-4580', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 4.5, ratedCurrent: 6, phaseResistance: '0.38 Ω', phaseInductance: '3.5 mH', inertia: 1.4, leads: 4, shaft: 'Ø13 mm', length: 80, weight: 2.3, ipRating: 'IP40' } },
  { prefix: '2S86Q-85B8', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 8.5, ratedCurrent: 6, phaseResistance: '0.6 Ω', phaseInductance: '6 mH', inertia: 3.4, leads: 4, shaft: 'Ø13 mm', length: 118, weight: 3.7, ipRating: 'IP40' } },
  { prefix: '2S86Q-051F6', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 12.8, ratedCurrent: 6, phaseResistance: '0.85 Ω', phaseInductance: '10 mH', inertia: 4, leads: 4, shaft: 'Ø15.875 mm', length: 156, weight: 5.3, ipRating: 'IP40' } },
  { prefix: '2S110Q-03999', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 11.7, ratedCurrent: 5.5, phaseResistance: '0.7 Ω', phaseInductance: '9.8 mH', inertia: 5.5, leads: 4, shaft: 'Ø19 mm', length: 99, weight: 5, ipRating: 'IP40' } },
  { prefix: '2S110Q-047F0', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 21, ratedCurrent: 6.5, phaseResistance: '0.72 Ω', phaseInductance: '12.8 mH', inertia: 10.9, leads: 4, shaft: 'Ø19 mm', length: 150, weight: 8.4, ipRating: 'IP40' } },
  { prefix: '2S110Q-054K1', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 30, ratedCurrent: 8, phaseResistance: '0.67 Ω', phaseInductance: '11 mH', inertia: 16.2, leads: 4, shaft: 'Ø19 mm', length: 201, weight: 11.7, ipRating: 'IP40' } },
  { prefix: '2S130Y-039M0', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 27, ratedCurrent: 6, phaseResistance: '0.65 Ω', phaseInductance: '13.8 mH', inertia: 33.3, leads: 4, shaft: 'Ø19 mm', length: 165, weight: 13, ipRating: 'IP40' } },
  { prefix: '2S130Y-063R8', specs: { phase: '2상', stepAngle: 1.8, holdingTorque: 40, ratedCurrent: 7, phaseResistance: '0.9 Ω', phaseInductance: '9.5 mH', inertia: 48.4, leads: 4, shaft: 'Ø19 mm', length: 230, weight: 19, ipRating: 'IP40' } },
  { prefix: '3S57Q-04056', specs: { phase: '3상', stepAngle: 1.2, holdingTorque: 0.9, ratedCurrent: 5.6, phaseResistance: '0.7 Ω', phaseInductance: '1.7 mH', inertia: 0.3, leads: 6, shaft: 'Ø6.35 mm', length: 56, weight: 0.72, ipRating: 'IP40' } },
  { prefix: '3S57Q-04079', specs: { phase: '3상', stepAngle: 1.2, holdingTorque: 1.5, ratedCurrent: 5.8, phaseResistance: '1.05 Ω', phaseInductance: '2.4 mH', inertia: 0.48, leads: 6, shaft: 'Ø8 mm', length: 79, weight: 1, ipRating: 'IP40' } },
  { prefix: '3S85Q-04097', specs: { phase: '3상', stepAngle: 1.2, holdingTorque: 4, ratedCurrent: 5.8, phaseResistance: '1.1 Ω', phaseInductance: '4.6 mH', inertia: 2.32, leads: 6, shaft: 'Ø12 mm', length: 97, weight: 2.7, ipRating: 'IP40' } },
  { prefix: '3S85Q-040F7', specs: { phase: '3상', stepAngle: 1.2, holdingTorque: 7.5, ratedCurrent: 4, phaseResistance: '1.78 Ω', phaseInductance: '17.1 mH', inertia: 0.44, leads: 3, shaft: 'Ø14 mm', length: 157, weight: 5.3, ipRating: 'IP40' } },
]

function verifiedSpecsFor(name: string, categoryId: CategoryId) {
  const candidates: Array<{ prefix: string; suffix?: string; specs: MotorSpecs }> = categoryId === 'ac-servo' ? verifiedAcModelSpecs : categoryId === 'dc-servo' ? verifiedDcModelSpecs : categoryId === 'stepper' ? verifiedStepperSpecs : []
  const preciseMatch = candidates.find((entry) => entry.suffix && name.startsWith(entry.prefix) && name.endsWith(entry.suffix))
  return preciseMatch?.specs ?? candidates.find((entry) => !entry.suffix && name.startsWith(entry.prefix))?.specs ?? {}
}

function model(
  name: string,
  series: string,
  categoryId: CategoryId,
  officialUrl: string,
  options: {
    summary?: string
    features?: string[]
    tags?: string[]
    specs?: MotorSpecs
    weight?: number
  } = {},
): MotorProduct {
  return {
    id: `catalog-${idFor(name)}`,
    brand: 'Kinco',
    model: name,
    series,
    categoryId,
    summary: options.summary ?? 'Kinco 공식 제품 페이지에서 모델명을 확인했습니다. 공개 수치는 원문 사양표에서만 제공합니다.',
    features: options.features ?? ['공식 모델명 확인', '원문 사양표 연결'],
    tags: options.tags ?? [series, '공식 모델명', '원문 확인'],
    specs: { ...(options.specs ?? {}), ...verifiedSpecsFor(name, categoryId) },
    officialUrl,
    sourceChecked: checked,
    weight: options.weight ?? 35,
  }
}

const fmkSpecs = [
  ['FMK03807-0005-3518N-7DP02', 50, 0.135, 0.405, 1.7, 5.491, 3500, 5500],
  ['FMK04311-0008-3725N-7DP02', 77, 0.2, 0.6, 2.2, 6.7, 3700, 5000],
  ['FMK05015-0018-3530N-10DP22', 183, 0.5, 1.5, 5, 15, 3500, 4800],
  ['FMK06008-0007-1630H-10DP00', 75, 0.45, 1.35, 2.4, 7.2, 1600, 2530],
  ['FMK06018-0026-3628N-10DP02', 264, 0.7, 1.4, 8.35, 9.18, 3600, 5300],
  ['FMK07011-0025-3642N-10DP02', 252, 0.66, 1.98, 6.1, 18.5, 3650, 4570],
  ['FMK07019-0044-3042N-10DP22', 440, 1.4, 5.4, 12.7, 55, 3000, 4000],
  ['FMK08523-0073-3542N-10DP02', 732, 2, 6, 16.5, 49.5, 3500, 4000],
] as const

const fmk = fmkSpecs.map(([name, ratedPower, ratedTorque, maxTorque, ratedCurrent, maxCurrent, ratedSpeed, maxSpeed]) =>
  model(name, 'FMK', 'frameless', 'https://www.kincoautomation.com/product/robot/fmk', {
    summary: '48 VDC 프레임리스 토크 모터. 로봇 관절과 감속기 통합 설계에 쓰이는 FMK 모델입니다.',
    features: ['프레임리스 구조', '48 VDC', '공개 사양표 수집'],
    tags: ['FMK', '프레임리스', '토크 모터', '48V'],
    specs: { ratedVoltage: '48 VDC', ratedPower, ratedTorque, maxTorque, ratedCurrent, maxCurrent, ratedSpeed, maxSpeed },
    weight: 96,
  }),
)

const fmcValues = [
  ['FMC05705-0007-3028N-8DS00', 75, 0.24, 0.72, 1.91, 5.9, 3000, 3800],
  ['FMC05707-0011-3528N-8DS00', 117, 0.32, 0.96, 3.2, 10.5, 3500, 4300],
  ['FMC05714-0020-3027N-8DS00', 200, 0.64, 1.92, 5.1, 15.6, 3000, 4000],
  ['FMC06012-0014-3128N-8DK00', 146, 0.45, 1.25, 3.4, 10.88, 3100, 3400],
  ['FMC06805-0010-3034N-8DS00', 101, 0.32, 0.96, 2.8, 8.4, 3000, 3900],
  ['FMC06808-0015-3034N-8DS00', 157, 0.5, 1.5, 4.5, 13.5, 3000, 3900],
  ['FMC06813-0025-3034N-8DS00', 251, 0.8, 2.4, 7, 21, 3000, 3900],
  ['FMC07605-0012-3038N-8DS00', 117, 0.32, 0.96, 3.2, 10.5, 3000, 4300],
  ['FMC07712-0031-3033N-8DS00', 314, 1, 3, 7.65, 24, 3000, 4000],
  ['FMC07730-0075-3035N-8DS00', 750, 2.39, 7.17, 18.6, 61, 3000, 3800],
  ['FMC08505-0015-3042N-8DS00', 157, 0.5, 1.5, 5, 16.3, 3000, 3900],
  ['FMC08508-0031-3042N-8DS00', 314, 1, 3, 8.8, 26.4, 3000, 4100],
  ['FMC08518-0062-3042N-8DS00', 628, 2, 6, 21.3, 63.9, 3000, 5000],
  ['FMC09114-0063-3046N-8DS01', 630, 2, 5, 16.2, 43.5, 3000, 4000],
  ['FMC10414-0072-3055N-8DS01', 723, 2.3, 6.9, 18.9, 56.7, 3000, 3900],
  ['FMC10422-0100-3047N-8DS00', 1000, 3.18, 9.54, 27, 89, 3000, 3800],
  ['FMC10429-0100-2543N-8DS00', 1050, 4, 12, 22.5, 74.1, 2500, 2650],
  ['FMC12330-0100-2060N-5DS00', 1000, 4.78, 14.3, 22, 71, 2000, 2290],
  ['FMC12718-0090-2465N-8DS00', 904, 3.6, 10.8, 24, 72, 2400, 3250],
  ['FMC12730-0160-2457N-8DS00', 1600, 6.37, 19.11, 35.3, 110, 2400, 2600],
  ['FMC13224-0118-3243N-8DK00', 1180, 3.5, 8.4, 29.2, 70, 3220, 3800],
] as const

const fmcUnprofiled: string[] = []

const fmc = [
  ...fmcValues.map(([name, ratedPower, ratedTorque, maxTorque, ratedCurrent, maxCurrent, ratedSpeed, maxSpeed]) =>
    model(name, 'FMC', 'frameless', urls.fmc, {
      summary: '48 VDC 프레임리스 토크 모터. Kinco FMC 공개 사양표 수치를 반영했습니다.',
      features: ['프레임리스 구조', '48 VDC', '공개 사양표 수집'],
      tags: ['FMC', '프레임리스', '토크 모터', '48V'],
      specs: { ratedVoltage: '48 VDC', ratedPower, ratedTorque, maxTorque, ratedCurrent, maxCurrent, ratedSpeed, maxSpeed },
      weight: 94,
    }),
  ),
  ...fmcUnprofiled.map((name) => model(name, 'FMC', 'frameless', urls.fmc, {
    summary: '48 VDC 프레임리스 토크 모터. 공식 페이지의 모델명만 확인되어 세부 수치는 원문에서 확인해야 합니다.',
    features: ['프레임리스 구조', '48 VDC', '공개 모델명 확인'],
    tags: ['FMC', '프레임리스', '토크 모터', '48V', '원문 확인'],
    specs: { ratedVoltage: '48 VDC' },
    weight: 58,
  })),
]

const ifmh = [
  ['iFMH55H', 29.8, 7.7, 35, 37, 50, '100:1', 'Φ55 × 70 mm', 'Φ8.4 mm'],
  ['iFMH60H', 99, 27, 71, 35, 48, '100:1', 'Φ62 × 76 mm', 'Φ8.5 mm'],
  ['iFMH70H', 110.4, 34, 95, 31, 38, '100:1', 'Φ70 × 76 mm', 'Φ12 mm'],
  ['iFMH80H', 186.9, 51, 143, 35, 45, '101:1', 'Φ80 × 84 mm', 'Φ16 mm'],
] as const

const ifmhModels = ifmh.map(([name, ratedPower, ratedTorque, maxTorque, ratedSpeed, maxSpeed, gearRatio, dimensions, hollowBore]) =>
  model(name, 'iFMH', 'robot-module', urls.ifmh, {
    summary: `48 VDC 일체형 관절 모듈. 감속비 ${gearRatio}, 중공 보어 ${hollowBore} 사양입니다.`,
    features: ['일체형 관절 모듈', '19-bit 절대 엔코더', `감속비 ${gearRatio}`],
    tags: ['iFMH', '관절 모듈', '48V', '중공축', gearRatio],
    specs: { ratedVoltage: '48 VDC', dcInputRange: '20–72 VDC', ratedPower, ratedTorque, maxTorque, ratedSpeed, maxSpeed, encoder: '19-bit 절대 엔코더', protocols: ['CAN FD'], shaft: `중공 보어 ${hollowBore}`, length: Number(dimensions.match(/×\s*(\d+)/)?.[1]) },
    weight: 93,
  }),
)

const platformProducts = [
  model('iGMK Series', 'iGMK', 'integrated', urls.igmk, {
    summary: '서보 드라이브·모터·감속기·필드버스를 통합한 모듈형 로봇 관절 솔루션입니다.',
    features: ['드라이브·모터·감속기 통합', '감속기 출력축 최대 1,000 Nm', 'IP54 · CANopen·Modbus RTU'],
    tags: ['iGMK', '통합 서보', '로봇 관절', '400–750W'],
    specs: {
      ratedVoltage: '48 VDC (입력 허용 24–60 VDC)',
      ratedPowerOptions: [400, 750],
      powerRange: '400–750 W',
      ratedTorqueText: '11.81–468 Nm (감속기 출력축)',
      maxTorqueText: '30–1,000 Nm (감속기 출력축)',
      inputCurrent: '10 / 10.3 / 18.1 A (400 / 400 / 750 W)',
      maxCurrentText: '32.1 / 33 / 62 A',
      currentSummary: '정격 10 / 10.3 / 18.1 A · 최대 32.1 / 33 / 62 A',
      ratedSpeedText: '12.2–300 rpm (감속비별)',
      maxSpeedText: '14–350 rpm (감속비별)',
      ipRating: 'IP54',
      encoder: '내장 엔코더',
      brake: '홀딩 브레이크 옵션: 2 / 1.5 / 4 Nm',
      protocols: ['CANopen (최대 1 Mbps)', 'Modbus RTU / RS485 (최대 115.2 kbps)'],
      safety: '과전압·저전압·모터 I²T·단락·드라이브 과열 보호',
      operatingTemperature: '-20–40 °C',
    },
    weight: 90,
  }),
  model('iSMK Series', 'iSMK', 'integrated', urls.ismk, {
    summary: '모터·드라이브·엔코더·브레이크를 통합한 저전압 서보 모터 시리즈입니다.',
    features: ['50–750 W', '표준 IP65 / 옵션 IP67', 'CANopen·Modbus RTU·EtherCAT'],
    tags: ['iSMK', '통합 서보', '24–60V', 'EtherCAT'],
    specs: {
      ratedVoltage: '24–60 VDC',
      dcInputRange: '24–60 VDC',
      ratedPowerOptions: [100, 200, 400, 750],
      powerRange: '100–750 W',
      ratedTorqueText: '0.32 / 0.64 / 1.27 / 2.39 Nm (100 / 200 / 400 / 750 W)',
      maxTorqueText: '0.96 / 1.92 / 3.81 / 7.17 Nm',
      ratedSpeed: 3000,
      ratedCurrentText: '4 / 7 / 12 / 23 Arms (최대 연속 출력)',
      maxCurrentText: '18 / 24 / 48 / 100 Ap (피크)',
      currentSummary: '최대 연속 4 / 7 / 12 / 23 Arms · 피크 18 / 24 / 48 / 100 Ap',
      ipRating: 'IP65 (표준, 축단 IP54) / IP67 (저온·고보호 옵션, 축단 IP54)',
      encoder: '단회전 자기식 엔코더',
      brake: 'A: 브레이크 없음 / B: 브레이크 옵션 · 외부 브레이크 모듈 필요',
      protocols: ['Modbus RTU / RS485', 'CANopen (최대 1 Mbps)', 'EtherCAT (CoE / CiA402, 100 Mbps)'],
      safety: '과전압 · 저전압 · 모터 I²T · 단락 · 드라이브 과열 보호',
      operatingTemperature: '-20–40 °C (IP67 옵션: -40–40 °C)',
    },
    weight: 90,
  }),
  model('MD Series', 'MD', 'integrated', urls.md, {
    summary: '스마트 물류용 일체형 저전압 서보 모터·드라이브 시리즈입니다.',
    features: ['모터·드라이브 통합', '스마트 물류용', '다중 통신 지원'],
    tags: ['MD', '통합 서보', '스마트 물류', 'CANopen'],
    specs: {
      ratedVoltage: '24–60 VDC',
      dcInputRange: '24–60 VDC',
      ratedPowerOptions: [200, 400, 750],
      ratedTorqueText: '0.64 / 1.27 / 2.39 Nm (200 / 400 / 750 W)',
      maxTorqueText: '1.92 / 3.81 / 7.17 Nm',
      ratedSpeed: 3000,
      ratedCurrentText: '5 / 10 / 20 Arms',
      maxCurrentText: '21 / 36 / 80 Ap (피크)',
      currentSummary: '정격 5 / 10 / 20 Arms · 피크 21 / 36 / 80 Ap',
      encoder: '16-bit 단회전 자기식 엔코더',
      brake: 'A: 브레이크 없음 / B: 브레이크 옵션',
      protocols: ['L: RS232 · RS485 · Pulse', 'C: RS232 · CANopen · Pulse', 'E: RS232 · EtherCAT (CoE / CiA402)', 'P: RS232 · Profinet'],
      safety: '과전압 · 저전압 · 모터 I²T · 단락 · 드라이브 과열 보호',
    },
    weight: 83,
  }),
  model('iSWV Series', 'iSWV', 'robot-module', urls.iswv, {
    summary: 'Kinco 제품 센터에 등록된 통합 서보 휠 모듈 시리즈입니다.',
    features: ['통합 서보 휠 모듈', '공식 제품 페이지 연결'],
    tags: ['iSWV', '서보 휠', '로봇 모듈', 'CANopen', 'EtherCAT'],
    specs: {
      ratedVoltage: '48 VDC (로직 전원 24 VDC, 0.5 A 옵션)',
      powerRange: '보행 감속 출력 264 W · 조향 감속 출력 174 W',
      ratedTorqueText: '보행 감속 9 Nm · 조향 감속 6 Nm',
      maxTorqueText: '조향 감속 13.5 Nm',
      ratedSpeedText: '보행 감속 280 rpm · 조향 감속 277 rpm',
      maxSpeedText: '조향 감속 330 rpm · 보행 선속 2.2 m/s',
      currentSummary: '보행 정격 8.5 A · 최대 25 Arms / 조향 정격 6.5 A · 최대 14.3 Arms',
      ipRating: '보행 모듈 IP54 · 조향 모듈 IP20',
      brake: '보행 모듈 브레이크 회로 내장',
      protocols: ['Modbus RTU / RS485', 'CANopen (최대 1 Mbps)', 'EtherCAT (CoE / CiA402, 100 Mbps)'],
      safety: '과전압 68±2 V · 저전압 18±2 V 알람',
      operatingTemperature: '0–40 °C',
    },
    weight: 70,
  }),
  model('iWMC Series', 'iWMC', 'robot-module', urls.iwmc, {
    summary: 'Kinco 제품 센터에 등록된 통합 모터 컨트롤러 휠 시리즈입니다.',
    features: ['모터 컨트롤러 휠', '공식 제품 페이지 연결'],
    tags: ['iWMC', '휠 모듈', '로봇 모듈', 'CANopen', 'RS485'],
    specs: {
      ratedVoltage: '48 VDC (입력 허용 24–60 VDC) · 로직 전원 24 VDC',
      ratedPowerOptions: [500, 950, 980],
      ratedTorqueText: '22 / 40 / 54 / 75 Nm (감속 출력)',
      maxTorqueText: '66 / 99 / 150 / 200 Nm',
      ratedSpeedText: '222 / 227 / 167 / 125 rpm',
      maxSpeedText: '290 / 263 / 193 / 145 rpm',
      currentSummary: '정격 12.5 / 25 / 25 / 25 A · 최대 40 / 69 / 69 / 69 A',
      ipRating: 'IP54 (케이블 커넥터 제외)',
      brake: '4 Nm 홀딩 브레이크 옵션 · 외부 브레이크 저항',
      protocols: ['Modbus RTU / RS485', 'CANopen (최대 1 Mbps)'],
      safety: '과전압 · 저전압 · 모터 I²T · 단락 · 드라이브 과열 보호',
      operatingTemperature: '-20–40 °C',
    },
    weight: 68,
  }),
  model('iSML Series', 'iSML', 'robot-module', urls.productCenter, {
    summary: 'Kinco 제품 센터에 등록된 통합 서보 휠 허브 모터 시리즈입니다.',
    features: ['서보 휠 허브 모터', '공식 제품 센터 연결'],
    tags: ['iSML', '휠 허브 모터', '로봇 모듈', 'CANopen'],
    specs: { protocols: ['CANopen'] },
    weight: 66,
  }),
]

const smcAcMore = [
  'SMC130D-0100-20□■K-5LSP',
  'SMC130D-0100-10MAK-5LSP',
  'SMC130D-0150-20□■K-5LSP',
  'SMC130D-0200-20□■K-5LSP',
  'SMC130D-0150-20□■K-5HSP',
  'SMC130D-0150-10MAK-5HSP',
  'SMC130D-0200-20□■K-5HSP',
]

const smkAcNames = [
  'SMK40S-0005-30□■K-5LSR', 'SMK40S-0010-30□■K-5LSR', 'SMK60S-0020-30□■K-5LSR', 'SMK60S-0040-30□■K-5LSR',
  'SMK80S-0075-30□■K-5LSR', 'SMK80S-0100-30□■K-5LSR', 'SMK60D-0020-30□■K-5LSR', 'SMK60D-0040-30□■K-5LSR',
  'SMK80D-0075-30□■K-5LSR', 'SMK80D-0100-30□■K-5LSR', 'SMK130G-0085-15□■K-5LSR', 'SMK130G-0130-15□■K-5LSR',
]

const smhValues = [
  ['SMH40S-0005-30A□K-4LKH', 50, 0.16, 3000, 0.7],
  ['SMH40S-0010-30A□K-4LKH', 100, 0.32, 3000, 1.4],
  ['SMH60S-0020-30A■K-3LK□', 200, 0.64, 3000, 1.6],
  ['SMH60S-0040-30A■K-3LK□', 400, 1.27, 3000, 3.1],
  ['SMH80S-0075-30A■K-3LK□', 750, 2.39, 3000, 3.9],
  ['SMH80S-0100-30A■K-3LK□', 1000, 3.18, 3000, 6.3],
] as const

const smhUnprofiled = [
  'SMH110D-0105-20A■K-4LKC', 'SMH110D-0125-30A■K-4LKC', 'SMH110D-0126-20A■K-4LKC', 'SMH130D-0105-20A■K-4HKC',
  'SMH110D-0126-30A■K-4HKC', 'SMH110D-0157-30A■K-4HKC', 'SMH130D-0157-20A■K-4HKC', 'SMH110D-0188-30A■K-4HKC',
  'SMH130D-0210-20A■K-4HKC', 'SMH150D-0230-20A■K-4HKC', 'SMH150D-0300-20A■K-4HKC',
]

const acServo = [
  ...smcAcMore.map((name) => model(name, 'SMC', 'ac-servo', 'https://www.kincoautomation.com/product/automation/smc', {
    summary: 'Kinco SMC AC 서보 모터의 공식 모델명입니다. 세부 수치는 원문 사양표에서 확인해야 합니다.',
    features: ['AC 서보 모터', '공개 모델명 확인'],
    tags: ['SMC', 'AC 서보', '원문 확인'],
    weight: 55,
  })),
  ...smkAcNames.map((name) => model(name, 'SMK', 'ac-servo', urls.smkAc, {
    summary: 'Kinco SMK AC 서보 모터의 공식 모델명입니다. 세부 수치는 원문 사양표에서 확인해야 합니다.',
    features: ['AC 서보 모터', '공개 모델명 확인'],
    tags: ['SMK', 'AC 서보', 'IP67', '원문 확인'],
    specs: { ipRating: 'IP67 (축부 IP54)' },
    weight: 55,
  })),
  ...smhValues.map(([name, ratedPower, ratedTorque, ratedSpeed, ratedCurrent]) => model(name, 'SMH', 'ac-servo', urls.smh, {
    summary: 'Kinco SMH AC 서보 모터. 공개 모델별 출력·토크·정격 속도 수치를 반영했습니다.',
    features: ['AC 서보 모터', '공개 사양표 수집'],
    tags: ['SMH', 'AC 서보', `${ratedPower}W`],
    specs: { ratedPower, ratedTorque, ratedSpeed, ratedCurrent },
    weight: 78,
  })),
  ...smhUnprofiled.map((name) => model(name, 'SMH', 'ac-servo', urls.smh, {
    summary: 'Kinco SMH AC 서보 모터의 공식 모델명입니다. 세부 수치는 원문 사양표에서 확인해야 합니다.',
    features: ['AC 서보 모터', '공개 모델명 확인'],
    tags: ['SMH', 'AC 서보', '원문 확인'],
    weight: 55,
  })),
]

const smcDc48 = [
  'SMC40S-0005-30□■K-5DSU', 'SMC40S-0010-30□■K-5DSU', 'SMC60S-0020-30□■K-5DSU', 'SMC60S-0040-30□■K-5DSU',
  'SMC60S-0060-30Q■K-5DSU', 'SMC80S-0075-30□■K-5DSU', 'SMC80S-0100-30□■K-5DSU', 'SMC80S-0120-30Q■K-5DSU',
  'SMC80S-0150-30QQK-5DSU', 'SMC60S-0020-30W■K-5DCH', 'SMC60S-0040-30W■K-5DCH', 'SMC60S-0040-30ZBK-5DCX',
  'SMC80S-0750-30W■K-5DCH', 'SMC80S-0075-30ZBK-5DCX', 'SMC80S-0100-30W■K-5DCH', 'SMC80S-0100-30ZBK-5DCX',
  'SMC130D-0150-30W■K-4DSH-2', 'SMC130D-0250-30W■K-4DSH-2', 'SMC130D-0300-30W■K-4DSH-2', 'SMC130D-0300-20W■K-4DSH-2',
]

const smkDc48 = [
  'SMK40S-0010-30Q■K-5DSA', 'SMK60S-0020-30Q■K-5DSA', 'SMK60S-0040-30Q■K-5DSA', 'SMK80S-0075-30Q■K-5DKA',
  'SMK80S-0100-30Q■K-5DKA', 'SMK60D-0020-30Q■K-5DCU', 'SMK80D-0040-30Q■K-5DCU', 'SMK60D-0040-30Q■K-5DC□',
  'SMK80D-0075-30Q■K-5DC□', 'SMK80D-0100-30Q■K-5DC□', 'SMK80D-0120-30Q■K-5DCU', 'SMK80S-0150-30Q■K-5DCU',
]

const smkDc96Profiled = [
  ['SMK80D-0075-30Q■K-5GCU', 750, 2.39, 7.17, 9.6, 32.5],
  ['SMK80D-0100-30Q■K-5GCU', 1000, 3.18, 7.95, 12.4, 36],
] as const

const smkDc96Unprofiled = [
  'SMK80D-0150-30Q■K-5GCU', 'SMK80D-0200-30Q■K-5GCU', 'SMK130D-0150-30Q■K-4GCU', 'SMK130D-0200-30Q■K-4GCU', 'SMK130D-0300-30Q■K-4GCU',
]

const dcServo = [
  ...smcDc48.map((name) => model(name, 'SMC DC 48', 'dc-servo', urls.smcDc48, {
    summary: 'Kinco SMC DC 48 V 저전압 서보 모터의 공식 모델명입니다. 세부 수치는 원문 사양표에서 확인해야 합니다.',
    features: ['저전압 DC 서보', '48 VDC', '공개 모델명 확인'],
    tags: ['SMC', 'DC 48V', '저전압 서보', '원문 확인'],
    specs: { ratedVoltage: '48 VDC' },
    weight: 52,
  })),
  ...smkDc48.map((name) => model(name, 'SMK DC 48', 'dc-servo', urls.smkDc48, {
    summary: 'Kinco SMK DC 48 V 저전압 서보 모터의 공식 모델명입니다. 세부 수치는 원문 사양표에서 확인해야 합니다.',
    features: ['저전압 DC 서보', '48 VDC', '공개 모델명 확인'],
    tags: ['SMK', 'DC 48V', '저전압 서보', '원문 확인'],
    specs: { ratedVoltage: '48 VDC' },
    weight: 52,
  })),
  ...smkDc96Profiled.map(([name, ratedPower, ratedTorque, maxTorque, ratedCurrent, maxCurrent]) => model(name, 'SMK DC 96', 'dc-servo', urls.smkDc96, {
    summary: 'Kinco SMK DC 96 V 저전압 서보 모터. 공개 모델별 수치를 반영했습니다.',
    features: ['저전압 DC 서보', '96 VDC', 'IP54'],
    tags: ['SMK', 'DC 96V', '저전압 서보', `${ratedPower}W`],
    specs: { ratedVoltage: '96 VDC', ratedPower, ratedTorque, maxTorque, ratedCurrent, maxCurrent, ratedSpeed: 3000, ipRating: 'IP54' },
    weight: 76,
  })),
  ...smkDc96Unprofiled.map((name) => model(name, 'SMK DC 96', 'dc-servo', urls.smkDc96, {
    summary: 'Kinco SMK DC 96 V 저전압 서보 모터의 공식 모델명입니다. 세부 수치는 원문 사양표에서 확인해야 합니다.',
    features: ['저전압 DC 서보', '96 VDC', '공개 모델명 확인'],
    tags: ['SMK', 'DC 96V', '저전압 서보', '원문 확인'],
    specs: { ratedVoltage: '96 VDC' },
    weight: 52,
  })),
]

const stepperNames = [
  '2S57Q-1376', '2S57Q-2280', '2S57Q-25B2', '2S86Q-3465', '2S86Q-4580', '2S86Q-85B8', '2S86Q-051F6',
  '2S110Q-03999', '2S110Q-047F0', '2S110Q-054K1', '2S130Y-039M0', '2S130Y-063R8',
  '3S57Q-04056', '3S57Q-04079', '3S85Q-04097', '3S85Q-040F7',
]

const steppers = stepperNames.map((name) => model(name, name.startsWith('3S') ? '3S' : '2S', 'stepper', urls.stepper, {
  summary: `Kinco ${name.startsWith('3S') ? '3상' : '2상'} 하이브리드 스테퍼 모터의 공식 모델명입니다. 세부 수치는 원문 사양표에서 확인해야 합니다.`,
  features: [`${name.startsWith('3S') ? '3상' : '2상'} 하이브리드`, '공개 모델명 확인'],
  tags: ['스테퍼', name.startsWith('3S') ? '3상' : '2상', '원문 확인'],
  specs: { phase: name.startsWith('3S') ? '3상' : '2상' },
  weight: 48,
}))

export const catalogMotors: MotorProduct[] = [
  ...fmk,
  ...fmc,
  ...ifmhModels,
  ...platformProducts,
  ...acServo,
  ...dcServo,
  ...steppers,
]
