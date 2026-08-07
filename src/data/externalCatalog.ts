import type { MotorProduct } from '../types'

const robotisManualBase = 'https://emanual.robotis.com/docs/en/dxl/x/'
const lsMotorCenter = 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor'
const lsEType = 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=8'
const lsFType = 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=5'
const lsFLType = 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=4'
const lsHollowSpinner = 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=3'
const lsThinDD = 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=7'
const lsDD = 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=2'
const lsPega = 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=1'
const komotekAcServo = 'http://komotek.com/ko/products-servo-system/'
const komotekLowVoltage = 'http://komotek.com/ko/02products-servo-system-low-voltage-motor/'
const komotekSpecialServo = 'http://komotek.com/ko/02products-special-motors/'
const komotekHollowShaft = 'http://komotek.com/ko/hollow-shaft-motor/'
const fastechServoBt = 'https://fastech-motions.com/new/kor/sub0102-0501.php'
const fastechServoAll = 'https://fastech-motions.com/new/kor/sub0102-0601.php'
const fastechServoEthercatAll = 'https://fastech-motions.com/new/kor/sub0102-1101.php'
const fastechStepBt = 'https://fastech-motions.com/new/kor/sub0105-0501.php'
const fastechStepAll = 'https://fastech-motions.com/new/kor/sub0105-0601.php'

interface DynamixelXInput {
  id: string
  model: string
  series: string
  slug: string
  voltage: string
  torqueNm: number
  torque: string
  speedRpm: number
  speed: string
  stallCurrent: string
  bus: string
  protocols?: string[]
  physicalConnection: string
  gearRatio: string
  baudRate: string
  weightKg?: number
  officialUrl?: string
  highlight?: string
  encoder?: string
  resolution?: string
  operatingModes?: string
  operatingTemperature?: string
}

function dynamixelX(input: DynamixelXInput): MotorProduct {
  const protocols = input.protocols ?? [input.bus === 'TTL Half-Duplex' ? 'TTL Half-Duplex' : 'RS-485', 'DYNAMIXEL Protocol 2.0']
  const family = `${input.series.replace('DYNAMIXEL ', '')} Series`
  return {
    id: input.id,
    brand: 'ROBOTIS',
    model: input.model,
    series: input.series,
    family,
    lifecycle: 'current',
    categoryId: 'integrated',
    summary: `${input.model}은 모터·감속기·드라이버·절대 엔코더를 통합한 ${family} DYNAMIXEL 스마트 액추에이터입니다.`,
    features: [
      `스톨 토크 ${input.torque}`,
      `무부하 속도 ${input.speed}`,
      input.highlight ?? protocols.join(' · '),
    ],
    tags: ['ROBOTIS', 'DYNAMIXEL', 'X Series', family, input.series, input.model, ...protocols, input.voltage, `${input.torqueNm}Nm`],
    specs: {
      ratedVoltage: input.voltage,
      maxTorque: input.torqueNm,
      maxTorqueText: `스톨 ${input.torque}`,
      torqueBasis: '스톨 토크 (순간 최대)',
      maxSpeed: input.speedRpm,
      maxSpeedText: `무부하 ${input.speed}`,
      maxCurrentText: `스톨 ${input.stallCurrent}`,
      currentSummary: `스톨 ${input.stallCurrent}`,
      encoder: input.encoder ?? '12-bit 비접촉식 절대 엔코더',
      resolution: input.resolution ?? '4,096 pulse/rev',
      gearRatio: input.gearRatio,
      baudRate: input.baudRate,
      physicalConnection: input.physicalConnection,
      feedback: '위치 · 속도 · 전류 · 온도 · 입력 전압',
      protocols,
      operatingModes: input.operatingModes,
      operatingTemperature: input.operatingTemperature,
      weight: input.weightKg,
    },
    officialUrl: input.officialUrl ?? `${robotisManualBase}${input.slug}/`,
    sourceChecked: '2026-07-15',
    weight: 100,
  }
}

const dynamixelMotors: MotorProduct[] = [
  dynamixelX({
    id: 'robotis-xl330-m077-t', model: 'XL330-M077-T', series: 'DYNAMIXEL XL', slug: 'xl330-m077',
    voltage: '5 VDC (허용 3.7–6.0 VDC)', torqueNm: 0.215, torque: '0.215 Nm (5.0 V, Stall)', speedRpm: 383, speed: '383 rpm (5.0 V, No-load)', stallCurrent: '1.47 A (5.0 V)',
    bus: 'TTL Half-Duplex', physicalConnection: 'TTL Multidrop Bus (3.3 V logic, 5 V compatible)', gearRatio: '77.5 : 1', baudRate: '9.6 kbps–4 Mbps', weightKg: 0.018,
    highlight: '초경량 18 g · 소형 로봇 관절',
  }),
  dynamixelX({
    id: 'robotis-xc330-m288-t', model: 'XC330-M288-T', series: 'DYNAMIXEL XC', slug: 'xc330-m288',
    voltage: '5 VDC (허용 3.7–6.0 VDC)', torqueNm: 0.93, torque: '0.93 Nm (5.0 V, Stall)', speedRpm: 81, speed: '81 rpm (5.0 V, No-load)', stallCurrent: '1.80 A (5.0 V)',
    bus: 'TTL Half-Duplex', physicalConnection: 'TTL Multidrop Bus (3.3 V logic, 5 V compatible)', gearRatio: '288.35 : 1', baudRate: '9.6 kbps–4 Mbps', weightKg: 0.023,
    highlight: 'X330 고감속 · 컴팩트 관절',
  }),
  dynamixelX({
    id: 'robotis-xm335-t323-t', model: 'XM335-T323-T', series: 'DYNAMIXEL XM', slug: 'xm335-t323',
    voltage: '11.1 VDC (허용 6.5–12.0 VDC)', torqueNm: 1.03, torque: '1.03 Nm (11.1 V, Stall)', speedRpm: 53, speed: '53 rpm (11.1 V, No-load)', stallCurrent: '0.80 A (11.1 V)',
    bus: 'TTL Half-Duplex', physicalConnection: 'TTL Multidrop Bus (5 V logic)', gearRatio: '323.04 : 1', baudRate: '9.6 kbps–4 Mbps', weightKg: 0.027,
    highlight: '전류 기반 위치 제어 · 27 g',
  }),
  dynamixelX({
    id: 'robotis-xl430-w250-t', model: 'XL430-W250-T', series: 'DYNAMIXEL XL', slug: 'xl430-w250',
    voltage: '11.1 VDC (허용 6.5–12.0 VDC)', torqueNm: 1.4, torque: '1.4 Nm (11.1 V, Stall)', speedRpm: 57, speed: '57 rpm (11.1 V, No-load)', stallCurrent: '1.30 A (11.1 V)',
    bus: 'TTL Half-Duplex', physicalConnection: 'TTL Multidrop Bus (5 V logic)', gearRatio: '258.5 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.0572,
    highlight: '교육·소형 관절용 TTL 액추에이터',
  }),
  dynamixelX({
    id: 'robotis-xc430-w240-t', model: 'XC430-W240-T', series: 'DYNAMIXEL XC', slug: 'xc430-w240',
    voltage: '12 VDC (허용 6.5–14.8 VDC)', torqueNm: 1.9, torque: '1.9 Nm (12.0 V, Stall)', speedRpm: 70, speed: '70 rpm (12.0 V, No-load)', stallCurrent: '1.40 A (12.0 V)',
    bus: 'TTL Half-Duplex', physicalConnection: 'TTL Level Multidrop Bus', gearRatio: '245.22 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.065,
    highlight: 'X430 확장형 · TTL 멀티드롭',
  }),
  dynamixelX({
    id: 'robotis-2xc430-w250', model: '2XC430-W250', series: 'DYNAMIXEL XC', slug: '2xc430-w250',
    voltage: '12 VDC (허용 6.5–14.8 VDC)', torqueNm: 1.8, torque: '1.8 Nm (12.0 V, Stall)', speedRpm: 64, speed: '64 rpm (12.0 V, No-load)', stallCurrent: '1.40 A (12.0 V)',
    bus: 'TTL Half-Duplex', physicalConnection: 'TTL Multidrop Bus (5 V logic)', gearRatio: '257.4 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.102,
    highlight: '2축 동축 구조 · 팬틸트/양축 구동',
  }),
  dynamixelX({
    id: 'robotis-xm430-w350-t', model: 'XM430-W350-T', series: 'DYNAMIXEL XM', slug: 'xm430-w350',
    voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 4.1, torque: '4.1 Nm (12.0 V, Stall)', speedRpm: 46, speed: '46 rpm (12.0 V, No-load)', stallCurrent: '2.30 A (12.0 V)',
    bus: 'TTL Half-Duplex', physicalConnection: 'TTL Half-Duplex Multidrop Bus', gearRatio: '353.5 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.082,
    highlight: '전류 제어 · 확장 위치 제어',
  }),
  dynamixelX({
    id: 'robotis-xh430-v350-r', model: 'XH430-V350-R', series: 'DYNAMIXEL XH', slug: 'xh430-v350',
    voltage: '24 VDC', torqueNm: 3.3, torque: '3.3 Nm (24 V, Stall)', speedRpm: 31, speed: '31 rpm (24 V, No-load)', stallCurrent: '0.70 A (24 V)',
    bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '353.5 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.082,
    highlight: '24 V · RS-485 산업용 버스',
  }),
  dynamixelX({
    id: 'robotis-xm540-w270-t', model: 'XM540-W270-T', series: 'DYNAMIXEL XM', slug: 'xm540-w270',
    voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 10.6, torque: '10.6 Nm (12.0 V, Stall)', speedRpm: 30, speed: '30 rpm (12.0 V, No-load)', stallCurrent: '4.40 A (12.0 V)',
    bus: 'TTL Half-Duplex', physicalConnection: 'TTL Half-Duplex Multidrop Bus', gearRatio: '272.5 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.165,
    highlight: '고토크 TTL · 대형 관절',
  }),
  dynamixelX({
    id: 'robotis-xh540-v270-r', model: 'XH540-V270-R', series: 'DYNAMIXEL XH', slug: 'xh540-v270',
    voltage: '24 VDC', torqueNm: 9.2, torque: '9.2 Nm (24 V, Stall)', speedRpm: 34, speed: '34 rpm (24 V, No-load)', stallCurrent: '2.40 A (24 V)',
    bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '272.5 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.165,
    highlight: '24 V · RS-485 고토크 관절',
  }),
  dynamixelX({
    id: 'robotis-xd540-t270', model: 'XD540-T270-R', series: 'DYNAMIXEL XD', slug: 'xd540-t270',
    voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 9.9, torque: '9.9 Nm (12.0 V, Stall)', speedRpm: 39, speed: '39 rpm (12.0 V, No-load)', stallCurrent: '4.90 A (12.0 V)',
    bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '272.5 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.17,
    highlight: '듀얼 엔코더 · 백래시 보정용',
  }),
  dynamixelX({
    id: 'robotis-xw540-t260', model: 'XW540-T260-R', series: 'DYNAMIXEL XW', slug: 'xw540-t260',
    voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 9.5, torque: '9.5 Nm (12.0 V, Stall)', speedRpm: 40, speed: '40 rpm (12.0 V, No-load)', stallCurrent: '4.90 A (12.0 V)',
    bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '260.6 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.185,
    highlight: '방수형 XW 구조 · 야외/가혹 환경',
  }),
]

const additionalDynamixelXMotors: MotorProduct[] = [
  dynamixelX({ id: 'robotis-xw540-t140-r', model: 'XW540-T140-R', series: 'DYNAMIXEL XW', slug: 'xw540-t140', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 6.9, torque: '6.9 Nm (12.0 V, Stall)', speedRpm: 72, speed: '72 rpm (12.0 V, No-load)', stallCurrent: '4.90 A (12.0 V)', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '140.22 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.185, highlight: '방수형 · 72 rpm 고속 RS-485 관절' }),
  dynamixelX({ id: 'robotis-xw430-t200-r', model: 'XW430-T200-R', series: 'DYNAMIXEL XW', slug: 'xw430-t200', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 6.9, torque: '6.9 Nm (12.0 V, Stall)', speedRpm: 53, speed: '53 rpm (12.0 V, No-load)', stallCurrent: '4.90 A (12.0 V)', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '200.10 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.115, highlight: '방수형 · 중형 RS-485 관절' }),
  dynamixelX({ id: 'robotis-xw430-t333-r', model: 'XW430-T333-R', series: 'DYNAMIXEL XW', slug: 'xw430-t333', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 3.1, torque: '3.1 Nm (12.0 V, Stall)', speedRpm: 31, speed: '31 rpm (12.0 V, No-load)', stallCurrent: '1.30 A (12.0 V)', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '333.42 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.115, highlight: '방수형 · 고감속 RS-485 관절' }),
  dynamixelX({ id: 'robotis-xd540-t150-r', model: 'XD540-T150-R', series: 'DYNAMIXEL XD', slug: 'xd540-t150', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 7.1, torque: '7.1 Nm (12.0 V, Stall)', speedRpm: 70, speed: '70 rpm (12.0 V, No-load)', stallCurrent: '4.90 A (12.0 V)', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '151.68 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.17, highlight: '듀얼 엔코더 · 고속 백래시 보정' }),
  dynamixelX({ id: 'robotis-xd430-t210-r', model: 'XD430-T210-R', series: 'DYNAMIXEL XD', slug: 'xd430-t210', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 2.5, torque: '2.5 Nm (12.0 V, Stall)', speedRpm: 50, speed: '50 rpm (12.0 V, No-load)', stallCurrent: '1.30 A (12.0 V)', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '212.50 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.082, highlight: '듀얼 엔코더 · 컴팩트 RS-485' }),
  dynamixelX({ id: 'robotis-xd430-t350-r', model: 'XD430-T350-R', series: 'DYNAMIXEL XD', slug: 'xd430-t350', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 3.4, torque: '3.4 Nm (12.0 V, Stall)', speedRpm: 30, speed: '30 rpm (12.0 V, No-load)', stallCurrent: '1.30 A (12.0 V)', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '353.50 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.082, highlight: '듀얼 엔코더 · 고감속 RS-485' }),
  dynamixelX({ id: 'robotis-xh540-w150-tr', model: 'XH540-W150-T/R', series: 'DYNAMIXEL XH', slug: 'xh540-w150', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 7.1, torque: '7.1 Nm (12.0 V, Stall)', speedRpm: 70, speed: '70 rpm (12.0 V, No-load)', stallCurrent: '4.90 A (12.0 V)', bus: 'TTL / RS-485', protocols: ['TTL Half-Duplex (T)', 'RS-485 (R)', 'DYNAMIXEL Protocol 2.0'], physicalConnection: 'T형: TTL Half-Duplex · R형: RS-485 Multidrop', gearRatio: '151.68 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.165, highlight: '알루미늄 케이스 · 통신 타입(T/R) 선택' }),
  dynamixelX({ id: 'robotis-xh540-w270-tr', model: 'XH540-W270-T/R', series: 'DYNAMIXEL XH', slug: 'xh540-w270', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 9.9, torque: '9.9 Nm (12.0 V, Stall)', speedRpm: 39, speed: '39 rpm (12.0 V, No-load)', stallCurrent: '4.90 A (12.0 V)', bus: 'TTL / RS-485', protocols: ['TTL Half-Duplex (T)', 'RS-485 (R)', 'DYNAMIXEL Protocol 2.0'], physicalConnection: 'T형: TTL Half-Duplex · R형: RS-485 Multidrop', gearRatio: '272.50 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.165, highlight: '알루미늄 케이스 · 고토크 T/R 선택' }),
  dynamixelX({ id: 'robotis-xh540-v150-r', model: 'XH540-V150-R', series: 'DYNAMIXEL XH', slug: 'xh540-v150', voltage: '24 VDC', torqueNm: 6.4, torque: '6.4 Nm (24 V, Stall)', speedRpm: 60, speed: '60 rpm (24 V, No-load)', stallCurrent: '2.40 A (24 V)', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '151.68 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.165, highlight: '24 V · 고속 산업용 RS-485' }),
  dynamixelX({ id: 'robotis-xh430-w210-tr', model: 'XH430-W210-T/R', series: 'DYNAMIXEL XH', slug: 'xh430-w210', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 2.5, torque: '2.5 Nm (12.0 V, Stall)', speedRpm: 50, speed: '50 rpm (12.0 V, No-load)', stallCurrent: '1.30 A (12.0 V)', bus: 'TTL / RS-485', protocols: ['TTL Half-Duplex (T)', 'RS-485 (R)', 'DYNAMIXEL Protocol 2.0'], physicalConnection: 'T형: TTL Half-Duplex · R형: RS-485 Multidrop', gearRatio: '212.50 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.082, highlight: '알루미늄 케이스 · 컴팩트 T/R 선택' }),
  dynamixelX({ id: 'robotis-xh430-w350-tr', model: 'XH430-W350-T/R', series: 'DYNAMIXEL XH', slug: 'xh430-w350', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 3.4, torque: '3.4 Nm (12.0 V, Stall)', speedRpm: 30, speed: '30 rpm (12.0 V, No-load)', stallCurrent: '1.30 A (12.0 V)', bus: 'TTL / RS-485', protocols: ['TTL Half-Duplex (T)', 'RS-485 (R)', 'DYNAMIXEL Protocol 2.0'], physicalConnection: 'T형: TTL Half-Duplex · R형: RS-485 Multidrop', gearRatio: '353.50 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.082, highlight: '알루미늄 케이스 · 고감속 T/R 선택' }),
  dynamixelX({ id: 'robotis-xh430-v210-r', model: 'XH430-V210-R', series: 'DYNAMIXEL XH', slug: 'xh430-v210', voltage: '24 VDC', torqueNm: 2.6, torque: '2.6 Nm (24 V, Stall)', speedRpm: 52, speed: '52 rpm (24 V, No-load)', stallCurrent: '0.70 A (24 V)', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', gearRatio: '212.50 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.082, highlight: '24 V · 컴팩트 RS-485' }),
  dynamixelX({ id: 'robotis-xm540-w150-tr', model: 'XM540-W150-T/R', series: 'DYNAMIXEL XM', slug: 'xm540-w150', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 7.3, torque: '7.3 Nm (12.0 V, Stall)', speedRpm: 53, speed: '53 rpm (12.0 V, No-load)', stallCurrent: '4.40 A (12.0 V)', bus: 'TTL / RS-485', protocols: ['TTL Half-Duplex (T)', 'RS-485 (R)', 'DYNAMIXEL Protocol 2.0'], physicalConnection: 'T형: TTL Half-Duplex · R형: RS-485 Multidrop', gearRatio: '151.68 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.165, highlight: '전류 기반 제어 · 고속 T/R 선택' }),
  dynamixelX({ id: 'robotis-xm430-w210-tr', model: 'XM430-W210-T/R', series: 'DYNAMIXEL XM', slug: 'xm430-w210', voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm: 3.0, torque: '3.0 Nm (12.0 V, Stall)', speedRpm: 77, speed: '77 rpm (12.0 V, No-load)', stallCurrent: '2.30 A (12.0 V)', bus: 'TTL / RS-485', protocols: ['TTL Half-Duplex (T)', 'RS-485 (R)', 'DYNAMIXEL Protocol 2.0'], physicalConnection: 'T형: TTL Half-Duplex · R형: RS-485 Multidrop', gearRatio: '212.50 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.082, highlight: '전류 기반 제어 · 고속 T/R 선택' }),
  dynamixelX({ id: 'robotis-xc430-w150-t', model: 'XC430-W150-T', series: 'DYNAMIXEL XC', slug: 'xc430-w150', voltage: '12 VDC (허용 9.0–14.8 VDC)', torqueNm: 1.4, torque: '1.4 Nm (12.0 V, Stall)', speedRpm: 106, speed: '106 rpm (12.0 V, No-load)', stallCurrent: '1.40 A (12.0 V)', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Half-Duplex Multidrop Bus', gearRatio: '151.68 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.065, highlight: '비엔코더형 · 106 rpm 고속 TTL' }),
  dynamixelX({ id: 'robotis-xc430-t150bb-t', model: 'XC430-T150BB-T', series: 'DYNAMIXEL XC', slug: 'xc430-t150bb', voltage: '12 VDC (허용 9.0–14.8 VDC)', torqueNm: 1.4, torque: '1.4 Nm (12.0 V, Stall)', speedRpm: 106, speed: '106 rpm (12.0 V, No-load)', stallCurrent: '1.40 A (12.0 V)', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Half-Duplex Multidrop Bus', gearRatio: '151.68 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.065, highlight: '베어링 블록 적용 · 고속 TTL' }),
  dynamixelX({ id: 'robotis-xc430-t240bb-t', model: 'XC430-T240BB-T', series: 'DYNAMIXEL XC', slug: 'xc430-t240bb', voltage: '12 VDC (허용 9.0–14.8 VDC)', torqueNm: 1.9, torque: '1.9 Nm (12.0 V, Stall)', speedRpm: 70, speed: '70 rpm (12.0 V, No-load)', stallCurrent: '1.40 A (12.0 V)', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Half-Duplex Multidrop Bus', gearRatio: '245.22 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.065, highlight: '베어링 블록 적용 · TTL' }),
  dynamixelX({ id: 'robotis-xc330-t181', model: 'XC330-T181-T', series: 'DYNAMIXEL XC', slug: 'xc330-t181', voltage: '12 VDC (허용 9.0–12.0 VDC)', torqueNm: 0.76, torque: '0.76 Nm (11.1 V, Stall)', speedRpm: 104, speed: '104 rpm (11.1 V, No-load)', stallCurrent: '0.80 A (11.1 V)', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Half-Duplex Multidrop Bus', gearRatio: '181.36 : 1', baudRate: '9.6 kbps–4 Mbps', weightKg: 0.023, highlight: '초소형 · 고속 TTL 관절' }),
  dynamixelX({ id: 'robotis-xc330-t288', model: 'XC330-T288-T', series: 'DYNAMIXEL XC', slug: 'xc330-t288', voltage: '12 VDC (허용 9.0–12.0 VDC)', torqueNm: 0.92, torque: '0.92 Nm (11.1 V, Stall)', speedRpm: 65, speed: '65 rpm (11.1 V, No-load)', stallCurrent: '0.80 A (11.1 V)', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Half-Duplex Multidrop Bus', gearRatio: '288.35 : 1', baudRate: '9.6 kbps–4 Mbps', weightKg: 0.023, highlight: '초소형 · 고감속 TTL 관절' }),
  dynamixelX({ id: 'robotis-xc330-m181', model: 'XC330-M181-T', series: 'DYNAMIXEL XC', slug: 'xc330-m181', voltage: '5 VDC (허용 3.7–6.0 VDC)', torqueNm: 0.76, torque: '0.76 Nm (5.0 V, Stall)', speedRpm: 116, speed: '116 rpm (5.0 V, No-load)', stallCurrent: '1.80 A (5.0 V)', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Multidrop Bus (3.3 V logic, 5 V compatible)', gearRatio: '181.36 : 1', baudRate: '9.6 kbps–4 Mbps', weightKg: 0.023, highlight: '5 V · 고속 컴팩트 TTL' }),
  dynamixelX({ id: 'robotis-2xl430-w250', model: '2XL430-W250-T', series: 'DYNAMIXEL XL', slug: '2xl430-w250', voltage: '12 VDC (허용 6.5–12.0 VDC)', torqueNm: 1.8, torque: '1.8 Nm (12.0 V, Stall)', speedRpm: 64, speed: '64 rpm (12.0 V, No-load)', stallCurrent: '1.40 A (12.0 V)', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Multidrop Bus (5 V logic)', gearRatio: '257.40 : 1', baudRate: '9.6 kbps–4.5 Mbps', weightKg: 0.102, highlight: '2축 동축 · TTL 일체형 관절' }),
  dynamixelX({ id: 'robotis-xl330-m288-t', model: 'XL330-M288-T', series: 'DYNAMIXEL XL', slug: 'xl330-m288', voltage: '5 VDC (허용 3.7–6.0 VDC)', torqueNm: 0.93, torque: '0.93 Nm (5.0 V, Stall)', speedRpm: 81, speed: '81 rpm (5.0 V, No-load)', stallCurrent: '1.80 A (5.0 V)', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Multidrop Bus (3.3 V logic, 5 V compatible)', gearRatio: '288.35 : 1', baudRate: '9.6 kbps–4 Mbps', weightKg: 0.018, highlight: '경량 5 V · 고감속 TTL' }),
  dynamixelX({ id: 'robotis-xl-320', model: 'XL-320', series: 'DYNAMIXEL XL', slug: 'xl320', voltage: '7.4 VDC (허용 6.0–8.4 VDC)', torqueNm: 0.39, torque: '0.39 Nm (7.4 V, Stall)', speedRpm: 114, speed: '114 rpm (7.4 V, No-load)', stallCurrent: '1.10 A (7.4 V)', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Multidrop Bus', gearRatio: '238 : 1', baudRate: '7,343 bps–1 Mbps', weightKg: 0.0167, encoder: '내장 위치 센서', resolution: '0.29°', operatingModes: 'Joint 0–300° · Wheel 연속 회전', operatingTemperature: '-5–65 °C', highlight: '초소형 16.7 g · Protocol 2.0 전용' }),
]

interface DynamixelYInput {
  model: string
  series: 'DYNAMIXEL YM070' | 'DYNAMIXEL YM080'
  type: string
  gearRatio: string
  ratedTorque: number
  maxTorque: number
  resolution: string
  weightKg: number
  length: number
}

function dynamixelY(input: DynamixelYInput): MotorProduct {
  const hasBrake = input.type.includes('Brake')
  const hasReducer = input.type.includes('Reducer')
  const slug = input.model.toLocaleLowerCase()
  return {
    id: `robotis-${slug}`,
    brand: 'ROBOTIS',
    model: input.model,
    series: input.series,
    family: 'Y Series',
    lifecycle: 'current',
    categoryId: 'robot-module',
    summary: `${input.model}은 모터·절대 엔코더·DYNAMIXEL 드라이브를 통합한 24 V 산업용 로봇 액추에이터입니다.${hasReducer ? ' 감속기 포함 사양입니다.' : ''}${hasBrake ? ' 전동 브레이크를 내장합니다.' : ''}`,
    features: [`연속 ${input.ratedTorque} Nm · 최대 ${input.maxTorque} Nm`, input.type, '중공축 · 멀티턴 절대 엔코더'],
    tags: ['ROBOTIS', 'DYNAMIXEL', 'Y Series', input.series, input.model, '24V', 'UART Half-Duplex', 'Hollow Shaft', `${input.maxTorque}Nm`],
    specs: {
      ratedVoltage: '24 VDC',
      ratedTorque: input.ratedTorque,
      maxTorque: input.maxTorque,
      ratedTorqueText: `연속 ${input.ratedTorque} Nm`,
      maxTorqueText: `최대 ${input.maxTorque} Nm`,
      torqueBasis: '연속 토크 / 최대 토크',
      gearRatio: input.gearRatio,
      resolution: input.resolution,
      encoder: '멀티턴 절대 엔코더',
      brake: hasBrake ? '통합 전동 브레이크' : '미포함',
      physicalConnection: 'UART Half-Duplex Serial',
      protocols: ['UART Half-Duplex'],
      feedback: '절대 위치 · 속도 · 전류 · 온도',
      length: input.length,
      weight: input.weightKg,
    },
    officialUrl: `https://emanual.robotis.com/docs/en/dxl/y/${slug}/`,
    sourceChecked: '2026-07-15',
    weight: 98,
  }
}

const dynamixelYMotors: MotorProduct[] = [
  dynamixelY({ model: 'YM070-210-M001-RH', series: 'DYNAMIXEL YM070', type: 'Motor', gearRatio: '감속기 미포함', ratedTorque: 0.32, maxTorque: 0.64, resolution: '524,288 pulse/rev', weightKg: 0.34, length: 50.9 }),
  dynamixelY({ model: 'YM070-210-B001-RH', series: 'DYNAMIXEL YM070', type: 'Motor · Brake', gearRatio: '감속기 미포함', ratedTorque: 0.32, maxTorque: 0.64, resolution: '524,288 pulse/rev', weightKg: 0.53, length: 71.0 }),
  dynamixelY({ model: 'YM070-210-R051-RH', series: 'DYNAMIXEL YM070', type: 'Motor · Reducer', gearRatio: '51 : 1', ratedTorque: 8.2, maxTorque: 16.3, resolution: '26,738,688 pulse/rev', weightKg: 0.79, length: 71.1 }),
  dynamixelY({ model: 'YM070-210-R099-RH', series: 'DYNAMIXEL YM070', type: 'Motor · Reducer', gearRatio: '99 : 1', ratedTorque: 14.6, maxTorque: 31.7, resolution: '51,904,512 pulse/rev', weightKg: 0.79, length: 71.1 }),
  dynamixelY({ model: 'YM070-210-A051-RH', series: 'DYNAMIXEL YM070', type: 'Motor · Reducer · Brake', gearRatio: '51 : 1', ratedTorque: 8.2, maxTorque: 16.3, resolution: '26,738,688 pulse/rev', weightKg: 0.98, length: 91.2 }),
  dynamixelY({ model: 'YM070-210-A099-RH', series: 'DYNAMIXEL YM070', type: 'Motor · Reducer · Brake', gearRatio: '99 : 1', ratedTorque: 14.6, maxTorque: 31.7, resolution: '51,904,512 pulse/rev', weightKg: 0.98, length: 91.2 }),
  dynamixelY({ model: 'YM080-230-M001-RH', series: 'DYNAMIXEL YM080', type: 'Motor', gearRatio: '감속기 미포함', ratedTorque: 0.62, maxTorque: 1.24, resolution: '524,288 pulse/rev', weightKg: 0.53, length: 54.1 }),
  dynamixelY({ model: 'YM080-230-B001-RH', series: 'DYNAMIXEL YM080', type: 'Motor · Brake', gearRatio: '감속기 미포함', ratedTorque: 0.62, maxTorque: 1.24, resolution: '524,288 pulse/rev', weightKg: 0.89, length: 76.1 }),
  dynamixelY({ model: 'YM080-230-R051-RH', series: 'DYNAMIXEL YM080', type: 'Motor · Reducer', gearRatio: '51 : 1', ratedTorque: 15.8, maxTorque: 31.6, resolution: '26,738,688 pulse/rev', weightKg: 1.2, length: 78.1 }),
  dynamixelY({ model: 'YM080-230-R099-RH', series: 'DYNAMIXEL YM080', type: 'Motor · Reducer', gearRatio: '99 : 1', ratedTorque: 26.0, maxTorque: 61.4, resolution: '51,904,512 pulse/rev', weightKg: 1.2, length: 78.1 }),
  dynamixelY({ model: 'YM080-230-A051-RH', series: 'DYNAMIXEL YM080', type: 'Motor · Reducer · Brake', gearRatio: '51 : 1', ratedTorque: 15.8, maxTorque: 31.6, resolution: '26,738,688 pulse/rev', weightKg: 1.55, length: 100.1 }),
  dynamixelY({ model: 'YM080-230-A099-RH', series: 'DYNAMIXEL YM080', type: 'Motor · Reducer · Brake', gearRatio: '99 : 1', ratedTorque: 26.0, maxTorque: 61.4, resolution: '51,904,512 pulse/rev', weightKg: 1.55, length: 100.1 }),
]

interface DynamixelPInput {
  model: string
  series: string
  output: number
  resolution: string
  weightKg: number
  gearRatio: string
  continuousTorque: number
  continuousSpeed: number
  continuousCurrent: number
  noLoadSpeed: number
  noLoadCurrent: number
}

function dynamixelP(input: DynamixelPInput): MotorProduct {
  const slug = input.model.toLocaleLowerCase()
  return {
    id: `robotis-${slug}`,
    brand: 'ROBOTIS',
    model: input.model,
    series: input.series,
    family: 'P Series',
    lifecycle: 'current',
    categoryId: 'frameless',
    summary: `${input.model}은 고정밀 사이클로이드 감속기와 RS-485 멀티드롭 통신을 통합한 DYNAMIXEL-P 로봇 관절입니다.`,
    features: [`연속 ${input.continuousTorque} Nm · ${input.continuousSpeed} rpm`, `${input.output} W급 BLDC/코어리스 구동`, '사이클로이드 감속기 · RS-485'],
    tags: ['ROBOTIS', 'DYNAMIXEL', 'P Series', input.series, input.model, '24V', 'RS-485', 'DYNAMIXEL Protocol 2.0', 'Modbus RTU', `${input.output}W`, `${input.continuousTorque}Nm`],
    specs: {
      ratedVoltage: '24 VDC',
      ratedPower: input.output,
      ratedTorque: input.continuousTorque,
      ratedTorqueText: `연속 ${input.continuousTorque} Nm`,
      torqueBasis: '연속 토크',
      ratedSpeed: input.continuousSpeed,
      ratedSpeedText: `연속 ${input.continuousSpeed} rpm`,
      maxSpeed: input.noLoadSpeed,
      maxSpeedText: `무부하 ${input.noLoadSpeed} rpm`,
      ratedCurrent: input.continuousCurrent,
      ratedCurrentText: `연속 ${input.continuousCurrent} A`,
      inputCurrent: `무부하 ${input.noLoadCurrent} A`,
      currentSummary: `무부하 ${input.noLoadCurrent} A · 연속 ${input.continuousCurrent} A`,
      gearRatio: input.gearRatio,
      resolution: input.resolution,
      encoder: '절대 엔코더',
      physicalConnection: 'RS-485 Multidrop Bus',
      baudRate: '9.6 kbps–10.5 Mbps',
      protocols: ['RS-485', 'DYNAMIXEL Protocol 2.0', 'Modbus RTU (펌웨어 11+)'],
      feedback: '위치 · 속도 · 전류 · 온도 · 입력 전압',
      operatingModes: '토크 · 속도 · 위치 · 확장 위치 · PWM 제어',
      operatingTemperature: '-5–55 °C',
      weight: input.weightKg,
    },
    officialUrl: `https://emanual.robotis.com/docs/en/dxl/p/${slug}/`,
    sourceChecked: '2026-07-15',
    weight: 96,
  }
}

const dynamixelPMotors: MotorProduct[] = [
  dynamixelP({ model: 'PH54-200-S500-R', series: 'DYNAMIXEL PH54', output: 200, resolution: '1,003,846 pulse/rev', weightKg: 0.855, gearRatio: '501.923 : 1', continuousTorque: 44.7, continuousSpeed: 29.0, continuousCurrent: 9.3, noLoadSpeed: 33.1, noLoadCurrent: 1.65 }),
  dynamixelP({ model: 'PH54-100-S500-R', series: 'DYNAMIXEL PH54', output: 100, resolution: '1,003,846 pulse/rev', weightKg: 0.74, gearRatio: '501.923 : 1', continuousTorque: 25.3, continuousSpeed: 29.2, continuousCurrent: 5.5, noLoadSpeed: 33.3, noLoadCurrent: 1.13 }),
  dynamixelP({ model: 'PH42-020-S300-R', series: 'DYNAMIXEL PH42', output: 20, resolution: '607,500 pulse/rev', weightKg: 0.34, gearRatio: '303.75 : 1', continuousTorque: 5.1, continuousSpeed: 29.2, continuousCurrent: 1.5, noLoadSpeed: 32.7, noLoadCurrent: 0.57 }),
  dynamixelP({ model: 'PM54-060-S250-R', series: 'DYNAMIXEL PM54', output: 60, resolution: '502,834 pulse/rev', weightKg: 0.855, gearRatio: '251.417 : 1', continuousTorque: 10.1, continuousSpeed: 28.3, continuousCurrent: 3.0, noLoadSpeed: 33.1, noLoadCurrent: 1.25 }),
  dynamixelP({ model: 'PM54-040-S250-R', series: 'DYNAMIXEL PM54', output: 40, resolution: '502,834 pulse/rev', weightKg: 0.71, gearRatio: '251.417 : 1', continuousTorque: 3.9, continuousSpeed: 24.2, continuousCurrent: 1.9, noLoadSpeed: 28.4, noLoadCurrent: 1.32 }),
  dynamixelP({ model: 'PM42-010-S260-R', series: 'DYNAMIXEL PM42', output: 10, resolution: '526,374 pulse/rev', weightKg: 0.27, gearRatio: '257.019 : 1', continuousTorque: 1.7, continuousSpeed: 26.0, continuousCurrent: 0.6, noLoadSpeed: 28.0, noLoadCurrent: 0.52 }),
]

function dynamixelMx(model: string, torqueNm: number, speedRpm: number, current: string, series: string): MotorProduct {
  const product = dynamixelX({
    id: `robotis-${model.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    model,
    series,
    slug: model === 'MX-106T/R' ? 'mx-106-2' : model === 'MX-64T/R' ? 'mx-64-2' : model === 'MX-28T/R' ? 'mx-28-2' : 'mx-12w',
    voltage: '12 VDC (허용 10.0–14.8 VDC)', torqueNm, torque: `${torqueNm} Nm (12.0 V, Stall)`, speedRpm, speed: `${speedRpm} rpm (12.0 V, No-load)`, stallCurrent: current,
    bus: model === 'MX-12W' ? 'TTL Half-Duplex' : 'TTL / RS-485', protocols: model === 'MX-12W' ? ['TTL Half-Duplex', 'DYNAMIXEL Protocol 1.0'] : ['TTL Half-Duplex (T)', 'RS-485 (R)', 'DYNAMIXEL Protocol 1.0 / 2.0'],
    physicalConnection: model === 'MX-12W' ? 'TTL Half-Duplex Bus' : 'T형: TTL Half-Duplex · R형: RS-485 Multidrop', gearRatio: '공식 상세 사양 확인', baudRate: '최대 4.5 Mbps',
    officialUrl: `https://emanual.robotis.com/docs/en/dxl/mx/${model === 'MX-106T/R' ? 'mx-106-2' : model === 'MX-64T/R' ? 'mx-64-2' : model === 'MX-28T/R' ? 'mx-28-2' : 'mx-12w'}/`,
    highlight: '레거시 MX · 비접촉식 절대 엔코더',
  })
  return {
    ...product,
    family: 'MX Series',
    lifecycle: 'legacy',
    summary: `${model}은 비접촉식 절대 엔코더를 적용한 DYNAMIXEL MX 레거시 스마트 액추에이터입니다. 통신 타입(T/R)은 구매 모델에서 확인해야 합니다.`,
    tags: ['ROBOTIS', 'DYNAMIXEL', 'MX Series', series, model, ...(product.specs.protocols ?? []), `${torqueNm}Nm`],
  }
}

const dynamixelMxMotors: MotorProduct[] = [
  dynamixelMx('MX-106T/R', 8.4, 45, '5.20 A (12.0 V)', 'DYNAMIXEL MX'),
  dynamixelMx('MX-64T/R', 6.0, 63, '4.10 A (12.0 V)', 'DYNAMIXEL MX'),
  dynamixelMx('MX-28T/R', 2.5, 55, '1.40 A (12.0 V)', 'DYNAMIXEL MX'),
  dynamixelMx('MX-12W', 0.2, 470, '1.40 A (12.0 V)', 'DYNAMIXEL MX'),
]

interface DynamixelLegacyInput {
  id: string
  model: string
  family: string
  series: string
  voltage: string
  torqueNm: number
  torque: string
  speedRpm?: number
  speed?: string
  current?: string
  resolution: string
  gearRatio: string
  baudRate: string
  bus: 'TTL Half-Duplex' | 'RS-485 Multidrop'
  physicalConnection: string
  officialUrl: string
  power?: number
  weightKg?: number
  legacyNote?: string
}

function dynamixelLegacy(input: DynamixelLegacyInput): MotorProduct {
  const protocols = [input.bus, input.family === 'PRO Series' ? 'DYNAMIXEL Protocol 2.0' : 'DYNAMIXEL Protocol 1.0']
  return {
    id: input.id,
    brand: 'ROBOTIS',
    model: input.model,
    series: input.series,
    family: input.family,
    lifecycle: 'legacy',
    categoryId: 'integrated',
    summary: `${input.model}은(는) ${input.family}의 ${input.legacyNote ?? '공식 e-Manual에 수록된'} DYNAMIXEL 스마트 액추에이터입니다.`,
    features: [input.torque, input.speed, `${input.bus} · ${protocols.at(-1)}`].filter((value): value is string => Boolean(value)),
    tags: ['ROBOTIS', 'DYNAMIXEL', input.family, input.series, input.model, ...protocols, input.voltage, `${input.torqueNm}Nm`, '레거시'],
    specs: {
      ratedVoltage: input.voltage,
      ratedPower: input.power,
      maxTorque: input.torqueNm,
      maxTorqueText: input.torque,
      torqueBasis: input.family === 'PRO Series' ? '연속 토크' : '스톨 토크 (순간 최대)',
      maxSpeed: input.speedRpm,
      maxSpeedText: input.speed,
      maxCurrentText: input.current ? `스톨/연속 ${input.current}` : undefined,
      currentSummary: input.current ? `스톨/연속 ${input.current}` : undefined,
      resolution: input.resolution,
      encoder: input.family === 'PRO Series' ? '고분해능 절대 엔코더' : '절대 위치 피드백',
      gearRatio: input.gearRatio,
      baudRate: input.baudRate,
      physicalConnection: input.physicalConnection,
      feedback: '위치 · 온도 · 부하/전류 · 입력 전압',
      protocols,
      weight: input.weightKg,
    },
    officialUrl: input.officialUrl,
    sourceChecked: '2026-07-15',
    weight: 58,
  }
}

const dynamixelLegacyMotors: MotorProduct[] = [
  dynamixelLegacy({ id: 'robotis-ax-18a', model: 'AX-18A', family: 'AX Series', series: 'DYNAMIXEL AX', voltage: '9.0–12.0 VDC (권장 11.1 V)', torqueNm: 1.8, torque: '1.8 Nm (12 V, Stall)', speedRpm: 97, speed: '97 rpm (12 V, No-load)', current: '2.2 A (12 V)', resolution: '0.29°', gearRatio: '254 : 1', baudRate: '7,843 bps–1 Mbps', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Level Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/ax/ax-18a/', weightKg: 0.0559, legacyNote: '단종 대체 권장 제품이 안내된' }),
  dynamixelLegacy({ id: 'robotis-ax-12a', model: 'AX-12A', family: 'AX Series', series: 'DYNAMIXEL AX', voltage: '9.0–12.0 VDC (권장 11.1 V)', torqueNm: 1.5, torque: '1.5 Nm (12 V, Stall)', speedRpm: 59, speed: '59 rpm (12 V, No-load)', current: '1.5 A (12 V)', resolution: '0.29°', gearRatio: '254 : 1', baudRate: '7,843 bps–1 Mbps', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Level Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/ax/ax-12a/', weightKg: 0.0546, legacyNote: '단종 대체 권장 제품이 안내된' }),
  dynamixelLegacy({ id: 'robotis-ax-12w', model: 'AX-12W', family: 'AX Series', series: 'DYNAMIXEL AX', voltage: '9.0–12.0 VDC (권장 11.1 V)', torqueNm: 0.2, torque: '0.2 Nm (12 V, Stall)', speedRpm: 470, speed: '470 rpm Wheel Mode (12 V, No-load)', current: '1.4 A (12 V)', resolution: '0.29°', gearRatio: '32 : 1', baudRate: '7,843 bps–1 Mbps', bus: 'TTL Half-Duplex', physicalConnection: 'TTL Level Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/ax/ax-12w/', weightKg: 0.0529, legacyNote: '단종 대체 권장 제품이 안내된' }),
  dynamixelLegacy({ id: 'robotis-ex-106-plus', model: 'EX-106+', family: 'EX Series', series: 'DYNAMIXEL EX', voltage: '12.0–18.5 VDC (권장 14.8 V)', torqueNm: 10.9, torque: '10.9 Nm (18.5 V, Stall)', speedRpm: 91, speed: '91 rpm (18.5 V, No-load)', current: '7 A (18.5 V)', resolution: '0.06°', gearRatio: '184 : 1', baudRate: '7,843 bps–1 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Daisy-chain Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/ex/ex-106%2B/', weightKg: 0.154, legacyNote: '단종 상태로 공식 e-Manual에 수록된' }),
  dynamixelLegacy({ id: 'robotis-dx-113', model: 'DX-113', family: 'DX Series', series: 'DYNAMIXEL DX', voltage: '9.0–12.0 VDC (권장 11.1 V)', torqueNm: 1.0, torque: '1.0 Nm (12 V, Stall)', speedRpm: 54, speed: '54 rpm (12 V, No-load)', resolution: '0.29°', gearRatio: '192.6 : 1', baudRate: '7,343 bps–1 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Daisy-chain Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/dx/dx-113/', weightKg: 0.058, legacyNote: '단종 상태로 공식 e-Manual에 수록된' }),
  dynamixelLegacy({ id: 'robotis-dx-116', model: 'DX-116', family: 'DX Series', series: 'DYNAMIXEL DX', voltage: '12.0–16.0 VDC (권장 14.8 V)', torqueNm: 2.9, torque: '2.1 Nm (12 V) · 2.9 Nm (16 V, Stall)', speed: '공식 e-Manual 수치 미공개', resolution: '0.29°', gearRatio: '142.5 : 1', baudRate: '7,343 bps–1 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Daisy-chain Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/dx/dx-116/', weightKg: 0.066, legacyNote: '단종 상태로 공식 e-Manual에 수록된' }),
  dynamixelLegacy({ id: 'robotis-dx-117', model: 'DX-117', family: 'DX Series', series: 'DYNAMIXEL DX', voltage: '12.0–18.5 VDC (권장 14.8 V)', torqueNm: 3.7, torque: '3.7 Nm (18.5 V, Stall)', speedRpm: 85, speed: '85 rpm (18.5 V, No-load)', current: '1.9 A (18.5 V)', resolution: '0.29°', gearRatio: '192.6 : 1', baudRate: '7,343 bps–1 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Daisy-chain Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/dx/dx-117/', weightKg: 0.066, legacyNote: '단종 상태로 공식 e-Manual에 수록된' }),
  dynamixelLegacy({ id: 'robotis-rx-10', model: 'RX-10', family: 'RX Series', series: 'DYNAMIXEL RX', voltage: '9.0–12.0 VDC (권장 11.1 V)', torqueNm: 1.3, torque: '1.3 Nm (12 V, Stall)', speedRpm: 54, speed: '54 rpm (12 V, No-load)', current: '0.8 A (12 V)', resolution: '0.29°', gearRatio: '193 : 1', baudRate: '7,343 bps–1 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Daisy-chain Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/rx/rx-10/', weightKg: 0.058, legacyNote: '단종 상태로 공식 e-Manual에 수록된' }),
  dynamixelLegacy({ id: 'robotis-rx-24f', model: 'RX-24F', family: 'RX Series', series: 'DYNAMIXEL RX', voltage: '9.0–12.0 VDC (권장 11.1 V)', torqueNm: 2.6, torque: '2.6 Nm (12 V, Stall)', speedRpm: 126, speed: '126 rpm (12 V, No-load)', current: '2.4 A (12 V)', resolution: '0.29°', gearRatio: '193 : 1', baudRate: '7,343 bps–1 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Daisy-chain Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/rx/rx-24f/', weightKg: 0.078, legacyNote: '단종 상태로 공식 e-Manual에 수록된' }),
  dynamixelLegacy({ id: 'robotis-rx-28', model: 'RX-28', family: 'RX Series', series: 'DYNAMIXEL RX', voltage: '12.0–18.5 VDC (권장 14.8 V)', torqueNm: 3.7, torque: '3.7 Nm (18.5 V, Stall)', speedRpm: 85, speed: '85 rpm (18.5 V, No-load)', current: '1.9 A (18.5 V)', resolution: '0.29°', gearRatio: '193 : 1', baudRate: '7,343 bps–1 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Daisy-chain Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/rx/rx-28/', weightKg: 0.078, legacyNote: '단종 상태로 공식 e-Manual에 수록된' }),
  dynamixelLegacy({ id: 'robotis-rx-64', model: 'RX-64', family: 'RX Series', series: 'DYNAMIXEL RX', voltage: '12.0–18.5 VDC (권장 14.8 V)', torqueNm: 5.3, torque: '5.3 Nm (18.5 V, Stall)', speedRpm: 64, speed: '64 rpm (18.5 V, No-load)', current: '2.6 A (18.5 V)', resolution: '0.29°', gearRatio: '200 : 1', baudRate: '7,343 bps–1 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Daisy-chain Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/rx/rx-64/', weightKg: 0.125, legacyNote: '단종 상태로 공식 e-Manual에 수록된' }),
  dynamixelLegacy({ id: 'robotis-pro-h54-200-s500-r', model: 'H54-200-S500-R', family: 'PRO Series', series: 'DYNAMIXEL PRO H54', voltage: '24.0 VDC', torqueNm: 44.7, torque: '44.7 Nm (Continuous)', speedRpm: 33.1, speed: '33.1 rpm (No-load)', current: '9.3 A (Continuous)', resolution: '501,923 pulse/rev', gearRatio: '501.923 : 1', baudRate: '9.6 kbps–10.5 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/pro/h54-200-s500-r/', power: 200, weightKg: 0.855, legacyNote: '구형 PRO 라인업으로 공식 e-Manual에 수록된' }),
  dynamixelLegacy({ id: 'robotis-pro-l54-50-s500-r', model: 'L54-50-S500-R', family: 'PRO Series', series: 'DYNAMIXEL PRO L54', voltage: '24.0 VDC', torqueNm: 14.0, torque: '14.0 Nm (Continuous)', speedRpm: 16, speed: '16.0 rpm (No-load)', current: '1.9 A (Continuous)', resolution: '361,384 pulse/rev', gearRatio: '501.923 : 1', baudRate: '9.6 kbps–10.5 Mbps', bus: 'RS-485 Multidrop', physicalConnection: 'RS-485 Multidrop Bus', officialUrl: 'https://emanual.robotis.com/docs/en/dxl/pro/l54-50-s500-r/', power: 100, weightKg: 0.656, legacyNote: '구형 PRO 라인업으로 공식 e-Manual에 수록된' }),
]

interface PublishedFamilyInput {
  id: string
  brand: 'LS메카피온' | 'KOMOTEK'
  model: string
  series: string
  categoryId: MotorProduct['categoryId']
  summary: string
  features: string[]
  tags: string[]
  specs: MotorProduct['specs']
  officialUrl: string
  weight: number
}

function publishedFamily(input: PublishedFamilyInput): MotorProduct {
  return { ...input, sourceChecked: '2026-07-15' }
}

const lsMotors: MotorProduct[] = [
  publishedFamily({
    id: 'lsmecapion-e-type', brand: 'LS메카피온', model: 'E Type', series: 'LS MECAPION E Type', categoryId: 'ac-servo',
    summary: '고효율 범용 로터리 서보모터 제품군입니다. 공식 제품표에서 플랜지 40–180 mm, 0.05–7.5 kW, 0.16–47.75 Nm 범위를 공개합니다.',
    features: ['플랜지 40–180 mm', '0.05–7.5 kW · 1,000–3,000 rpm', 'BiSS-C · Serial 23-bit 엔코더'],
    tags: ['LS메카피온', 'E Type', 'AC 서보', '고효율', 'BiSS-C', '7.5kW'],
    specs: { powerRange: '0.05–7.5 kW', selectionMaxPower: 7500, ratedTorqueText: '0.16–47.75 Nm', ratedSpeedText: '1,000–3,000 rpm', encoder: 'BiSS-C, Serial 23-bit (멀티턴 16-bit)', feedback: '절대치 엔코더 피드백', protocols: ['BiSS-C', 'Serial 23-bit'] }, officialUrl: lsEType, weight: 88,
  }),
  publishedFamily({
    id: 'lsmecapion-f-type', brand: 'LS메카피온', model: 'F Type', series: 'LS MECAPION F Type', categoryId: 'ac-servo',
    summary: '대형 플랜지 범용 로터리 서보모터 제품군입니다. 공식 제품표에서 0.3–15 kW와 최대 95.49 Nm 범위를 공개합니다.',
    features: ['플랜지 130–220 mm', '0.3–15 kW · 2.86–95.49 Nm', 'BiSS-C · Serial 19-bit 엔코더'],
    tags: ['LS메카피온', 'F Type', 'AC 서보', '15kW', 'BiSS-C'],
    specs: { powerRange: '0.3–15 kW', selectionMaxPower: 15000, ratedTorqueText: '2.86–95.49 Nm', ratedSpeedText: '1,000–3,000 rpm', encoder: 'BiSS-C, Serial 19-bit', feedback: '절대치 엔코더 피드백', protocols: ['BiSS-C', 'Serial 19-bit'] }, officialUrl: lsFType, weight: 87,
  }),
  publishedFamily({
    id: 'lsmecapion-fl-type', brand: 'LS메카피온', model: 'FL Type', series: 'LS MECAPION FL Type', categoryId: 'ac-servo',
    summary: '컴팩트한 Flat Type 회전형 서보모터 제품군입니다. 공식 제품표에서 0.05–1 kW, 2,000–3,000 rpm을 공개합니다.',
    features: ['0.05–1 kW', '0.16–3.18 Nm', '40–80 mm 컴팩트 플랜지'],
    tags: ['LS메카피온', 'FL Type', 'Flat Type', 'AC 서보', '1kW'],
    specs: { powerRange: '0.05–1 kW', selectionMaxPower: 1000, ratedTorqueText: '0.16–3.18 Nm', ratedSpeedText: '2,000–3,000 rpm', encoder: 'BiSS-C, Serial 19-bit (FAL Type: 18-bit)', feedback: '절대치 엔코더 피드백', protocols: ['BiSS-C', 'Serial 19-bit'] }, officialUrl: lsFLType, weight: 86,
  }),
  publishedFamily({
    id: 'lsmecapion-hollow-spinner', brand: 'LS메카피온', model: '중공형 & Spinner', series: 'LS MECAPION Hollow & Spinner', categoryId: 'robot-module',
    summary: '케이블 관통 및 회전 기구에 적합한 중공축형 서보모터 제품군입니다. 공식 제품표의 정격 출력 범위는 0.1–3 kW입니다.',
    features: ['중공축형 서보', '0.1–3 kW', 'Incremental 엔코더'],
    tags: ['LS메카피온', '중공형', 'Spinner', '로봇 모듈', '3kW'],
    specs: { powerRange: '0.1–3 kW', selectionMaxPower: 3000, ratedTorqueText: '0.32–9.55 Nm', ratedSpeedText: '2,000–3,000 rpm', encoder: 'Incremental type', feedback: '증분형 엔코더 피드백', protocols: ['Incremental encoder'] }, officialUrl: lsHollowSpinner, weight: 84,
  }),
  publishedFamily({
    id: 'lsmecapion-thin-dd', brand: 'LS메카피온', model: '박형 DD모터', series: 'LS MECAPION Thin DD', categoryId: 'frameless',
    summary: '저속 직결축용 박형 Direct-Drive 모터 제품군입니다. 공식 제품표에서 Ø135–230 mm, 3–12 Nm, 정격 200 rpm을 공개합니다.',
    features: ['직결 구동', '3–12 Nm', 'BiSS-C · Serial 24-bit'],
    tags: ['LS메카피온', '박형 DD', 'Direct-Drive', '12Nm', '200rpm'],
    specs: { powerRange: '0.063–0.251 kW', selectionMaxPower: 251, ratedTorqueText: '3–12 Nm', ratedSpeedText: '200 rpm', encoder: 'BiSS-C, Serial 24-bit (싱글턴)', feedback: '절대치 엔코더 피드백', protocols: ['BiSS-C', 'Serial 24-bit'] }, officialUrl: lsThinDD, weight: 90,
  }),
  publishedFamily({
    id: 'lsmecapion-dd-motor', brand: 'LS메카피온', model: 'DD모터', series: 'LS MECAPION DD Motor', categoryId: 'frameless',
    summary: '감속기 없이 부하를 직접 구동하는 Direct-Drive 모터 제품군입니다. 공식 제품표에서 최대 330 Nm와 50–200 rpm 범위를 공개합니다.',
    features: ['직결 구동', '3–330 Nm', 'BiSS-C · Serial 20-bit'],
    tags: ['LS메카피온', 'DD모터', 'Direct-Drive', '330Nm', '정밀축'],
    specs: { powerRange: '0.063–2.51 kW', selectionMaxPower: 2510, ratedTorqueText: '3–330 Nm', ratedSpeedText: '50–200 rpm', encoder: 'BiSS-C, Serial 20-bit (싱글턴)', feedback: '절대치 엔코더 피드백', protocols: ['BiSS-C', 'Serial 20-bit'] }, officialUrl: lsDD, weight: 92,
  }),
  publishedFamily({
    id: 'lsmecapion-pega', brand: 'LS메카피온', model: 'PEGA', series: 'LS MECAPION PEGA', categoryId: 'integrated',
    summary: '모터와 드라이브가 일체화된 EtherCAT 타입 제품군입니다. 공개 정격표 기준 입력전압은 DC 48–60 V이며 50–300 W 범위입니다.',
    features: ['모터·드라이브 일체형', 'DC 48–60 V · EtherCAT', '50–300 W · SSI Magnetic 12-bit'],
    tags: ['LS메카피온', 'PEGA', '일체형 서보', 'EtherCAT', 'DC 48–60V', '300W'],
    specs: { ratedVoltage: 'DC 48–60 V', powerRange: '50–300 W', ratedPowerOptions: [50, 100, 200, 300], selectionMaxPower: 300, ratedTorqueText: '0.16–0.95 Nm', ratedSpeedText: '2,400–3,000 rpm', ratedCurrentText: '1.8 / 2.4 / 3.6 / 5.0 / 6.8 Arms (용량별)', maxCurrentText: '3.5 / 3.8 / 7.2 / 10.0 / 13.6 Arms (용량별)', flangeText: '40–60 mm', encoder: 'SSI, Magnetic 12-bit', feedback: 'SSI 자기식 엔코더 피드백', protocols: ['EtherCAT', 'SSI'], physicalConnection: 'EtherCAT 일체형 드라이브·모터' }, officialUrl: lsPega, weight: 91,
  }),
]

const komotekMotors: MotorProduct[] = [
  publishedFamily({ id: 'komotek-kanz', brand: 'KOMOTEK', model: 'KANZ', series: 'KOMOTEK AC Servo', categoryId: 'ac-servo', summary: '초소형 실린더형 AC 서보모터 제품군입니다. 공식 표는 30–950 W, IP65, Ultra-low inertia를 공개합니다.', features: ['30–950 W', '3,000 rpm 정격 · 최대 5,000 rpm', 'IP65 · Ultra-low inertia'], tags: ['KOMOTEK', 'KANZ', 'AC 서보', 'IP65', '950W'], specs: { ratedVoltage: '200 / 220 VAC', powerRange: '30–950 W', selectionMaxPower: 950, ratedSpeedText: '3,000 rpm', maxSpeedText: '3,500–5,000 rpm (용량별)', ipRating: 'IP65', inertia: undefined, feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekAcServo, weight: 86 }),
  publishedFamily({ id: 'komotek-kanq', brand: 'KOMOTEK', model: 'KANQ', series: 'KOMOTEK AC Servo', categoryId: 'ac-servo', summary: '팬케이크형 저관성 AC 서보모터 제품군입니다. 공식 표는 100–400 W와 IP65를 공개합니다.', features: ['100–400 W', '팬케이크형', 'IP65 · Low inertia'], tags: ['KOMOTEK', 'KANQ', 'AC 서보', '팬케이크', '400W'], specs: { ratedVoltage: '200 / 220 VAC', powerRange: '100–400 W', selectionMaxPower: 400, ratedSpeedText: '3,000 rpm', maxSpeedText: '5,000 rpm', ipRating: 'IP65', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekAcServo, weight: 82 }),
  publishedFamily({ id: 'komotek-kand', brand: 'KOMOTEK', model: 'KAND', series: 'KOMOTEK AC Servo', categoryId: 'ac-servo', summary: '중관성 실린더형 AC 서보모터 제품군입니다. 공식 표는 0.75–9.0 kW, 2,000–3,000 rpm 범위를 공개합니다.', features: ['0.75–9.0 kW', '중관성', '이송기 · 중형 로봇 축'], tags: ['KOMOTEK', 'KAND', 'AC 서보', '9kW', '중관성'], specs: { ratedVoltage: '200 / 220 VAC', powerRange: '0.75–9.0 kW', selectionMaxPower: 9000, ratedSpeedText: '2,000–3,000 rpm', ipRating: 'IP55', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekAcServo, weight: 87 }),
  publishedFamily({ id: 'komotek-kans', brand: 'KOMOTEK', model: 'KANS', series: 'KOMOTEK AC Servo', categoryId: 'ac-servo', summary: '고속 위치 제어용 저관성 AC 서보모터 제품군입니다. 공식 표는 1.0–5.0 kW, 최대 5,000 rpm을 공개합니다.', features: ['1.0–5.0 kW', '최대 5,000 rpm', '고속 위치 제어'], tags: ['KOMOTEK', 'KANS', 'AC 서보', '5kW', '고속'], specs: { ratedVoltage: '200 / 220 VAC', powerRange: '1.0–5.0 kW', selectionMaxPower: 5000, ratedSpeedText: '3,000 rpm', maxSpeedText: '4,500–5,000 rpm (용량별)', ipRating: 'IP55', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekAcServo, weight: 85 }),
  publishedFamily({ id: 'komotek-kanh', brand: 'KOMOTEK', model: 'KANH', series: 'KOMOTEK AC Servo', categoryId: 'ac-servo', summary: '공작기계·권선기용 초고관성 AC 서보모터 제품군입니다. 공식 표는 0.5–5.0 kW를 공개합니다.', features: ['0.5–5.0 kW', '초고관성', '공작기계 · 권선기'], tags: ['KOMOTEK', 'KANH', 'AC 서보', '5kW', '초고관성'], specs: { ratedVoltage: '200 / 220 VAC', powerRange: '0.5–5.0 kW', selectionMaxPower: 5000, ratedSpeedText: '2,000–3,000 rpm', ipRating: 'IP55', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekAcServo, weight: 84 }),
  publishedFamily({ id: 'komotek-kanf', brand: 'KOMOTEK', model: 'KANF', series: 'KOMOTEK AC Servo', categoryId: 'ac-servo', summary: '팬케이크형 중관성 AC 서보모터 제품군입니다. 공식 표는 0.4–15 kW를 공개합니다.', features: ['0.4–15 kW', '팬케이크형', '중형 로봇 · 식가공 장비'], tags: ['KOMOTEK', 'KANF', 'AC 서보', '15kW', '팬케이크'], specs: { ratedVoltage: '200 / 220 VAC', powerRange: '0.4–15 kW', selectionMaxPower: 15000, ratedSpeedText: '2,000–3,000 rpm', ipRating: 'IP55', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekAcServo, weight: 88 }),
  publishedFamily({ id: 'komotek-kank', brand: 'KOMOTEK', model: 'KANK', series: 'KOMOTEK AC Servo', categoryId: 'ac-servo', summary: 'IP65 중관성 AC 서보모터 제품군입니다. 공식 표는 0.3–6.0 kW, 1,000–2,000 rpm을 공개합니다.', features: ['0.3–6.0 kW', 'IP65', '공작기계 · 운반기'], tags: ['KOMOTEK', 'KANK', 'AC 서보', 'IP65', '6kW'], specs: { ratedVoltage: '200 / 220 VAC', powerRange: '0.3–6.0 kW', selectionMaxPower: 6000, ratedSpeedText: '1,000–2,000 rpm', ipRating: 'IP65', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekAcServo, weight: 83 }),
  publishedFamily({ id: 'komotek-kanl', brand: 'KOMOTEK', model: 'KANL', series: 'KOMOTEK AC Servo', categoryId: 'ac-servo', summary: '고관성 AC 서보모터 제품군입니다. 공식 표는 0.3–6.0 kW, 1,000–2,000 rpm을 공개합니다.', features: ['0.3–6.0 kW', '고관성', '공작기계 · 스프링 성형기'], tags: ['KOMOTEK', 'KANL', 'AC 서보', '고관성', '6kW'], specs: { ratedVoltage: '200 / 220 VAC', powerRange: '0.3–6.0 kW', selectionMaxPower: 6000, ratedSpeedText: '1,000–2,000 rpm', ipRating: 'IP65', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekAcServo, weight: 83 }),
  publishedFamily({ id: 'komotek-kafz-24v', brand: 'KOMOTEK', model: 'KAFZ 24 V Cylinder', series: 'KOMOTEK Low-Voltage Servo', categoryId: 'dc-servo', summary: '24 VDC 실린더형 저전압 서보모터 제품군입니다. 공식 표는 100–600 W와 IP65를 공개합니다.', features: ['24 VDC', '100–600 W', '3,000 / 3,500 rpm'], tags: ['KOMOTEK', 'KAFZ', '24V', '저전압 서보', 'IP65'], specs: { ratedVoltage: '24 VDC', powerRange: '100–600 W', selectionMaxPower: 600, ratedSpeedText: '3,000 rpm', maxSpeedText: '3,500 rpm', ipRating: 'IP65', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekLowVoltage, weight: 89 }),
  publishedFamily({ id: 'komotek-kafq-24v', brand: 'KOMOTEK', model: 'KAFQ 24 V Pancake', series: 'KOMOTEK Low-Voltage Servo', categoryId: 'dc-servo', summary: '24 VDC 팬케이크형 저전압 서보모터 제품군입니다. 공식 표는 100–400 W를 공개합니다.', features: ['24 VDC', '100–400 W', '팬케이크형 · Low inertia'], tags: ['KOMOTEK', 'KAFQ', '24V', '저전압 서보', '팬케이크'], specs: { ratedVoltage: '24 VDC', powerRange: '100–400 W', selectionMaxPower: 400, ratedSpeedText: '3,000 rpm', maxSpeedText: '3,500 rpm', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekLowVoltage, weight: 87 }),
  publishedFamily({ id: 'komotek-kafz-48v', brand: 'KOMOTEK', model: 'KAFZ 48 V Cylinder', series: 'KOMOTEK Low-Voltage Servo', categoryId: 'dc-servo', summary: '48 VDC 실린더형 저전압 서보모터 제품군입니다. 공식 표는 100–800 W와 IP65를 공개합니다.', features: ['48 VDC', '100–800 W', '3,000 / 4,000 rpm'], tags: ['KOMOTEK', 'KAFZ', '48V', '저전압 서보', '800W'], specs: { ratedVoltage: '48 VDC', powerRange: '100–800 W', selectionMaxPower: 800, ratedSpeedText: '3,000 rpm', maxSpeedText: '4,000 rpm', ipRating: 'IP65', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekLowVoltage, weight: 90 }),
  publishedFamily({ id: 'komotek-kafq-48v', brand: 'KOMOTEK', model: 'KAFQ 48 V Pancake', series: 'KOMOTEK Low-Voltage Servo', categoryId: 'dc-servo', summary: '48 VDC 팬케이크형 저전압 서보모터 제품군입니다. 공식 표는 100–400 W를 공개합니다.', features: ['48 VDC', '100–400 W', '팬케이크형 · Low inertia'], tags: ['KOMOTEK', 'KAFQ', '48V', '저전압 서보', '팬케이크'], specs: { ratedVoltage: '48 VDC', powerRange: '100–400 W', selectionMaxPower: 400, ratedSpeedText: '3,000 rpm', maxSpeedText: '4,000 rpm', feedback: '드라이브·엔코더 조합은 공식 자료 확인' }, officialUrl: komotekLowVoltage, weight: 87 }),
  publishedFamily({ id: 'komotek-special-servo', brand: 'KOMOTEK', model: 'Special Servo Motor', series: 'KOMOTEK Special Servo', categoryId: 'ac-servo', summary: '서보 프레스·반도체 제조 장비용 고토크 특수 서보모터 제품군입니다. 공식 표는 40–800 kW, 250–30,500 Nm 범위를 공개합니다.', features: ['40–800 kW', '250–30,500 Nm', '서보 프레스 · 반도체 장비'], tags: ['KOMOTEK', '특수 서보', '서보 프레스', '800kW', '고토크'], specs: { ratedVoltage: '400–750 VDC', powerRange: '40–800 kW', selectionMaxPower: 800000, ratedTorqueText: '250–30,500 Nm', ratedSpeedText: '250–1,500 rpm', feedback: '고토크 특수 사양은 공식 문의로 확정' }, officialUrl: komotekSpecialServo, weight: 95 }),
  publishedFamily({ id: 'komotek-kafd-01d02n10', brand: 'KOMOTEK', model: 'KAFD-01D02N10', series: 'KOMOTEK Hollow Shaft Servo', categoryId: 'robot-module', summary: '48 VDC 중공축형 서보모터입니다. 공식 표의 정격 토크는 0.29 Nm입니다.', features: ['중공축형', '0.29 Nm · 3.5 Arms', '3,000 rpm · 48 VDC'], tags: ['KOMOTEK', '중공축', '48V', '0.29Nm', 'KAFD'], specs: { ratedVoltage: '48 VDC', ratedTorque: 0.29, ratedCurrent: 3.5, ratedSpeed: 3000, feedback: '중공축형 정밀 속도·가감속 제어' }, officialUrl: komotekHollowShaft, weight: 88 }),
  publishedFamily({ id: 'komotek-kaff-03d01n10', brand: 'KOMOTEK', model: 'KAFF-03D01N10', series: 'KOMOTEK Hollow Shaft Servo', categoryId: 'robot-module', summary: '48 VDC 중공축형 서보모터입니다. 공식 표의 정격 토크는 0.63 Nm입니다.', features: ['중공축형', '0.63 Nm · 8.6 Arms', '3,930 rpm · 48 VDC'], tags: ['KOMOTEK', '중공축', '48V', '0.63Nm', 'KAFF'], specs: { ratedVoltage: '48 VDC', ratedTorque: 0.63, ratedCurrent: 8.6, ratedSpeed: 3930, feedback: '중공축형 정밀 속도·가감속 제어' }, officialUrl: komotekHollowShaft, weight: 89 }),
  publishedFamily({ id: 'komotek-kxnq-03dt1nx', brand: 'KOMOTEK', model: 'KXNQ-03DT1NX', series: 'KOMOTEK Hollow Shaft Servo', categoryId: 'robot-module', summary: '48 VDC 중공축형 고토크 서보모터입니다. 공식 표의 정격 토크는 11.3 Nm입니다.', features: ['중공축형', '11.3 Nm · 3.5 Arms', '3,030 rpm · 48 VDC'], tags: ['KOMOTEK', '중공축', '48V', '11.3Nm', 'KXNQ'], specs: { ratedVoltage: '48 VDC', ratedTorque: 11.3, ratedCurrent: 3.5, ratedSpeed: 3030, feedback: '중공축형 정밀 속도·가감속 제어' }, officialUrl: komotekHollowShaft, weight: 93 }),
  publishedFamily({ id: 'komotek-kafx-06d01nx10', brand: 'KOMOTEK', model: 'KAFX-06D01NX10', series: 'KOMOTEK Hollow Shaft Servo', categoryId: 'robot-module', summary: '48 VDC 중공축형 서보모터입니다. 공식 표의 정격 토크는 2.16 Nm입니다.', features: ['중공축형', '2.16 Nm · 19.63 Arms', '2,525 rpm · 48 VDC'], tags: ['KOMOTEK', '중공축', '48V', '2.16Nm', 'KAFX'], specs: { ratedVoltage: '48 VDC', ratedTorque: 2.16, ratedCurrent: 19.63, ratedSpeed: 2525, feedback: '중공축형 정밀 속도·가감속 제어' }, officialUrl: komotekHollowShaft, weight: 90 }),
]

const fastechMotors: MotorProduct[] = [
  {
    id: 'fastech-ezi-servo-ii-bt', brand: 'FASTECH', model: 'Ezi-SERVO II BT', series: 'Ezi-SERVO II BT', family: 'Ezi-SERVO', lifecycle: 'current', categoryId: 'integrated',
    summary: '모터·고분해능 엔코더·드라이브를 한 몸체에 통합한 클로즈드 루프 스테핑 시스템입니다.',
    features: ['모터·엔코더·드라이브 일체형', '클로즈드 루프 · 게인 조정/헌팅 최소화', 'Pulse I/O 최대 500 kHz'],
    tags: ['FASTECH', '파스텍', 'Ezi-SERVO', 'Ezi-SERVO II BT', '일체형 서보', '24V', 'Pulse', '클로즈드 루프', '홀딩 토크 2.4Nm'],
    specs: { ratedVoltage: '24 VDC ±10%', holdingTorque: 2.4, ratedTorqueText: '홀딩 토크 0.069–2.4 Nm', torqueBasis: '홀딩 토크(정지 유지 기준)', ratedSpeedText: '0–3,000 rpm', maxSpeed: 3000, maxSpeedText: '0–3,000 rpm', currentSummary: '상전류 0.95–4.0 A (모델별)', encoder: '고분해능 엔코더', resolution: '16,000 / 20,000 pulse/rev (모델별)', physicalConnection: 'Pulse I/O (1/2 Pulse, 최대 500 kHz)', protocols: ['Pulse / I/O'], safety: '과전류·과전압·저전압·과열 보호' },
    officialUrl: fastechServoBt, sourceChecked: '2026-07-20', weight: 88,
  },
  {
    id: 'fastech-ezi-servo-all', brand: 'FASTECH', model: 'Ezi-SERVO ALL', series: 'Ezi-SERVO ALL', family: 'Ezi-SERVO', lifecycle: 'current', categoryId: 'integrated',
    summary: '모터·고분해능 엔코더·드라이브·모션 컨트롤러를 통합해 위치 테이블 제어를 지원하는 일체형 서보입니다.',
    features: ['모터·엔코더·드라이브·모션 컨트롤러 일체형', 'RS-485 다축 연결 · 위치 테이블 제어', 'NEMA24 IP65 옵션'],
    tags: ['FASTECH', '파스텍', 'Ezi-SERVO', 'Ezi-SERVO ALL', '일체형 서보', '24V', 'RS-485', '모션 컨트롤러', '홀딩 토크 2.4Nm'],
    specs: { ratedVoltage: '24 VDC ±10%', holdingTorque: 2.4, ratedTorqueText: '홀딩 토크 0.069–2.4 Nm', torqueBasis: '홀딩 토크(정지 유지 기준)', ratedSpeedText: '0–3,000 rpm', maxSpeed: 3000, maxSpeedText: '0–3,000 rpm', currentSummary: '상전류 0.95–4.0 A (모델별)', encoder: '고분해능 엔코더', resolution: '16,000 / 20,000 pulse/rev (모델별)', baudRate: '9,600–921,600 bps', physicalConnection: 'RS-485', protocols: ['RS-485'], operatingModes: '위치 테이블 제어', ipRating: 'NEMA24: IP65 옵션' },
    officialUrl: fastechServoAll, sourceChecked: '2026-07-20', weight: 90,
  },
  {
    id: 'fastech-ezi-servo-ii-ethercat-all', brand: 'FASTECH', model: 'Ezi-SERVO II EtherCAT ALL', series: 'Ezi-SERVO II EtherCAT ALL', family: 'Ezi-SERVO', lifecycle: 'current', categoryId: 'integrated',
    summary: '고분해능 엔코더와 EtherCAT 드라이브를 모터에 통합하고 CiA402 프로파일을 지원하는 클로즈드 루프 스테핑 시스템입니다.',
    features: ['모터·엔코더·EtherCAT 드라이브 일체형', 'EtherCAT CoE (CiA402) · FoE', '0.44–12 Nm 홀딩 토크 범위'],
    tags: ['FASTECH', '파스텍', 'Ezi-SERVO', 'Ezi-SERVO II EtherCAT ALL', '일체형 서보', '24V', '48V', 'EtherCAT', 'CiA402', 'FoE', '홀딩 토크 12Nm'],
    specs: { ratedVoltage: '24 VDC ±10% / 48 VDC ±10% (모델별)', holdingTorque: 12, ratedTorqueText: '홀딩 토크 0.44–12 Nm', torqueBasis: '홀딩 토크(정지 유지 기준)', ratedSpeedText: '0–3,000 rpm (24 V) / 0–2,000 rpm (48 V)', maxSpeed: 3000, maxSpeedText: '최대 3,000 rpm (24 V)', currentSummary: '상전류 1.2–6.0 A (모델별)', encoder: '고분해능 엔코더', resolution: '16,000 / 20,000 pulse/rev (모델별)', physicalConnection: 'EtherCAT', protocols: ['EtherCAT', 'CoE (CiA402)', 'FoE'], operatingModes: 'Profile Position · Homing · Cyclic Synchronous Position' },
    officialUrl: fastechServoEthercatAll, sourceChecked: '2026-07-20', weight: 94,
  },
  {
    id: 'fastech-ezi-step-bt', brand: 'FASTECH', model: 'Ezi-STEP BT', series: 'Ezi-STEP BT', family: 'Ezi-STEP', lifecycle: 'current', categoryId: 'integrated',
    summary: '스테핑 모터와 마이크로스텝 드라이브를 통합한 배선 절감형 일체형 스테핑 제품군입니다.',
    features: ['모터·드라이브 일체형', 'PWM 마이크로스텝 · 소프트웨어 댐핑', 'Pulse I/O 최대 500 kHz'],
    tags: ['FASTECH', '파스텍', 'Ezi-STEP', 'Ezi-STEP BT', '일체형 스테퍼', '24V', '48V', 'Pulse', '마이크로스텝', '홀딩 토크 12Nm'],
    specs: { ratedVoltage: '24 VDC ±10% / 40-70 VDC (86 mm)', holdingTorque: 12, ratedTorqueText: '홀딩 토크 0.32–12 Nm', torqueBasis: '홀딩 토크(정지 유지 기준)', ratedSpeedText: '0–3,000 rpm', maxSpeed: 3000, maxSpeedText: '0–3,000 rpm', currentSummary: '상전류 1.2 / 3.0 / 6.0 A (프레임별)', physicalConnection: 'Pulse I/O (1/2 Pulse, 최대 500 kHz)', protocols: ['Pulse / I/O'], operatingModes: '마이크로스텝 · Run/Stop 제어', safety: '과전류·과전압·저전압·과열 보호' },
    officialUrl: fastechStepBt, sourceChecked: '2026-07-20', weight: 87,
  },
  {
    id: 'fastech-ezi-step-all', brand: 'FASTECH', model: 'Ezi-STEP ALL', series: 'Ezi-STEP ALL', family: 'Ezi-STEP', lifecycle: 'current', categoryId: 'integrated',
    summary: '스테핑 모터·드라이브·모션 컨트롤러·네트워크를 한 몸체에 통합해 소형 다축 제어에 쓰는 일체형 스테핑 시스템입니다.',
    features: ['모터·드라이브·모션 컨트롤러 일체형', 'RS-485 최대 16축 데이지 체인', '64 모션 스텝 · 마이크로스텝'],
    tags: ['FASTECH', '파스텍', 'Ezi-STEP', 'Ezi-STEP ALL', '일체형 스테퍼', '24V', 'RS-485', '16축', '64 모션 스텝', '홀딩 토크 1.5Nm'],
    specs: { ratedVoltage: '24 VDC ±10%', holdingTorque: 1.5, ratedTorqueText: '홀딩 토크 0.32–1.5 Nm', torqueBasis: '홀딩 토크(정지 유지 기준)', ratedSpeedText: '0–3,000 rpm', maxSpeed: 3000, maxSpeedText: '0–3,000 rpm', currentSummary: '상전류 1.2 / 3.0 A (프레임별)', baudRate: '9,600–921,600 bps', physicalConnection: 'RS-485 (최대 16축 데이지 체인)', protocols: ['RS-485'], operatingModes: '64 모션 스텝 · 마이크로스텝 · Run/Stop 제어' },
    officialUrl: fastechStepAll, sourceChecked: '2026-07-20', weight: 89,
  },
]

export const externalMotors: MotorProduct[] = [
  ...dynamixelMotors,
  ...additionalDynamixelXMotors,
  ...dynamixelYMotors,
  ...dynamixelPMotors,
  ...dynamixelMxMotors,
  ...dynamixelLegacyMotors,
  ...lsMotors,
  ...komotekMotors,
  ...fastechMotors,
]
