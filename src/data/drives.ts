import type { MotorProduct } from '../types'

export type DriveMatchStatus = 'integrated' | 'spec-match' | 'attention'

export interface DriveMatch {
  status: DriveMatchStatus
  label: string
  model: string
  family: string
  summary: string
  specifications: string[]
  reasons: string[]
  cautions: string[]
  officialUrl: string
  sourceChecked: string
}

export interface DriveCompatibility {
  requirement: 'integrated' | 'external'
  badge: string
  heading: string
  description: string
  matches: DriveMatch[]
  checks: string[]
}

const checked = '2026-07-14'

const driveUrls = {
  fd1x5: 'https://www.kincoautomation.com/product/118',
  fd1x4s: 'https://www.kincoautomation.com/productdetail/fd1x4ss.html',
  fd2x5: 'https://www.kincoautomation.com/product_list?id_o=1&id_t=5',
  fd2s: 'https://www.kincoautomation.com/product/122',
  fd5pPro: 'https://www.kincoautomation.com/product/158?classification_id=42',
  fm: 'https://www.kincoautomation.com/product/automation/fm',
  cm: 'https://www.kincoautomation.com/product/automation/cm',
}

function maxRatedPower(product: MotorProduct) {
  return product.specs.ratedPowerOptions?.length ? Math.max(...product.specs.ratedPowerOptions) : product.specs.ratedPower
}

function voltageText(product: MotorProduct) {
  return `${product.specs.ratedVoltage ?? ''} ${product.specs.dcInputRange ?? ''}`.toLowerCase()
}

function hasVoltage(product: MotorProduct, value: string) {
  return voltageText(product).includes(value)
}

function baseChecks(product: MotorProduct) {
  const power = maxRatedPower(product)
  const checks = [
    product.specs.ratedVoltage ?? product.specs.dcInputRange ? `모터 전압: ${product.specs.ratedVoltage ?? product.specs.dcInputRange}` : '모터 전압: 공개 사양 확인 필요',
    power !== undefined ? `정격 출력: ${power.toLocaleString('ko-KR')} W` : '정격 출력: 공개 사양 확인 필요',
    product.specs.ratedCurrent !== undefined ? `정격 전류: ${product.specs.ratedCurrent.toLocaleString('ko-KR')} A` : '정격 전류: 공개 사양 확인 필요',
    product.specs.encoder ? `엔코더: ${product.specs.encoder}` : '엔코더 규격: 드라이브 선정 전 확인 필요',
  ]
  return checks
}

function match(status: DriveMatchStatus, label: string, model: string, family: string, summary: string, specifications: string[], reasons: string[], cautions: string[], officialUrl: string): DriveMatch {
  return { status, label, model, family, summary, specifications, reasons, cautions, officialUrl, sourceChecked: checked }
}

function integratedCompatibility(product: MotorProduct): DriveCompatibility {
  return {
    requirement: 'integrated',
    badge: '드라이브 내장',
    heading: '외부 서보 드라이브가 필요하지 않습니다.',
    description: `${product.series}은(는) 제품군 자체에 모터와 드라이브 또는 구동 제어부가 통합된 구성입니다.`,
    matches: [match('integrated', '드라이브 내장', `${product.series} 통합 구동부`, product.series, '외부 드라이브 구매 대상이 아닌 통합 구동 제품입니다.', ['모터·드라이브 통합', product.specs.protocols?.length ? `통신: ${product.specs.protocols.join(' · ')}` : '통신: 공식 제품 페이지 확인'], ['외부 드라이브 별도 선정 불필요'], ['전원, 통신 옵션, 브레이크·감속기 구성은 실제 모델 코드로 확인'], product.officialUrl)],
    checks: ['전원 및 통신 옵션', '브레이크·감속기 옵션', '제어기·PLC 통신 호환'],
  }
}

function manufacturerDriveCompatibility(product: MotorProduct): DriveCompatibility {
  if (product.brand === 'ROBOTIS' || product.brand === 'FASTECH') return integratedCompatibility(product)
  return {
    requirement: 'external',
    badge: '제조사 드라이브 조합 확인',
    heading: `${product.brand} 공식 드라이브 조합을 확인하세요.`,
    description: '현재 등록된 공식 공개 자료에는 이 제품군의 모터-드라이브 주문 조합표가 충분히 공개되어 있지 않습니다. 제조사 카탈로그 또는 기술 문의로 모델 코드를 확정해야 합니다.',
    matches: [match('attention', '공식 자료 확인', '공식 시스템 선정 필요', `${product.brand} Drive System`, '모터 제품군의 공식 페이지를 기준으로, 전원·정격 전류·엔코더·통신 옵션을 대조한 뒤 제조사 드라이브 모델을 확정하세요.', ['제품군 공식 페이지 연결', '모델 코드·옵션 조합은 제조사 확인 필요'], ['제조사 공식 제품군'], ['모터 정격 전압·전류', '엔코더·브레이크 옵션', '드라이브 모델 코드와 통신 옵션'], product.officialUrl)],
    checks: [...baseChecks(product), '제조사 드라이브 모델 코드', '엔코더·브레이크 옵션', '제어기 통신 호환'],
  }
}

function acServoCompatibility(product: MotorProduct): DriveCompatibility {
  const power = maxRatedPower(product)
  const highVoltage = /560\s*vdc|380\s*vac|5hsp/i.test(`${product.specs.ratedVoltage ?? ''} ${product.model}`)
  const matches: DriveMatch[] = []

  if (power === undefined) {
    matches.push(match('attention', '추가 확인', 'FD2S Series', 'FD2S', '공식 AC 서보 드라이브 제품군입니다. 모터 정격 출력과 전원 사양이 공개되지 않아 정확한 드라이브 모델을 자동 확정할 수 없습니다.', ['50 W - 3 kW', '단상/3상 220 VAC 및 3상 380 VAC', 'Pulse · Modbus · CANopen · EtherCAT'], ['AC 서보용 공식 드라이브 제품군'], ['정격 전력, 전류, 엔코더 유형을 확인한 뒤 세부 모델을 결정'], driveUrls.fd2s))
  } else if (highVoltage) {
    const profile = power <= 2000
      ? ['FD612S-LA/CA/EA-000', '1.5 - 2 kW', '3상 380 VAC', '연속 5.5 A · 피크 15 A']
      : ['FD622S-LA/CA/EA-000', '3 kW', '3상 380 VAC', '연속 7 A · 피크 25 A']
    matches.push(match('spec-match', '공개 사양 일치', profile[0], 'FD2S', '공식 FD2S 드라이브 정격 범위와 모터 전원·출력 조건이 일치하는 후보입니다.', [profile[1], profile[2], profile[3], 'RS485 또는 CANopen 또는 EtherCAT'], [`${power.toLocaleString('ko-KR')} W 출력 범위 일치`, '3상 380 VAC 계통 후보'], ['엔코더 타입·브레이크 전압·통신 접미사는 최종 모델 코드로 확인'], driveUrls.fd2s))
  } else {
    const profile = power <= 100
      ? ['FD412S-LA/CA/EA-000', '50 - 100 W', '단상/3상 220 VAC', '연속 2 A · 피크 7 A']
      : power <= 750
        ? ['FD422S-LA/CA/EA-000', '200 - 750 W', '단상/3상 220 VAC', '연속 4 A · 피크 15 A']
        : power <= 1000
          ? ['FD422S-LF/CF/EF-000', '1 kW', '단상/3상 220 VAC', '연속 5 A · 피크 15 A']
          : ['FD432S-LA/CA/EA-000', '1 - 2 kW', '단상/3상 220 VAC', '연속 11 A · 피크 27.5 A']
    matches.push(match('spec-match', '공개 사양 일치', profile[0], 'FD2S', '공식 FD2S 드라이브 정격 범위와 모터 출력 조건이 일치하는 후보입니다.', [profile[1], profile[2], profile[3], 'RS485 또는 CANopen 또는 EtherCAT'], [`${power.toLocaleString('ko-KR')} W 출력 범위 일치`, 'AC 220 V 계통 후보'], ['엔코더 타입·브레이크 전압·통신 접미사는 최종 모델 코드로 확인'], driveUrls.fd2s))
  }

  if (product.series === 'SMK') {
    matches.push(match('spec-match', '공식 선택 가이드', 'FD5P PRO Series', 'FD5P PRO', 'Kinco가 FD5P PRO와 SMK의 조합 선택 가이드를 공식 자료로 제공하는 드라이브 제품군입니다.', ['EtherCAT · Modbus · Profinet 지원', 'SMK 전용 선택 가이드 제공'], ['SMK 조합 공식 선택 가이드 확인'], ['정확한 출력 등급과 엔코더 조합은 선택 가이드의 모델 코드표로 확정'], driveUrls.fd5pPro))
  }

  return {
    requirement: 'external',
    badge: '외부 AC 서보 드라이브 필요',
    heading: 'AC 서보 드라이브를 함께 선정하세요.',
    description: '아래 후보는 Kinco가 공개한 드라이브 출력·전원·통신 범위와 모터 공개 사양을 대조한 결과입니다.',
    matches,
    checks: [...baseChecks(product), '드라이브 주전원(220/380 VAC)', '엔코더 피드백 방식과 브레이크 전원'],
  }
}

function lowVoltageServoCompatibility(product: MotorProduct): DriveCompatibility {
  const power = maxRatedPower(product)
  const is96V = hasVoltage(product, '96')
  const matches: DriveMatch[] = []

  if (is96V) {
    matches.push(match('attention', '추가 확인', 'FD2X5 Series', 'FD2X5', 'Kinco는 96 V 고효율 저전압 서보 드라이브 제품군을 공개하고 있습니다. 현재 제품 센터에는 세부 드라이브 모델명이 공개되지 않아 자동 확정에서 제외합니다.', ['96 V 저전압 서보 플랫폼', '고토크 밀도 모바일 로봇용'], ['96 V 모터 계열과 같은 전압 플랫폼'], ['정격/피크 전류, 엔코더, 실제 판매 모델 번호를 Kinco에 확인'], driveUrls.fd2x5))
  } else if (power !== undefined && power >= 200 && power <= 2000) {
    const profile = power <= 400
      ? ['FD125-AB/AU 또는 FD125-EB/EU', '200 - 400 W', '24 - 60 VDC', '연속 15 A · 피크 48 A']
      : power <= 1000
        ? ['FD135-AB/AU 또는 FD135-EB/EU', '750 - 1,000 W', '24 - 60 VDC', '연속 30 A · 피크 100 A']
        : ['FD145-AB/AU 또는 FD145-EB/EU', '1,000 - 2,000 W', '24 - 60 VDC', '연속 50 A · 피크 160 A']
    matches.push(match('spec-match', '공개 사양 일치', profile[0], 'FD1X5', '공식 FD1X5 저전압 서보 드라이브 출력·전원 범위에 들어오는 후보입니다.', [profile[1], profile[2], profile[3], 'CANopen·Modbus RTU 또는 EtherCAT 모델 선택'], [`${power.toLocaleString('ko-KR')} W 출력 범위 일치`, '24 - 60 VDC 전원 범위 일치'], ['통신 접미사, 모터 엔코더, 브레이크 전원은 주문 코드에서 최종 확인'], driveUrls.fd1x5))
  } else if (power !== undefined && power >= 50 && power <= 3000) {
    matches.push(match('attention', '사양 기반 후보', 'FD1X4S Series', 'FD1X4S', '공식 FD1X4S 저전압 서보 제품군은 50 W - 3 kW 범위를 공개합니다. 세부 출력·전류 모델 선택은 공식 매뉴얼에서 확정해야 합니다.', ['50 W - 3 kW', '24 - 60 VDC', 'Pulse · Modbus · CANopen · EtherCAT'], [`${power.toLocaleString('ko-KR')} W 출력 범위 후보`], ['세부 모델의 연속/피크 전류와 엔코더, 브레이크 옵션 확인 필요'], driveUrls.fd1x4s))
  } else {
    matches.push(match('attention', '추가 확인', 'FD1X5 / FD1X4S Series', 'Low Voltage Servo Drive', '모터 공개 출력 사양이 없거나 표준 드라이브 범위를 벗어나 정확한 드라이브 모델을 자동 확정할 수 없습니다.', ['24 - 60 VDC 저전압 서보 드라이브 제품군'], ['저전압 DC 서보 카테고리'], ['정격/피크 전류, 엔코더, 모터 권선 및 실제 전원 확인 필요'], driveUrls.fd1x5))
  }

  return {
    requirement: 'external',
    badge: '외부 저전압 드라이브 필요',
    heading: '저전압 DC 서보 드라이브를 함께 선정하세요.',
    description: 'FD1X5는 공개된 24 - 60 VDC 및 200 - 2,000 W 범위에서 자동 후보를 제시합니다.',
    matches,
    checks: [...baseChecks(product), '드라이브 연속·피크 전류', '엔코더 및 브레이크 전원', '통신 접미사(AB/AU/EB/EU 등)'],
  }
}

function framelessCompatibility(product: MotorProduct): DriveCompatibility {
  const power = maxRatedPower(product)
  const matches: DriveMatch[] = []
  if (hasVoltage(product, '48') && power !== undefined && power >= 200 && power <= 2000) {
    matches.push(match('attention', '사양 기반 후보', 'FD1X5 Series', 'FD1X5', '48 V 프레임리스 모터의 공개 전압·출력이 FD1X5 범위와 겹칩니다. 단, Kinco가 해당 FMK 모델의 전용 드라이브 조합을 공개한 것은 아니므로 최종 확정 후보가 아닙니다.', ['24 - 60 VDC', '200 - 2,000 W', 'CANopen·Modbus RTU 또는 EtherCAT'], ['48 V 전원 범위', `${power.toLocaleString('ko-KR')} W 공개 출력 범위`], ['권선 상수, 엔코더 피드백, 연속/피크 전류, 열 조건을 Kinco에 확인'], driveUrls.fd1x5))
  } else {
    matches.push(match('attention', '추가 확인', '저전압 서보 드라이브', 'FD1X5 / FD1X4S', '프레임리스 토크 모터는 권선·엔코더·방열 구조에 따라 드라이브 조합이 달라집니다. 공개 사양만으로는 주문 가능한 확정 조합을 제시할 수 없습니다.', ['24 - 60 VDC 저전압 서보 드라이브 제품군'], ['프레임리스 모터용 외부 드라이브 필요'], ['모터 권선 파라미터, 엔코더, 절연, 기계 조립 및 열 설계 확인 필요'], driveUrls.fd1x4s))
  }
  return {
    requirement: 'external',
    badge: '외부 로봇 드라이브 필요',
    heading: '프레임리스 모터는 전용 구동 조합 확인이 필요합니다.',
    description: '프레임리스 모터는 기계·열·피드백 구성이 시스템 설계에 포함되므로, 공개 전압·출력만으로 공식 호환을 단정하지 않습니다.',
    matches,
    checks: [...baseChecks(product), '권선 상수·역기전력·상 저항/인덕턴스', '엔코더 피드백·커넥터', '방열 구조와 연속/피크 토크'],
  }
}

function stepperCompatibility(product: MotorProduct): DriveCompatibility {
  const current = product.specs.ratedCurrent
  const phase = product.specs.phase ?? ''
  const flange = product.specs.flange
  const matches: DriveMatch[] = []
  const isTwoPhase = phase.includes('2')
  const isThreePhase = phase.includes('3')

  if (current !== undefined && isTwoPhase && (flange ?? 0) <= 86 && current <= 6) {
    matches.push(match('spec-match', '공개 사양 일치', 'FM560-EA-000', 'FM', 'FM560은 42/57/86 프레임의 2상 하이브리드 스테퍼용 EtherCAT 드라이버입니다.', ['24 - 50 VDC', '출력 0.1 - 6 A', 'EtherCAT · Pulse · I/O'], [`2상 ${flange ?? '공개'} mm 플랜지`, `${current.toLocaleString('ko-KR')} A 정격 전류 범위`], ['전원 전압과 실제 상전류 설정을 모터 데이터시트로 최종 확인'], driveUrls.fm))
  }
  if (current !== undefined && isTwoPhase && (flange ?? 0) <= 86 && current <= 8) {
    matches.push(match('spec-match', '공개 사양 일치', 'FM860-LA-000 / FM860-AA-000', 'FM', 'FM860은 42/57/86 프레임의 2상 스테퍼에 대응하며 Modbus 또는 CANopen 모델을 제공합니다.', ['24 - 70 VDC', '피크 0.15 - 8 A', 'Modbus 또는 CANopen · Pulse · I/O'], [`2상 ${flange ?? '공개'} mm 플랜지`, `${current.toLocaleString('ko-KR')} A 정격 전류 범위`], ['필요 통신 방식에 따라 LA/AA 모델을 선택하고 전류 설정을 확인'], driveUrls.fm))
  }
  if (current !== undefined && current <= 8 && ((isTwoPhase && (flange ?? 0) <= 86) || isThreePhase)) {
    const model = isThreePhase ? '3CM880' : (flange ?? 0) <= 57 && current <= 2 ? '2CM525' : (flange ?? 0) <= 57 && current <= 4.5 ? '2CM545' : (flange ?? 0) <= 57 ? '2CM560' : current <= 6 ? '2CM860' : '2CM880'
    matches.push(match('spec-match', '공개 사양 일치', model, 'CM', 'CM은 2상·3상 하이브리드 스테퍼에 대응하는 표준 펄스 드라이버 제품군입니다.', ['2상/3상 하이브리드 대응', '상전류 최대 8 A', '모델별 12 - 70 VDC 또는 24 - 70 VDC'], [`${phase || '공개'} 모터 상수`, `${current.toLocaleString('ko-KR')} A 정격 전류 범위`], ['드라이버의 실제 전류 설정값과 전원 범위는 선택한 CM 모델 데이터시트로 확인'], driveUrls.cm))
  }
  if (!matches.length) {
    matches.push(match('attention', '추가 확인', 'FM / CM Series', 'Stepper Drive', '스테퍼 모터의 상수·플랜지 또는 정격 전류가 공개되지 않아 드라이버 모델을 자동 확정할 수 없습니다.', ['FM: 필드버스 스테퍼 드라이버', 'CM: 최대 8 A 2상/3상 스테퍼 드라이버'], ['Kinco 스테퍼 드라이버 제품군'], ['상수, 정격 전류, 전원, 필요한 통신 방식을 확인한 뒤 모델 선택'], driveUrls.cm))
  }

  return {
    requirement: 'external',
    badge: '외부 스테퍼 드라이브 필요',
    heading: '상수·전류·통신에 맞는 스테퍼 드라이버를 고르세요.',
    description: 'FM은 EtherCAT/Modbus/CANopen 필드버스형, CM은 표준 펄스 드라이버 후보를 제공합니다.',
    matches: matches.slice(0, 2),
    checks: [...baseChecks(product), '상수(2상/3상)', '드라이버 상전류 설정', '시스템 전원 및 통신 방식'],
  }
}

/**
 * 브레이크는 모터가 아니므로 드라이브를 선정하지 않는다.
 * 대신 적용 축·전원·장착 확인 항목을 안내한다.
 */
function brakeApplicationGuidance(product: MotorProduct): DriveCompatibility {
  const torque = product.specs.staticFrictionTorqueText
    ?? (product.specs.staticFrictionTorque !== undefined ? `${product.specs.staticFrictionTorque} Nm` : '공식 사양 확인')
  return {
    requirement: 'external',
    badge: '브레이크 · 드라이브 선정 대상 아님',
    heading: '적용 축과 제동 조건을 확인하세요.',
    description: `${product.model}은(는) 모터가 아니라 축에 장착하는 무여자 작동형 브레이크입니다. 드라이브가 아니라 브레이크 전원과 장착 축을 기준으로 선정합니다.`,
    matches: [],
    checks: [
      `정지 마찰 토크 ${torque}가 적용 축의 필요 유지 토크(안전율 포함) 이상인지 확인`,
      product.specs.boreRangeText
        ? `장착 축 지름이 표준 축공 ${product.specs.boreRangeText} 범위에 드는지 확인`
        : '장착 축 지름이 표준 축공 범위에 드는지 공식 자료에서 확인',
      product.specs.ratedVoltage
        ? `브레이크 전원 ${product.specs.ratedVoltage}와 개방·투입 회로(서지 보호 포함) 확인`
        : '브레이크 코일 전원 사양과 개방·투입 회로를 공식 자료에서 확인',
      product.specs.maxSpeedText
        ? `사용 회전속도가 최고 회전속도 ${product.specs.maxSpeedText} 이하인지 확인`
        : '사용 회전속도가 최고 회전속도 이하인지 확인',
      '허브 방식과 장착 방향을 공식 도면에서 확인',
    ],
  }
}

export function driveCompatibilityFor(product: MotorProduct): DriveCompatibility {
  if (product.categoryId === 'brake') return brakeApplicationGuidance(product)
  if (product.brand !== 'Kinco') return manufacturerDriveCompatibility(product)
  if (product.categoryId === 'integrated' || product.categoryId === 'robot-module') return integratedCompatibility(product)
  if (product.categoryId === 'ac-servo') return acServoCompatibility(product)
  if (product.categoryId === 'dc-servo') return lowVoltageServoCompatibility(product)
  if (product.categoryId === 'stepper') return stepperCompatibility(product)
  return framelessCompatibility(product)
}
