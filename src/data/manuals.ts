import type { MotorProduct } from '../types'

export type ManualDocumentKind = 'user-manual' | 'selection-guide'

export interface ManualPdf {
  title: string
  kind: ManualDocumentKind
  url: string
  refererUrl: string
  updatedOn: string
  fileSize: string
  fileExtension?: 'pdf' | 'zip'
}

// Kinco's current product-download API returns these direct PDF URLs. The
// product page remains a separate action so this map never opens a webpage
// that only contains a download list.
export const manualPdfBySeries: Record<string, ManualPdf> = {
  iSMD: {
    title: 'iSMD Integrated Servo Drive Motor Manual',
    kind: 'user-manual',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_usermanual/EN_i-Kinco/iSMD%20low-voltage%20servo%20integrated%20motor%20user%20Manual%2020260303.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/robot/ismd-2',
    updatedOn: '2026-03-19',
    fileSize: '7.858 MB',
  },
  iSMK: {
    title: 'iSMK Integrated Servo Drive Motor Manual',
    kind: 'user-manual',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_usermanual/EN_i-Kinco/Kinco%20iSMK%20integrated%20servo%20user%20manual%20%EF%BC%88IO%20upgrade%20version%EF%BC%8920260707.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/robot/ismk-2',
    updatedOn: '2026-07-07',
    fileSize: '7.318 MB',
  },
  MD: {
    title: 'MD Integrated Servo Drive Motor Manual',
    kind: 'user-manual',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_usermanual/EN_i-Kinco/MD%20user%20manual%2020240924.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/robot/md-2',
    updatedOn: '2026-03-19',
    fileSize: '4.705 MB',
  },
  iGMK: {
    title: 'iGMK Integrated Servo Reducer Motor Manual',
    kind: 'user-manual',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_usermanual/EN_i-Kinco/Kinco%20iGMK%20integrated%20servo%20user%20manual%2020260511.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/robot/igmk-2',
    updatedOn: '2026-05-11',
    fileSize: '6.876 MB',
  },
  iFMH: {
    title: 'iFMH Series Joint Module User Manual',
    kind: 'user-manual',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_usermanual/EN_i-Kinco/iFMH%20series%20joint%20module%20user%20manual%2020260603.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/robot/273',
    updatedOn: '2026-06-03',
    fileSize: '공식 PDF',
  },
  iSWV: {
    title: 'iSWV Vertical Integrated Steering Wheel Module Manual',
    kind: 'user-manual',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_usermanual/EN_i-Kinco/iSWV%20vertical%20steering%20wheel%20user%20manual%2020250318.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/robot/iswv',
    updatedOn: '2025-03-18',
    fileSize: '공식 PDF',
  },
  iWMC: {
    title: 'iWMC Integrated Servo Wheel Manual',
    kind: 'user-manual',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_usermanual/EN_i-Kinco/iWMC%20integrated%20servo%20wheel%20user%20manual20260123.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/robot/iwmc',
    updatedOn: '2026-03-23',
    fileSize: '6.593 MB',
  },
  FMK: {
    title: 'FMK Frameless Torque Motor Selection Manual',
    kind: 'selection-guide',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_catalog/EN_Motor/FMK%20Series%20Frameless%20Torque%20Motor-K4E52-202606.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/robot/fmk',
    updatedOn: '2026-06-11',
    fileSize: '1.214 MB',
  },
  FMC: {
    title: 'FMC Frameless Torque Motor Selection Manual',
    kind: 'selection-guide',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_catalog/EN_Motor/FMC%20Series%20Frameless%20Torque%20Motor-K4E54-202605.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/robot/fmc',
    updatedOn: '2026-05-01',
    fileSize: '공식 PDF',
  },
  SMK: {
    title: 'FD6P & SMK Selection Manual',
    kind: 'selection-guide',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_catalog/EN_AC_drive/FD6P%20%26%20SMK%20Selection%20Manual-KIE22-20260529.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/automation/smk',
    updatedOn: '2026-05-29',
    fileSize: '7.76 MB',
  },
  '2S': {
    title: 'Stepping System Selection Manual',
    kind: 'selection-guide',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_catalog/EN_Stepper/KincoCatalog_Stepper_K1E07_20210125.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/automation/stepper',
    updatedOn: '2026-03-17',
    fileSize: '12.492 MB',
  },
  '3S': {
    title: 'Stepping System Selection Manual',
    kind: 'selection-guide',
    url: 'https://cdownload.kinco.cn/ENDownload/EN_MC_new/EN_catalog/EN_Stepper/KincoCatalog_Stepper_K1E07_20210125.pdf',
    refererUrl: 'https://www.kincoautomation.com/product/automation/stepper',
    updatedOn: '2026-03-17',
    fileSize: '12.492 MB',
  },
  'Ezi-SERVO II BT': {
    title: 'Ezi-SERVO II BT Korean User Manual',
    kind: 'user-manual',
    url: 'https://fastech-motions.com/new/board/bbs/download.php?bo_table=sub0302&wr_id=184&no=0',
    refererUrl: 'https://fastech-motions.com/new/kor/sub0102-0501.php',
    updatedOn: '2026-07-20',
    fileSize: '3.88 MB',
  },
  'Ezi-SERVO ALL': {
    title: 'Ezi-SERVO ALL Korean User Manual Archive',
    kind: 'user-manual',
    url: 'https://fastech-motions.com/new/board/bbs/download.php?bo_table=sub0302&wr_id=512&no=0',
    refererUrl: 'https://fastech-motions.com/new/kor/sub0102-0601.php',
    updatedOn: '2026-07-20',
    fileSize: '15.9 MB',
    fileExtension: 'zip',
  },
  'Ezi-SERVO II EtherCAT ALL': {
    title: 'Ezi-SERVO II EtherCAT ALL Korean User Manual',
    kind: 'user-manual',
    url: 'https://fastech-motions.com/new/board/bbs/download.php?bo_table=sub0302&wr_id=1071&no=0',
    refererUrl: 'https://fastech-motions.com/new/kor/sub0102-1101.php',
    updatedOn: '2026-07-20',
    fileSize: '5.66 MB',
  },
  'Ezi-STEP BT': {
    title: 'Ezi-STEP BT Korean User Manual',
    kind: 'user-manual',
    url: 'https://fastech-motions.com/new/board/bbs/download.php?bo_table=sub0302&wr_id=174&no=0',
    refererUrl: 'https://fastech-motions.com/new/kor/sub0105-0501.php',
    updatedOn: '2026-07-20',
    fileSize: '5.30 MB',
  },
  'Ezi-STEP ALL': {
    title: 'Ezi-STEP ALL Korean User Manual Archive',
    kind: 'user-manual',
    url: 'https://fastech-motions.com/new/board/bbs/download.php?bo_table=sub0302&wr_id=515&no=0',
    refererUrl: 'https://fastech-motions.com/new/kor/sub0105-0601.php',
    updatedOn: '2026-07-20',
    fileSize: '6.36 MB',
    fileExtension: 'zip',
  },
}

export function manualPdfFor(product: MotorProduct) {
  return manualPdfBySeries[product.series]
}

export function manualKindLabel(kind: ManualDocumentKind) {
  return kind === 'user-manual' ? '사용자 매뉴얼' : '선정 매뉴얼'
}

export function manualFileLabel(manual: ManualPdf) {
  return manual.fileExtension === 'zip' ? '매뉴얼 ZIP' : '매뉴얼 PDF'
}
