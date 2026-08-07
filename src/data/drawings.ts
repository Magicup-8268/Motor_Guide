import type { MotorProduct } from '../types'

export interface DrawingArchive {
  id: string
  title: string
  url: string
  refererUrl: string
  updatedOn: string
  fileSize: string
  kind?: 'zip' | 'page'
  modelPrefixes?: string[]
}

// Official Kinco product-download records, queried from the Drawing category
// on 2026-07-14 (KST). Some product pages expose more than one ZIP because
// their IP rating or mechanical configuration differs.
export const drawingArchivesBySeries: Record<string, DrawingArchive[]> = {
  'Ezi-SERVO II BT': [
    { id: 'fastech-ezi-servo-ii-bt-spec', title: 'Ezi-SERVO II BT 공식 모터 사양·도면', url: 'https://fastech-motions.com/new/board/bbs/board.php?bo_table=sub010205_motor', refererUrl: 'https://fastech-motions.com/new/kor/sub0102-0501.php', updatedOn: '2026-07-20', fileSize: '공식 사양·도면 페이지', kind: 'page' },
  ],
  'Ezi-SERVO ALL': [
    { id: 'fastech-ezi-servo-all-spec', title: 'Ezi-SERVO ALL 공식 모터 사양·도면', url: 'https://fastech-motions.com/new/board/bbs/board.php?bo_table=sub010206_motor', refererUrl: 'https://fastech-motions.com/new/kor/sub0102-0601.php', updatedOn: '2026-07-20', fileSize: '공식 사양·도면 페이지', kind: 'page' },
  ],
  'Ezi-SERVO II EtherCAT ALL': [
    { id: 'fastech-ezi-servo-ethercat-all-spec', title: 'Ezi-SERVO II EtherCAT ALL 공식 모터 사양·도면', url: 'https://fastech-motions.com/new/board/bbs/board.php?bo_table=sub010211_motor', refererUrl: 'https://fastech-motions.com/new/kor/sub0102-1101.php', updatedOn: '2026-07-20', fileSize: '공식 사양·도면 페이지', kind: 'page' },
  ],
  'Ezi-STEP BT': [
    { id: 'fastech-ezi-step-bt-spec', title: 'Ezi-STEP BT 공식 모터 사양·도면', url: 'https://fastech-motions.com/new/board/bbs/board.php?bo_table=sub010505_motor', refererUrl: 'https://fastech-motions.com/new/kor/sub0105-0501.php', updatedOn: '2026-07-20', fileSize: '공식 사양·도면 페이지', kind: 'page' },
  ],
  'Ezi-STEP ALL': [
    { id: 'fastech-ezi-step-all-spec', title: 'Ezi-STEP ALL 공식 모터 사양·도면', url: 'https://fastech-motions.com/new/board/bbs/board.php?bo_table=sub010506_motor', refererUrl: 'https://fastech-motions.com/new/kor/sub0105-0601.php', updatedOn: '2026-07-20', fileSize: '공식 사양·도면 페이지', kind: 'page' },
  ],
  iSMD: [
    { id: 'ismd60-ip20', title: 'iSMD60D (IP20) Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iSMD60D_IP20.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/ismd-2', updatedOn: '2026-01-30', fileSize: '공식 ZIP' },
    { id: 'ismd80-ip20', title: 'iSMD80D (IP20) Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iSMD80D_IP20.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/ismd-2', updatedOn: '2026-01-30', fileSize: '공식 ZIP' },
    { id: 'ismd60-ip65', title: 'iSMD60D (IP65) Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iSMD60D_IP65.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/ismd-2', updatedOn: '2026-01-30', fileSize: '공식 ZIP' },
  ],
  iSMK: [
    { id: 'ismk', title: 'iSMK Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iSMK_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/ismk-2', updatedOn: '2025-12-29', fileSize: '공식 ZIP' },
  ],
  MD: [
    { id: 'md', title: 'MD Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/MD_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/md-2', updatedOn: '2026-01-30', fileSize: '공식 ZIP' },
  ],
  iGMK: [
    { id: 'igmk', title: 'iGMK Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iGMK_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/igmk-2', updatedOn: '2026-01-30', fileSize: '공식 ZIP' },
  ],
  iFMH: [
    { id: 'ifmh', title: 'iFMH Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iFMH_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/273', updatedOn: '2026-06-11', fileSize: '17.47 MB' },
  ],
  iWMC: [
    { id: 'iwmc-models', title: 'iWMC05606 · iWMC05710 Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iWMC05606%26iWMC05710_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/iwmc', updatedOn: '2026-01-29', fileSize: '27.995 MB' },
    { id: 'iwmc-common-body', title: 'iWMC Common Body Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iWMC_Common-body_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/iwmc', updatedOn: '2026-01-29', fileSize: '20.517 MB' },
    { id: 'iwmc-sto', title: 'iWMC STO Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iWMC_STO_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/iwmc', updatedOn: '2026-03-05', fileSize: '8.807 MB' },
  ],
  FMK: [
    { id: 'fmk', title: 'FMK Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/Frameless/FMK_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/fmk', updatedOn: '2026-01-09', fileSize: '공식 ZIP' },
  ],
  FMC: [
    { id: 'fmc', title: 'FMC Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/Frameless/FMC_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/robot/fmc', updatedOn: '2026-01-09', fileSize: '공식 ZIP' },
  ],
  iSML: [
    { id: 'isml', title: 'iSML Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/i-Kinco/iSML_drawings.zip', refererUrl: 'https://www.kinco.cn/product/214', updatedOn: '2026-01-12', fileSize: '공식 ZIP' },
  ],
  SMK: [
    { id: 'smk-ac-40-60-80', title: 'SMK40S · 60S · 80S AC220V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMK40S%2660S%2680S_AC220V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smk', updatedOn: '2026-01-14', fileSize: '59.657 MB', modelPrefixes: ['SMK40S', 'SMK60S', 'SMK80S'] },
    { id: 'smk-ac-60d-80d', title: 'SMK60D · 80D AC220V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMK60D%2680D_AC220V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smk', updatedOn: '2026-01-14', fileSize: '53.036 MB', modelPrefixes: ['SMK60D', 'SMK80D'] },
    { id: 'smk-ac-130g', title: 'SMK130G AC220V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMK130G_AC220V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smk', updatedOn: '2026-01-14', fileSize: '46.11 MB', modelPrefixes: ['SMK130G'] },
    { id: 'smk-ac-180g', title: 'SMK180G AC380V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMK180G_AC380V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smk', updatedOn: '2026-01-14', fileSize: '45.769 MB', modelPrefixes: ['SMK180G'] },
  ],
  SMH: [
    { id: 'smh-ac-60s', title: 'SMH60S AC220V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMH60S_AC220V.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smh', updatedOn: '2026-01-23', fileSize: '5.927 MB', modelPrefixes: ['SMH60S'] },
    { id: 'smh-ac-80s', title: 'SMH80S AC220V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMH80S_AC220V.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smh', updatedOn: '2026-01-23', fileSize: '6.733 MB', modelPrefixes: ['SMH80S'] },
    { id: 'smh-ac-110d', title: 'SMH110D AC220V · AC380V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMH110D_AC220V%26AC380V.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smh', updatedOn: '2026-01-23', fileSize: '7.529 MB', modelPrefixes: ['SMH110D'] },
    { id: 'smh-ac-130d', title: 'SMH130D AC380V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMH130D_AC380V.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smh', updatedOn: '2026-01-23', fileSize: '10.165 MB', modelPrefixes: ['SMH130D'] },
    { id: 'smh-ac-150d', title: 'SMH150D AC380V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMH150D_AC380V.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smh', updatedOn: '2026-01-23', fileSize: '5.421 MB', modelPrefixes: ['SMH150D'] },
    { id: 'smh-ac-180d', title: 'SMH180D AC380V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMH180D_AC380V.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smh', updatedOn: '2026-01-23', fileSize: '8.485 MB', modelPrefixes: ['SMH180D'] },
  ],
  SMC: [
    { id: 'smc-ac-40s', title: 'SMC40S AC220V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMC40S_AC220V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smc', updatedOn: '2026-01-29', fileSize: '4.757 MB', modelPrefixes: ['SMC40S'] },
    { id: 'smc-ac-60s', title: 'SMC60S AC220V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMC60S_AC220V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smc', updatedOn: '2026-01-29', fileSize: '24.385 MB', modelPrefixes: ['SMC60S'] },
    { id: 'smc-ac-80s', title: 'SMC80S AC220V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMC80S_AC220V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smc', updatedOn: '2026-01-29', fileSize: '10.525 MB', modelPrefixes: ['SMC80S'] },
    { id: 'smc-ac-130d', title: 'SMC130D AC220V · AC380V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/AC_motor/SMC130D_AC220V%26AC380V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smc', updatedOn: '2026-01-29', fileSize: '63.302 MB', modelPrefixes: ['SMC130D'] },
  ],
  'SMC DC 48': [
    { id: 'smc-dc-40s', title: 'SMC40S DC48V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/DC_motor/SMC40S_DC48V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smc-48v', updatedOn: '2026-01-19', fileSize: '5.234 MB', modelPrefixes: ['SMC40S'] },
    { id: 'smc-dc-60s', title: 'SMC60S DC48V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/DC_motor/SMC60S_DC48V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smc-48v', updatedOn: '2026-01-19', fileSize: '20.766 MB', modelPrefixes: ['SMC60S'] },
    { id: 'smc-dc-80s', title: 'SMC80S DC48V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/DC_motor/SMC80S_DC48V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smc-48v', updatedOn: '2026-01-19', fileSize: '17.274 MB', modelPrefixes: ['SMC80S'] },
    { id: 'smc-dc-130d', title: 'SMC130D DC48V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/DC_motor/SMC130D_DC48V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smc-48v', updatedOn: '2026-01-19', fileSize: '17.632 MB', modelPrefixes: ['SMC130D'] },
  ],
  'SMK DC 48': [
    { id: 'smk-dc-40-60-80', title: 'SMK40S · 60S · 80S DC48V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/DC_motor/SMK40S%2660S%2680S_DC48V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smk-48v', updatedOn: '2026-01-15', fileSize: '53.725 MB', modelPrefixes: ['SMK40S', 'SMK60S', 'SMK80S'] },
    { id: 'smk-dc-60d-80d', title: 'SMK60D · 80D DC48V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/DC_motor/SMK60D%2680DC48V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smk-48v', updatedOn: '2026-01-15', fileSize: '58.543 MB', modelPrefixes: ['SMK60D', 'SMK80D'] },
  ],
  'SMK DC 96': [
    { id: 'smk-dc96-80d', title: 'SMK80D DC96V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/DC_motor/SMK80D_DC96V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smk-96v', updatedOn: '2026-02-05', fileSize: '11.268 MB', modelPrefixes: ['SMK80D'] },
    { id: 'smk-dc96-130g', title: 'SMK130G DC96V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/DC_motor/SMK130G_DC96V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smk-96v', updatedOn: '2026-01-16', fileSize: '5.288 MB', modelPrefixes: ['SMK130G'] },
    { id: 'smk-dc96-180g', title: 'SMK180G DC96V Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/DC_motor/SMK180G_DC96V_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/smk-96v', updatedOn: '2026-01-16', fileSize: '21.519 MB', modelPrefixes: ['SMK180G'] },
  ],
  '2S': [
    { id: 'stepper-2s', title: '2상 Stepper Motor Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/Stepper/Stepper-motor_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/stepper', updatedOn: '2026-01-08', fileSize: '공식 ZIP' },
  ],
  '3S': [
    { id: 'stepper-3s', title: '3상 Stepper Motor Drawing ZIP', url: 'https://cdownload.kinco.cn/Download/MC_new/drawings/Stepper/Stepper-motor_drawings.zip', refererUrl: 'https://www.kincoautomation.com/product/automation/stepper', updatedOn: '2026-01-08', fileSize: '공식 ZIP' },
  ],
}

export function drawingArchivesFor(product: MotorProduct) {
  return (drawingArchivesBySeries[product.series] ?? []).filter((archive) =>
    !archive.modelPrefixes || archive.modelPrefixes.some((prefix) => product.model.startsWith(prefix)),
  )
}
