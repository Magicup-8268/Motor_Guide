import type { BrandId, CategoryId, MotorProduct } from '../types'

export interface ProductImage {
  src: string
  alt: string
  /** Manufacturer public product/manual page used to verify the representative image. */
  sourceUrl: string
}

const officialSeriesImages: Record<string, ProductImage> = {
  FMK: { src: '/kinco-products/fmk.jpg', alt: 'Kinco FMK 프레임리스 토크 모터', sourceUrl: 'https://www.kincoautomation.com/product/robot/fmk' },
  FMC: { src: '/kinco-products/fmc.jpg', alt: 'Kinco FMC 프레임리스 토크 모터', sourceUrl: 'https://www.kincoautomation.com/product/robot/fmc' },
  iFMH: { src: '/kinco-products/ifmh.png', alt: 'Kinco iFMH 로봇 조인트 모듈', sourceUrl: 'https://www.kincoautomation.com/product/robot/273' },
  iGMK: { src: '/kinco-products/igmk.jpg', alt: 'Kinco iGMK 일체형 서보 모듈', sourceUrl: 'https://www.kincoautomation.com/product/robot/igmk-2' },
  iSMD: { src: '/kinco-products/ismd.jpg', alt: 'Kinco iSMD 일체형 서보 모듈', sourceUrl: 'https://www.kincoautomation.com/product/robot/ismd' },
  iSMK: { src: '/kinco-products/ismk.jpg', alt: 'Kinco iSMK 일체형 서보 모듈', sourceUrl: 'https://www.kincoautomation.com/product/robot/ismk-2' },
  MD: { src: '/kinco-products/md.jpg', alt: 'Kinco MD 일체형 서보 모터', sourceUrl: 'https://www.kincoautomation.com/product/robot/md-2' },
  iSWV: { src: 'https://www.kincoautomation.com/local_upload/20260603/2062046712018411520.png', alt: 'Kinco iSWV 수직형 옴니 스티어링 휠 모듈', sourceUrl: 'https://www.kincoautomation.com/product/robot/iswv' },
  iWMC: { src: '/kinco-products/iwmc.jpg', alt: 'Kinco iWMC 로봇 모듈', sourceUrl: 'https://www.kincoautomation.com/product/robot/iwmc' },
  SMC: { src: '/kinco-products/smc-ac.jpg', alt: 'Kinco SMC AC 서보 모터', sourceUrl: 'https://www.kincoautomation.com/product/automation/smc' },
  SMK: { src: '/kinco-products/smk-ac.jpg', alt: 'Kinco SMK AC 서보 모터', sourceUrl: 'https://www.kincoautomation.com/product/automation/smk' },
  SMH: { src: '/kinco-products/smh.jpg', alt: 'Kinco SMH AC 서보 모터', sourceUrl: 'https://www.kincoautomation.com/product/automation/smh' },
  'SMC DC 48': { src: '/kinco-products/smc-dc48.jpg', alt: 'Kinco SMC DC 48 V 서보 모터', sourceUrl: 'https://www.kincoautomation.com/product/automation/smc-48v' },
  'SMK DC 48': { src: '/kinco-products/smk-dc48.jpg', alt: 'Kinco SMK DC 48 V 서보 모터', sourceUrl: 'https://www.kincoautomation.com/product/automation/smk-48v' },
  'SMK DC 96': { src: '/kinco-products/smk-dc96.jpg', alt: 'Kinco SMK DC 96 V 서보 모터', sourceUrl: 'https://www.kincoautomation.com/product/automation/smk-96v' },
  '2S': { src: '/kinco-products/stepper.jpg', alt: 'Kinco 2상 스테퍼 모터', sourceUrl: 'https://www.kincoautomation.com/product/automation/stepper' },
  '3S': { src: '/kinco-products/stepper.jpg', alt: 'Kinco 3상 스테퍼 모터', sourceUrl: 'https://www.kincoautomation.com/product/automation/stepper' },
  'Ezi-SERVO II BT': { src: 'https://fastech-motions.com/new/img/ezi-servo2_bt2.png', alt: 'FASTECH Ezi-SERVO II BT 일체형 서보', sourceUrl: 'https://fastech-motions.com/new/kor/sub0102-0501.php' },
  'Ezi-SERVO ALL': { src: 'https://fastech-motions.com/new/img/ezi-servo_all2.png', alt: 'FASTECH Ezi-SERVO ALL 일체형 서보', sourceUrl: 'https://fastech-motions.com/new/kor/sub0102-0601.php' },
  'Ezi-SERVO II EtherCAT ALL': { src: 'https://fastech-motions.com/new/img/ezi-servo2_ethercat-all2.png', alt: 'FASTECH Ezi-SERVO II EtherCAT ALL 일체형 서보', sourceUrl: 'https://fastech-motions.com/new/kor/sub0102-1101.php' },
  'Ezi-STEP BT': { src: 'https://fastech-motions.com/new/img/ezi-step_bt2.png', alt: 'FASTECH Ezi-STEP BT 일체형 스테퍼', sourceUrl: 'https://fastech-motions.com/new/kor/sub0105-0501.php' },
  'Ezi-STEP ALL': { src: 'https://fastech-motions.com/new/img/ezi-step_all2.png', alt: 'FASTECH Ezi-STEP ALL 일체형 스테퍼', sourceUrl: 'https://fastech-motions.com/new/kor/sub0105-0601.php' },
  'DYNAMIXEL X330': { src: 'https://emanual.robotis.com/assets/images/dxl/x/x_series_product.png', alt: 'ROBOTIS DYNAMIXEL X-Series 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' },
  'DYNAMIXEL X430': { src: 'https://emanual.robotis.com/assets/images/dxl/x/x_series_product.png', alt: 'ROBOTIS DYNAMIXEL X-Series 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' },
  'DYNAMIXEL X540': { src: 'https://emanual.robotis.com/assets/images/dxl/x/x_series_product.png', alt: 'ROBOTIS DYNAMIXEL X-Series 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' },
  'DYNAMIXEL XW': { src: 'https://emanual.robotis.com/assets/images/dxl/x/x_series_product.png', alt: 'ROBOTIS DYNAMIXEL XW 방수형 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' },
  'DYNAMIXEL XD': { src: 'https://emanual.robotis.com/assets/images/dxl/x/x_series_product.png', alt: 'ROBOTIS DYNAMIXEL XD 듀얼 엔코더 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' },
  'DYNAMIXEL XH': { src: 'https://emanual.robotis.com/assets/images/dxl/x/x_series_product.png', alt: 'ROBOTIS DYNAMIXEL XH 알루미늄 케이스 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' },
  'DYNAMIXEL XM': { src: 'https://emanual.robotis.com/assets/images/dxl/x/x_series_product.png', alt: 'ROBOTIS DYNAMIXEL XM 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' },
  'DYNAMIXEL XC': { src: 'https://emanual.robotis.com/assets/images/dxl/x/x_series_product.png', alt: 'ROBOTIS DYNAMIXEL XC 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' },
  'DYNAMIXEL XL': { src: 'https://emanual.robotis.com/assets/images/dxl/x/x_series_product.png', alt: 'ROBOTIS DYNAMIXEL XL 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/x/' },
  'DYNAMIXEL YM070': { src: 'https://emanual.robotis.com/assets/images/dxl/y/y_series_product.png', alt: 'ROBOTIS DYNAMIXEL Y-Series 산업용 로봇 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/y/' },
  'DYNAMIXEL YM080': { src: 'https://emanual.robotis.com/assets/images/dxl/y/y_series_product.png', alt: 'ROBOTIS DYNAMIXEL Y-Series 산업용 로봇 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/y/' },
  'DYNAMIXEL PH54': { src: 'https://emanual.robotis.com/assets/images/dxl/p/pro-plus.png', alt: 'ROBOTIS DYNAMIXEL P-Series 고정밀 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/p/' },
  'DYNAMIXEL PH42': { src: 'https://emanual.robotis.com/assets/images/dxl/p/pro-plus.png', alt: 'ROBOTIS DYNAMIXEL P-Series 고정밀 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/p/' },
  'DYNAMIXEL PM54': { src: 'https://emanual.robotis.com/assets/images/dxl/p/pro-plus.png', alt: 'ROBOTIS DYNAMIXEL P-Series 고정밀 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/p/' },
  'DYNAMIXEL PM42': { src: 'https://emanual.robotis.com/assets/images/dxl/p/pro-plus.png', alt: 'ROBOTIS DYNAMIXEL P-Series 고정밀 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/p/' },
  'DYNAMIXEL MX': { src: 'https://emanual.robotis.com/assets/images/dxl/mx/mx-106t_product.jpg', alt: 'ROBOTIS DYNAMIXEL MX-Series 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/mx/' },
  'DYNAMIXEL AX': { src: 'https://emanual.robotis.com/assets/images/dxl/ax/ax-18a_product.png', alt: 'ROBOTIS DYNAMIXEL AX 레거시 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/ax/ax-18a/' },
  'DYNAMIXEL EX': { src: 'https://emanual.robotis.com/assets/images/dxl/ex/ex-106_product.png', alt: 'ROBOTIS DYNAMIXEL EX 레거시 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/ex/ex-106%2B/' },
  'DX-116': { src: 'https://emanual.robotis.com/assets/images/dxl/dx/dx-116_product.png', alt: 'ROBOTIS DYNAMIXEL DX-116 legacy smart actuator', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/dx/dx-116/' },
  'DX-117': { src: 'https://emanual.robotis.com/assets/images/dxl/dx/dx-117_product.png', alt: 'ROBOTIS DYNAMIXEL DX-117 legacy smart actuator', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/dx/dx-117/' },
  'DYNAMIXEL DX': { src: 'https://emanual.robotis.com/assets/images/dxl/dx/dx-113_product.png', alt: 'ROBOTIS DYNAMIXEL DX 레거시 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/dx/dx-113/' },
  'RX-10': { src: 'https://emanual.robotis.com/assets/images/dxl/rx/rx-10_product.png', alt: 'ROBOTIS DYNAMIXEL RX-10 legacy smart actuator', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/rx/rx-10/' },
  'RX-24F': { src: 'https://emanual.robotis.com/assets/images/dxl/rx/rx-24f_product.png', alt: 'ROBOTIS DYNAMIXEL RX-24F legacy smart actuator', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/rx/rx-24f/' },
  'RX-28': { src: 'https://emanual.robotis.com/assets/images/dxl/rx/rx-28_product.png', alt: 'ROBOTIS DYNAMIXEL RX-28 legacy smart actuator', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/rx/rx-28/' },
  'DYNAMIXEL RX': { src: 'https://emanual.robotis.com/assets/images/dxl/rx/rx-64_product.png', alt: 'ROBOTIS DYNAMIXEL RX 레거시 스마트 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/rx/rx-64/' },
  'DYNAMIXEL PRO H54': { src: 'https://emanual.robotis.com/assets/images/dxl/pro/h54-200-s500-r_product.jpg', alt: 'ROBOTIS DYNAMIXEL PRO H54 고토크 액추에이터', sourceUrl: 'https://emanual.robotis.com/docs/en/dxl/pro/h54-200-s500-r/' },
  'LS MECAPION E Type': { src: 'https://www.lsmecapion.com/data/file/pd_motor/1935305405_2x6YirpL_fccb06ebe6394d3a26fe7e90947f7dedb285b782.gif', alt: 'LS메카피온 E Type AC 서보모터', sourceUrl: 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=8' },
  'LS MECAPION F Type': { src: 'https://www.lsmecapion.com/data/file/pd_motor/1935305405_zVvHPM6T_80e77509d4dafb4c576dc4cef01fea595be10ee7.jpg', alt: 'LS메카피온 F Type AC 서보모터', sourceUrl: 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=5' },
  'LS MECAPION FL Type': { src: 'https://www.lsmecapion.com/data/file/pd_motor/1935305405_EWQPndge_abd607096ec3f5509e8151273ff0496bcab6218f.jpg', alt: 'LS메카피온 FL Type AC 서보모터', sourceUrl: 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=4' },
  'LS MECAPION Hollow & Spinner': { src: 'https://www.lsmecapion.com/data/file/pd_motor/1935305405_pz5ubjdr_424932490a219ae7209abea8b0c88d280013beea.gif', alt: 'LS메카피온 중공형 및 Spinner 서보모터', sourceUrl: 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=3' },
  'LS MECAPION Thin DD': { src: 'https://www.lsmecapion.com/data/file/pd_motor/1935305405_Hwui7C3E_12e12e97d39a04a44e5133914e292f42a3c765c9.gif', alt: 'LS메카피온 박형 DD 모터', sourceUrl: 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=7' },
  'LS MECAPION DD Motor': { src: 'https://www.lsmecapion.com/data/file/pd_motor/1935305405_dRX7NDWP_0a95f39a736671879b2e0fd8b668210fdec8c4f8.jpg', alt: 'LS메카피온 DD 모터', sourceUrl: 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=2' },
  'LS MECAPION PEGA': { src: 'https://www.lsmecapion.com/data/file/pd_motor/1935305405_WI1sjF7J_a3086704ddd7756ca39fafeee6b584457b010bf0.jpg', alt: 'LS메카피온 PEGA 일체형 서보', sourceUrl: 'https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor&wr_id=1' },
  KANZ: { src: 'http://komotek.com/wp-content/uploads/2018/03/KANZ.gif', alt: 'KOMOTEK KANZ AC 서보모터', sourceUrl: 'http://komotek.com/ko/products-servo-system/' },
  KANQ: { src: 'http://komotek.com/wp-content/uploads/2018/03/KANQ.gif', alt: 'KOMOTEK KANQ AC 서보모터', sourceUrl: 'http://komotek.com/ko/products-servo-system/' },
  KAND: { src: 'http://komotek.com/wp-content/uploads/2018/03/KAND.gif', alt: 'KOMOTEK KAND AC 서보모터', sourceUrl: 'http://komotek.com/ko/products-servo-system/' },
  KANS: { src: 'http://komotek.com/wp-content/uploads/2018/03/KANS.gif', alt: 'KOMOTEK KANS AC 서보모터', sourceUrl: 'http://komotek.com/ko/products-servo-system/' },
  KANH: { src: 'http://komotek.com/wp-content/uploads/2018/03/KANH.gif', alt: 'KOMOTEK KANH AC 서보모터', sourceUrl: 'http://komotek.com/ko/products-servo-system/' },
  KANF: { src: 'http://komotek.com/wp-content/uploads/2018/03/KANF.gif', alt: 'KOMOTEK KANF AC 서보모터', sourceUrl: 'http://komotek.com/ko/products-servo-system/' },
  KANK: { src: 'http://komotek.com/wp-content/uploads/2018/03/KANK.gif', alt: 'KOMOTEK KANK AC 서보모터', sourceUrl: 'http://komotek.com/ko/products-servo-system/' },
  KANL: { src: 'http://komotek.com/wp-content/uploads/2018/03/KANL.gif', alt: 'KOMOTEK KANL AC 서보모터', sourceUrl: 'http://komotek.com/ko/products-servo-system/' },
  'KAFZ 24 V Cylinder': { src: 'http://komotek.com/wp-content/uploads/2018/03/KAFZQ1.gif', alt: 'KOMOTEK KAFZ 24 V 저전압 서보', sourceUrl: 'http://komotek.com/ko/02products-servo-system-low-voltage-motor/' },
  'KAFQ 24 V Pancake': { src: 'http://komotek.com/wp-content/uploads/2018/03/KAFZQ2.gif', alt: 'KOMOTEK KAFQ 24 V 저전압 서보', sourceUrl: 'http://komotek.com/ko/02products-servo-system-low-voltage-motor/' },
  'KAFZ 48 V Cylinder': { src: 'http://komotek.com/wp-content/uploads/2018/03/KAFZQ1.gif', alt: 'KOMOTEK KAFZ 48 V 저전압 서보', sourceUrl: 'http://komotek.com/ko/02products-servo-system-low-voltage-motor/' },
  'KAFQ 48 V Pancake': { src: 'http://komotek.com/wp-content/uploads/2018/03/KAFZQ2.gif', alt: 'KOMOTEK KAFQ 48 V 저전압 서보', sourceUrl: 'http://komotek.com/ko/02products-servo-system-low-voltage-motor/' },
  'Special Servo Motor': { src: 'http://komotek.com/wp-content/uploads/2021/12/special-servo-motor-3-1.png', alt: 'KOMOTEK 특수 서보모터', sourceUrl: 'http://komotek.com/ko/02products-special-motors/' },
  'KOMOTEK Hollow Shaft Servo': { src: 'http://komotek.com/wp-content/uploads/2021/12/두산-frameless-motor.png', alt: 'KOMOTEK 중공축 서보모터', sourceUrl: 'http://komotek.com/ko/hollow-shaft-motor/' },
  BXR: { src: '/mikipulley-products/bxr.jpg', alt: '미키풀리 BXR 무여자 작동형 브레이크 (사각 허브·스플라인 허브)', sourceUrl: 'https://www.mikipulley-us.com/electromagnetic-brakes-e.m./spring-actuated-brakes/bxr-model-brake' },
  'BXR-LE': { src: '/mikipulley-products/bxr-le.jpg', alt: '미키풀리 BXR-LE 초박형 브레이크와 전용 컨트롤러', sourceUrl: 'https://www.mikipulley-us.com/electromagnetic-brakes-e.m./spring-actuated-brakes/bxr-le-model-brake' },
}

/**
 * public/ 자산은 배포 base 경로 아래에 놓인다. GitHub Pages처럼 하위 경로(/Motor_Guide/)에
 * 배포하면 '/kinco-products/...' 같은 루트 절대경로는 도메인 루트를 가리켜 404가 된다.
 * 제조사 원격 이미지(http/https, 프로토콜 상대, data:)는 그대로 두고 로컬 경로만 base에 붙인다.
 */
function withBasePath(src: string) {
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(src) || src.startsWith('data:')) return src
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/+$/, '')}/${src.replace(/^\/+/, '')}`
}

function withResolvedSrc(image: ProductImage | undefined) {
  return image ? { ...image, src: withBasePath(image.src) } : undefined
}

export function productImageFor(product: MotorProduct) {
  return withResolvedSrc(officialSeriesImages[product.model] ?? officialSeriesImages[product.series])
}

const categoryRepresentativeSeries: { [brand in BrandId]?: { [category in CategoryId]?: string } } = {
  kinco: {
    frameless: 'FMK', integrated: 'iSMD', 'robot-module': 'iWMC', 'ac-servo': 'SMK', 'dc-servo': 'SMK DC 48', stepper: '2S',
  },
  robotis: {
    frameless: 'DYNAMIXEL PH54',
    integrated: 'DYNAMIXEL X430',
    'robot-module': 'DYNAMIXEL YM080',
  },
  'ls-mecapion': {
    frameless: 'LS MECAPION Thin DD', integrated: 'LS MECAPION PEGA', 'robot-module': 'LS MECAPION Hollow & Spinner', 'ac-servo': 'LS MECAPION E Type',
  },
  komotek: {
    'robot-module': 'KOMOTEK Hollow Shaft Servo', 'ac-servo': 'KANZ', 'dc-servo': 'KAFZ 48 V Cylinder',
  },
  fastech: {
    integrated: 'Ezi-SERVO II EtherCAT ALL',
  },
  mikipulley: {
    brake: 'BXR',
  },
}

export function categoryProductImageFor(categoryId: CategoryId, brand: BrandId = 'kinco') {
  const representative = categoryRepresentativeSeries[brand]?.[categoryId]
  return withResolvedSrc(representative ? officialSeriesImages[representative] : undefined)
}
