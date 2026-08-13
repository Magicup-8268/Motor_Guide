import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createServer } from 'vite'

const catalogPath = new URL('../src/data/kincoCatalog.ts', import.meta.url)
const externalCatalogPath = new URL('../src/data/externalCatalog.ts', import.meta.url)
const appPath = new URL('../src/App.tsx', import.meta.url)
const manualsPath = new URL('../src/data/manuals.ts', import.meta.url)
const drawingsPath = new URL('../src/data/drawings.ts', import.meta.url)
const drivesPath = new URL('../src/data/drives.ts', import.meta.url)
const productImagesPath = new URL('../src/data/productImages.ts', import.meta.url)
const viteConfigPath = new URL('../vite.config.ts', import.meta.url)
const indexPath = new URL('../index.html', import.meta.url)
const manifestPath = new URL('../public/manifest.webmanifest', import.meta.url)
const mainPath = new URL('../src/main.tsx', import.meta.url)
const serviceWorkerPath = new URL('../public/sw.js', import.meta.url)
const mobileLauncherPath = new URL('../휴대폰용_실행.cmd', import.meta.url)
const modelSpecPdfGeneratorPath = new URL('../scripts/generate_model_spec_pdf.py', import.meta.url)
const selectionReportPdfGeneratorPath = new URL('../scripts/generate_selection_report_pdf.py', import.meta.url)
const selectionFiltersPath = new URL('../src/utils/selectionFilters.ts', import.meta.url)
const fastechVariantsPath = new URL('../src/data/fastechVariants.ts', import.meta.url)

test('Magicup logo and title brand the application shell', async () => {
  const [app, index, manifest, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(indexPath, 'utf8'),
    readFile(manifestPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /className="brand-logo" src="\/magicup-logo\.svg"/)
  assert.match(app, /Magicup-Work-Flow/)
  assert.doesNotMatch(app, /KINCO MOTOR GUIDE/)
  assert.match(index, /<title>Magicup-Work-Flow \| Kinco Motor Guide<\/title>/)
  assert.match(manifest, /"short_name": "Magicup-Work-Flow"/)
  assert.match(styles, /\.brand \{ position: relative;/)
  assert.match(styles, /\.topbar \{[^}]*justify-content: space-between/)
  assert.match(styles, /\.brand strong \{[^}]*font-size: 28px/)
  assert.match(styles, /\.brand-logo \{ width: 124px; height: 64px/)
})

test('application uses the locally bundled Pretendard variable webfont', async () => {
  const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8')

  assert.match(styles, /PretendardVariable\.woff2/)
  assert.match(styles, /font-family: 'Pretendard Variable'/)
  assert.match(styles, /font-weight: 100 900/)
  assert.doesNotMatch(styles, /NanumGothic/)
})

test('application supports home-screen installation and caches its same-origin app shell', async () => {
  const [app, main, index, manifest, serviceWorker, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(mainPath, 'utf8'),
    readFile(indexPath, 'utf8'),
    readFile(manifestPath, 'utf8'),
    readFile(serviceWorkerPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(main, /navigator\.serviceWorker\.register\(`\$\{import\.meta\.env\.BASE_URL\}sw\.js`\)/)
  assert.match(main, /import\.meta\.env\.PROD/)
  assert.match(main, /navigator\.serviceWorker\.getRegistrations\(\)/)
  assert.match(index, /apple-mobile-web-app-capable/)
  assert.match(manifest, /"id": "\."/)
  assert.match(manifest, /"start_url": "\.\/\?source=pwa"/)
  assert.match(manifest, /"display": "standalone"/)
  assert.match(manifest, /"src": "motor-atlas-mark\.svg"/)
  assert.match(serviceWorker, /magicup-work-flow-shell-v4/)
  assert.match(serviceWorker, /cacheFirstAsset/)
  assert.match(serviceWorker, /networkFirstNavigation/)
  assert.match(serviceWorker, /pathname\.startsWith\('\/api\/'\)/)
  assert.match(serviceWorker, /isDevelopmentAsset/)
  assert.match(app, /beforeinstallprompt/)
  assert.match(app, /className="install-button"/)
  assert.match(app, /window\.isSecureContext/)
  assert.match(app, /Safari 공유 버튼 → 홈 화면에 추가/)
  assert.match(app, /Chrome 메뉴\(⋮\) → 홈 화면에 추가/)
  assert.match(styles, /\.install-button \{/)
  assert.match(styles, /\.top-actions\.has-install \.shortcut-button/)
})

test('mobile LAN launcher starts the app on the stable phone port', async () => {
  const launcher = await readFile(mobileLauncherPath, 'utf8')

  assert.match(launcher, /npm run dev:lan -- --strictPort/)
  // The phone address is looked up at run time (Wi-Fi IPv4 changes with DHCP)
  // instead of a hard-coded IP that goes stale after a lease renewal.
  assert.match(launcher, /Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi'/)
  assert.match(launcher, /http:\/\/%WIFI_IP%:5173/)
  assert.match(launcher, /Get-NetTCPConnection -LocalPort 5173/)
})

test('model cards use locally cached official Kinco product thumbnails with a graceful fallback', async () => {
  const [app, productImages, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(productImagesPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /function ProductThumbnail/)
  assert.match(app, /function CategoryThumbnail/)
  assert.match(app, /<CategoryThumbnail categoryId=\{category\.id\} categoryName=\{category\.name\}/)
  assert.match(app, /loading="lazy" decoding="async"/)
  assert.match(app, /onError=\{\(\) => setImageAvailable\(false\)\}/)
  assert.match(productImages, /kinco-products\/ismd\.jpg/)
  assert.match(productImages, /kinco-products\/stepper\.jpg/)
  assert.match(productImages, /product\/automation\/smk-96v/)
  assert.match(productImages, /const categoryRepresentativeSeries/)
  assert.match(productImages, /'robot-module': 'iWMC'/)
  assert.match(styles, /\.product-thumbnail \{ grid-area: thumbnail;/)
  assert.match(styles, /\.product-thumbnail\.is-placeholder/)
  assert.match(styles, /\.category-card-thumbnail \{ justify-self: end;/)
})

test('Kinco iSWV robot-module card uses the official product image and registered manual', async () => {
  const [kincoCatalog, productImages, manuals] = await Promise.all([
    readFile(new URL('../src/data/kincoCatalog.ts', import.meta.url), 'utf8'),
    readFile(productImagesPath, 'utf8'),
    readFile(new URL('../src/data/manuals.ts', import.meta.url), 'utf8'),
  ])

  assert.match(kincoCatalog, /model\('iSWV Series', 'iSWV', 'robot-module'/)
  assert.match(kincoCatalog, /Modbus RTU \/ RS485/)
  assert.match(kincoCatalog, /EtherCAT \(CoE \/ CiA402, 100 Mbps\)/)
  assert.match(productImages, /iSWV: \{ src: 'https:\/\/www\.kincoautomation\.com\/local_upload\/20260603\/2062046712018411520\.png'/)
  assert.match(manuals, /iSWV%20vertical%20steering%20wheel%20user%20manual%2020250318\.pdf/)
})

test('every registered manufacturer product has an official page and a product-or-category image fallback', async () => {
  const vite = await createServer({
    root: process.cwd(),
    appType: 'custom',
    server: { middlewareMode: true },
  })

  try {
    const [{ motors, brandCatalogs, categoriesForBrand }, { productImageFor, categoryProductImageFor }] = await Promise.all([
      vite.ssrLoadModule('/src/data/motors.ts'),
      vite.ssrLoadModule('/src/data/productImages.ts'),
    ])
    const manufacturers = {
      kinco: 'Kinco',
      robotis: 'ROBOTIS',
      'ls-mecapion': 'LS메카피온',
      komotek: 'KOMOTEK',
      fastech: 'FASTECH',
    }

    for (const brand of brandCatalogs.filter((item) => item.id in manufacturers)) {
      const products = motors.filter((product) => product.brand === manufacturers[brand.id])
      assert.ok(products.length > 0, `${brand.name} 등록 제품이 필요합니다.`)

      const visibleCategories = categoriesForBrand(brand.id).filter((category) => products.some((product) => product.categoryId === category.id))
      assert.ok(visibleCategories.length > 0, `${brand.name} 표시 카테고리가 필요합니다.`)

      for (const category of visibleCategories) {
        assert.ok(products.some((product) => product.categoryId === category.id), `${brand.name} ${category.name} 카테고리에 제품이 필요합니다.`)
      }

      for (const product of products) {
        assert.match(product.officialUrl, /^https?:\/\//, `${brand.name} ${product.model} 공식 제품 페이지가 필요합니다.`)
        assert.match(product.sourceChecked, /^20\d{2}-\d{2}-\d{2}$/)
        const image = productImageFor(product) ?? categoryProductImageFor(product.categoryId, brand.id)
        assert.ok(image, `${brand.name} ${product.model} 이미지 또는 카테고리 대표 이미지가 필요합니다.`)
        assert.match(image.src, /^(https?:|\/)/, `${brand.name} ${product.model} 이미지 경로가 필요합니다.`)
        assert.match(image.sourceUrl, /^https?:\/\//, `${brand.name} ${product.model} 이미지 근거 URL이 필요합니다.`)
      }
    }
  } finally {
    await vite.close()
  }
})

test('individual model specifications support native sharing, copy fallback, and direct-link restoration', async () => {
  const [app, icons, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/components/Icon.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /function sharedModelUrl/)
  assert.match(app, /new URLSearchParams\(\{ model: product\.id \}\)/)
  assert.match(app, /function sharedModelText/)
  assert.match(app, /specsToRows\(product\.specs\)/)
  assert.match(app, /navigator\.share\(\{ title: `\$\{product\.model\} \| \$\{product\.brand\} 모터 사양`, text, url \}\)/)
  assert.match(app, /navigator\.clipboard\?\.writeText/)
  assert.match(app, /document\.execCommand\('copy'\)/)
  assert.match(app, /new URLSearchParams\(window\.location\.hash\.slice\(1\)\)\.get\('model'\)/)
  assert.match(app, /className="button secondary share-button"/)
  assert.match(app, /onShare=\{shareModel\}/)
  assert.match(icons, /\| 'share'/)
  assert.match(styles, /\.share-button \{/)
})

test('hero uses the direct motor-selection hook', async () => {
  const app = await readFile(appPath, 'utf8')

  assert.match(app, /모터 선정,/)
  assert.match(app, /이제 사양표를 넘기지 마세요\./)
  assert.match(app, /\$\{activeBrand\.name\} 모터 검색/)
  assert.match(app, /\$\{activeBrand\.englishName\} MOTOR LIBRARY/)
})

test('brand menu switches KINCO, ROBOTIS, LS Mecapion, KOMOTEK, and FASTECH without mixing product data', async () => {
  const [app, motors, externalCatalog, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/data/motors.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/data/externalCatalog.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(motors, /id: 'robotis', name: '로보티즈'/)
  assert.match(motors, /id: 'ls-mecapion', name: 'LS메카피온'/)
  assert.match(motors, /id: 'komotek', name: '코모텍'/)
  assert.match(motors, /id: 'fastech'/)
  assert.match(externalCatalog, /brand: 'ROBOTIS'/)
  assert.match(externalCatalog, /brand: 'LS메카피온'/)
  assert.match(externalCatalog, /brand: 'KOMOTEK'/)
  assert.match(externalCatalog, /brand: 'FASTECH'/)
  assert.match(app, /const \[activeBrandId, setActiveBrandId\]/)
  assert.match(app, /const brandMotors = useMemo/)
  assert.match(app, /className="brand-switcher"/)
  assert.match(app, /onClick=\{\(\) => selectBrand\(brand\.id\)\}/)
  assert.match(styles, /\.brand-switcher \{ display: flex;/)
})

test('FASTECH integrated lineup registers official specifications, manuals, drawings, selection filters, and individual capacity variants', async () => {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { middlewareMode: true } })

  try {
    const [{ externalMotors }, { manualPdfBySeries }, { drawingArchivesBySeries }, variants, filters] = await Promise.all([
      vite.ssrLoadModule('/src/data/externalCatalog.ts'),
      vite.ssrLoadModule('/src/data/manuals.ts'),
      vite.ssrLoadModule('/src/data/drawings.ts'),
      vite.ssrLoadModule('/src/data/fastechVariants.ts'),
      vite.ssrLoadModule('/src/utils/selectionFilters.ts'),
    ])
    const fastech = externalMotors.filter((product) => product.brand === 'FASTECH')
    const series = ['Ezi-SERVO II BT', 'Ezi-SERVO ALL', 'Ezi-SERVO II EtherCAT ALL', 'Ezi-STEP BT', 'Ezi-STEP ALL']

    assert.equal(fastech.length, series.length)
    for (const product of fastech) {
      assert.ok(series.includes(product.series), `${product.series} must be an official FASTECH integrated series`)
      assert.equal(product.categoryId, 'integrated')
      assert.equal(filters.selectionCapabilityUnit(product), 'torque')
      assert.ok(product.specs.holdingTorque && product.specs.holdingTorque > 0)
      assert.match(product.officialUrl, /^https:\/\/fastech-motions\.com\//)
      assert.ok(manualPdfBySeries[product.series], `${product.series} needs a direct official manual record`)
      assert.ok(drawingArchivesBySeries[product.series]?.some((drawing) => drawing.kind === 'page'), `${product.series} needs an official drawing/specification page`)
      assert.ok(variants.fastechVariantsFor(product).length > 0, `${product.series} needs selectable motor-capacity variants`)
    }

    assert.equal(Object.values(variants.fastechVariantsBySeries).flat().length, 53)
    assert.equal(variants.fastechVariantsBySeries['Ezi-SERVO ALL'].length, 11)
    assert.deepEqual(variants.fastechVariantsBySeries['Ezi-SERVO ALL'].at(-1), {
      id: 'ezi-servo-all-60l', model: 'Ezi-SERVO ALL-60L', frameSize: 60, holdingTorque: 2.4, phaseCurrent: 4, rotorInertiaGcm2: 690, lengthMm: 85, weightG: 1800,
    })

    const ethercat = fastech.find((product) => product.series === 'Ezi-SERVO II EtherCAT ALL')
    const servoAll = fastech.find((product) => product.series === 'Ezi-SERVO ALL')
    const stepAll = fastech.find((product) => product.series === 'Ezi-STEP ALL')
    assert.ok(ethercat && servoAll && stepAll)
    assert.equal(filters.supportsSelectionVoltage(ethercat, '48v'), true)
    assert.equal(filters.supportsSelectionProtocol(ethercat, 'ethercat'), true)
    assert.equal(filters.supportsSelectionProtocol(servoAll, 'rs485'), true)
    assert.equal(filters.supportsSelectionProtocol(stepAll, 'rs485'), true)
  } finally {
    await vite.close()
  }
})

test('FASTECH model browser offers a selectable capacity submenu and opens the selected model with its exact values', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /fastechVariantsFor\(product\)/)
  assert.match(app, /isFastechCatalog/)
  assert.match(app, /fastechVariantSpecs\(product, variant\)/)
  assert.match(app, /onSelect\(product, variant\.id\)/)
  assert.match(app, /className="model-menu-characteristics"/)
  assert.match(app, /로터 관성/)
  assert.match(app, /initialFastechVariantId=\{detailFastechVariantId/)
  assert.match(styles, /\.model-browser-list \{ display: grid;/)
  assert.match(styles, /\.model-menu-characteristics \{ display: grid;/)
})

test('external brands use manufacturer-specific category language in cards, selection, and model menus', async () => {
  const [motors, app] = await Promise.all([
    readFile(new URL('../src/data/motors.ts', import.meta.url), 'utf8'),
    readFile(appPath, 'utf8'),
  ])

  assert.match(motors, /function categoriesForBrand/)
  assert.match(motors, /DYNAMIXEL X 스마트 액추에이터/)
  assert.match(motors, /DYNAMIXEL Y 산업용 액추에이터/)
  assert.match(motors, /DYNAMIXEL P 고정밀 액추에이터/)
  assert.match(motors, /name: 'DD 모터'/)
  assert.match(motors, /name: 'AC 서보 플랫폼'/)
  assert.match(app, /function categoryForProduct/)
  assert.match(app, /categoriesForBrand\(activeBrandId\)/)
  assert.match(app, /categoryForBrand\(activeBrandId, modelMenuCategoryId\)/)
  assert.match(app, /label: 'PEGA'/)
  assert.match(app, /label: 'KANZ'/)
})

test('power filtering expands beyond 1 kW for published LS Mecapion and KOMOTEK family ranges', async () => {
  const [app, viteConfig] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(viteConfigPath, 'utf8'),
  ])

  assert.match(app, /const extendedPowerFloors = \[100, 400, 750, 1000, 3000, 7500, 15000, 40000, 100000, 800000\]/)
  assert.match(app, /function powerOptionsFor/)
  assert.match(app, /const directoryPowerChoices/)
  assert.match(app, /value <= 1_000_000/)
  assert.match(viteConfig, /isNumberWithin\(criteria\.powerFloor, 0, 1_000_000\)/)
})

test('DYNAMIXEL X catalog retains official voltage, stall torque, no-load speed, and bus distinctions', async () => {
  const [externalCatalog, app, viteConfig, selectionFilters] = await Promise.all([
    readFile(externalCatalogPath, 'utf8'),
    readFile(appPath, 'utf8'),
    readFile(viteConfigPath, 'utf8'),
    readFile(selectionFiltersPath, 'utf8'),
  ])

  for (const model of ['XL330-M077-T', 'XC330-M288-T', 'XM335-T323-T', 'XL430-W250-T', 'XC430-W240-T', '2XC430-W250', 'XM430-W350-T', 'XH430-V350-R', 'XM540-W270-T', 'XH540-V270-R', 'XD540-T270-R', 'XW540-T260-R']) {
    assert.match(externalCatalog, new RegExp(`model: '${model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`))
  }

  assert.match(externalCatalog, /XH540-V270-R/)
  assert.doesNotMatch(externalCatalog, /model: 'XH540-W270-T'/)
  assert.match(externalCatalog, /torque: '4\.1 Nm \(12\.0 V, Stall\)'/)
  assert.match(externalCatalog, /speed: '46 rpm \(12\.0 V, No-load\)'/)
  assert.match(externalCatalog, /bus: 'TTL Half-Duplex'/)
  assert.match(externalCatalog, /bus: 'RS-485 Multidrop'/)
  assert.match(externalCatalog, /gearRatio: '272\.5 : 1'/)
  assert.match(externalCatalog, /resolution: input\.resolution \?\? '4,096 pulse\/rev'/)
  assert.match(selectionFilters, /export type SelectionVoltage = 'all' \| '5v' \| '12v'/)
  assert.match(app, /\{ value: '5v', label: '5 V DC' \}/)
  assert.match(app, /\{ value: '12v', label: '12 V DC' \}/)
  assert.match(app, /const torqueOptions/)
  assert.match(app, /selectionManufacturer === 'robotis' \? '최소 공개 토크'/)
  assert.match(app, /query: 'XM430'/)
  assert.match(app, /selectionCapabilityValue\(product\)/)
  assert.match(viteConfig, /\['all', '5v', '12v', '24v'/)
  assert.match(viteConfig, /selectionCapabilityValue\(product\)/)
  assert.match(viteConfig, /Nm 이상 공개 토크/)
  assert.match(viteConfig, /label: '무부하 속도'/)
})

test('DYNAMIXEL catalog separates the Y, P, X, and MX actuator families with published selection data', async () => {
  const [externalCatalog, app, styles, images, viteConfig, selectionFilters] = await Promise.all([
    readFile(externalCatalogPath, 'utf8'),
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/data/productImages.ts', import.meta.url), 'utf8'),
    readFile(viteConfigPath, 'utf8'),
    readFile(selectionFiltersPath, 'utf8'),
  ])

  for (const model of ['YM070-210-R099-RH', 'YM080-230-A099-RH', 'PH54-200-S500-R', 'PM42-010-S260-R', 'XW540-T140-R', 'XD430-T350-R', 'XC330-T181-T']) {
    assert.match(externalCatalog, new RegExp(`model: '${model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`))
  }

  assert.match(externalCatalog, /dynamixelMx\('MX-106T\/R'/)

  assert.match(externalCatalog, /family: 'Y Series'/)
  assert.match(externalCatalog, /family: 'P Series'/)
  assert.match(externalCatalog, /const family = `\$\{input\.series\.replace\('DYNAMIXEL ', ''\)\} Series`/)
  assert.match(externalCatalog, /series: input\.series,\s+family,\s+lifecycle: 'current'/)
  assert.match(externalCatalog, /family: 'MX Series'/)
  assert.match(externalCatalog, /maxTorque: 61\.4/)
  assert.match(externalCatalog, /protocols: \['UART Half-Duplex'\]/)
  assert.match(externalCatalog, /Modbus RTU \(펌웨어 11\+\)/)
  assert.match(selectionFilters, /export type SelectionProtocol = 'all' \| 'ethercat' \| 'canopen' \| 'modbus' \| 'profinet' \| 'pulse' \| 'ttl' \| 'rs485' \| 'uart'/)
  assert.match(app, /\{ value: 'rs485', label: 'RS-485' \}/)
  assert.match(app, /\{ value: 'uart', label: 'UART Half-Duplex' \}/)
  assert.match(viteConfig, /'ttl', 'rs485', 'uart'/)
  assert.match(app, /const \[familyId, setFamilyId\] = useState\('all'\)/)
  assert.match(app, /className="family-filter"/)
  assert.match(styles, /\.family-filter \{ display: flex;/)
  assert.match(images, /assets\/images\/dxl\/y\/y_series_product\.png/)
  assert.match(images, /assets\/images\/dxl\/x\/x_series_product\.png/)

  const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { middlewareMode: true } })
  try {
    const { externalMotors } = await vite.ssrLoadModule('/src/data/externalCatalog.ts')
    const currentX = externalMotors.filter((product) => product.brand === 'ROBOTIS' && product.lifecycle === 'current' && product.categoryId === 'integrated')
    const familyCounts = Object.fromEntries(Array.from(new Set(currentX.map((product) => product.family))).map((family) => [family, currentX.filter((product) => product.family === family).length]))

    assert.deepEqual(Object.keys(familyCounts).sort(), ['XC Series', 'XD Series', 'XH Series', 'XL Series', 'XM Series', 'XW Series'])
    assert.equal(familyCounts['XW Series'], 4)
    assert.equal(familyCounts['XD Series'], 4)
    assert.equal(familyCounts['XH Series'], 8)
    assert.equal(familyCounts['XM Series'], 5)
    assert.equal(familyCounts['XC Series'], 9)
    assert.equal(familyCounts['XL Series'], 5)
    assert.equal(familyCounts['X Series'], undefined)
  } finally {
    await vite.close()
  }
})

test('ROBOTIS DYNAMIXEL P category card uses its official representative image', async () => {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { middlewareMode: true } })

  try {
    const { categoryProductImageFor } = await vite.ssrLoadModule('/src/data/productImages.ts')
    const image = categoryProductImageFor('frameless', 'robotis')

    assert.ok(image, 'DYNAMIXEL P 카테고리 대표 이미지는 비어 있으면 안 됩니다.')
    assert.equal(image.sourceUrl, 'https://emanual.robotis.com/docs/en/dxl/p/')
    assert.match(image.src, /assets\/images\/dxl\/p\/pro-plus\.png/)
  } finally {
    await vite.close()
  }
})

test('DYNAMIXEL legacy AX, EX, DX, RX, and PRO entries retain explicit official status and communication data', async () => {
  const [externalCatalog, images] = await Promise.all([
    readFile(externalCatalogPath, 'utf8'),
    readFile(productImagesPath, 'utf8'),
  ])

  for (const model of ['AX-18A', 'AX-12A', 'AX-12W', 'EX-106+', 'DX-113', 'DX-116', 'DX-117', 'RX-10', 'RX-24F', 'RX-28', 'RX-64', 'H54-200-S500-R', 'L54-50-S500-R']) {
    assert.match(externalCatalog, new RegExp(`model: '${model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`))
  }

  for (const family of ['AX Series', 'EX Series', 'DX Series', 'RX Series', 'PRO Series']) {
    assert.match(externalCatalog, new RegExp(`family: '${family}'`))
  }

  assert.match(externalCatalog, /DYNAMIXEL Protocol 1\.0/)
  assert.match(externalCatalog, /legacyNote: '단종 상태로 공식 e-Manual에 수록된'/)
  assert.match(externalCatalog, /H54-200-S500-R.*44\.7 Nm \(Continuous\)/)
  assert.match(images, /assets\/images\/dxl\/ax\/ax-18a_product\.png/)
  assert.match(images, /assets\/images\/dxl\/dx\/dx-116_product\.png/)
  assert.match(images, /assets\/images\/dxl\/rx\/rx-24f_product\.png/)
  assert.match(images, /assets\/images\/dxl\/pro\/h54-200-s500-r_product\.jpg/)
})

test('DYNAMIXEL directory separates lifecycle and states the official torque-basis caution', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /현재 라인업 우선 표시/)
  assert.match(app, /공식 DYNAMIXEL e-Manual 기준/)
  assert.match(app, /토크 기준이 다른 모델은 절대값만으로 직접 비교하지 마세요/)
  assert.match(app, /className="robotis-catalog-note"/)
  assert.match(app, /const visibleMotorGroups = useMemo/)
  assert.match(app, /className="motor-family-groups"/)
  assert.match(app, /className="model-browser-family-filter"/)
  assert.match(styles, /\.robotis-catalog-note \{/) 
  assert.match(styles, /\.motor-family-groups \{/) 
  assert.match(styles, /\.model-browser-family-filter \{/) 
})

test('LS Mecapion and KOMOTEK families link to official product pages and display verified representative images', async () => {
  const [externalCatalog, images] = await Promise.all([
    readFile(externalCatalogPath, 'utf8'),
    readFile(productImagesPath, 'utf8'),
  ])

  for (const pageId of ['wr_id=8', 'wr_id=5', 'wr_id=4', 'wr_id=3', 'wr_id=7', 'wr_id=2', 'wr_id=1']) {
    assert.match(externalCatalog, new RegExp(pageId))
  }

  assert.doesNotMatch(externalCatalog, /ratedSpeedText: '1,000–3,000 rpm', flange: 40/)
  assert.match(externalCatalog, /ratedVoltage: 'DC 48–60 V'/)
  assert.match(externalCatalog, /ratedPowerOptions: \[50, 100, 200, 300\]/)
  assert.match(externalCatalog, /ratedCurrentText: '1\.8 \/ 2\.4 \/ 3\.6 \/ 5\.0 \/ 6\.8 Arms \(용량별\)'/)
  assert.match(images, /LS MECAPION PEGA/)
  assert.match(images, /1935305405_WI1sjF7J/)
  assert.match(images, /http:\/\/komotek\.com\/wp-content\/uploads\/2018\/03\/KANZ\.gif/)
  assert.match(images, /special-servo-motor-3-1\.png/)
  assert.match(images, /product\.model\] \?\? officialSeriesImages\[product\.series\]/)
  assert.match(images, /'ls-mecapion': \{/)
  assert.match(images, /komotek: \{/)
})

test('every non-control area of a product card opens its detail view or the FASTECH capacity submenu', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /className="card-open-area" aria-label=\{`\$\{product\.model\} \$\{isFastech \? '하위 모델 선택' : '상세 보기'\}`\}/)
  assert.match(app, /const openCatalogItem = \(product: MotorProduct\) => product\.brand === 'FASTECH' \? openFastechModelMenu\(product\) : openDetail\(product\)/)
  assert.match(styles, /\.card-topline, \.motor-card-copy, \.product-card-specs, \.card-actions \{ pointer-events: none; \}/)
  assert.match(styles, /\.card-topline \.card-action, \.card-actions button \{ pointer-events: auto; \}/)
})

test('saved favorites have a dedicated reusable model area', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /const favoriteProducts = favorites\.map/)
  assert.match(app, /className="favorites-section"/)
  assert.match(app, /SAVED MODELS/)
  assert.match(app, /className=\{`favorite-compare/)
  assert.match(styles, /\.favorite-list \{ display: grid;/)
})

test('saved favorites retain a local project status and memo', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /favoriteMetadata: 'motor-atlas:favorite-metadata:v1'/)
  assert.match(app, /function loadFavoriteMetadata/)
  assert.match(app, /const \[favoriteMetadata, setFavoriteMetadata\]/)
  assert.match(app, /const updateFavoriteMetadata/)
  assert.match(app, /className="favorite-project"/)
  assert.match(app, /<option value="reviewing">검토 중<\/option>/)
  assert.match(app, /<option value="candidate">후보<\/option>/)
  assert.match(app, /<option value="selected">선정<\/option>/)
  assert.match(app, /maxLength=\{80\}/)
  assert.match(styles, /\.favorite-project \{ display: grid;/)
})

test('Kinco catalog uses current product-menu paths instead of retired numeric links', async () => {
  const catalog = await readFile(catalogPath, 'utf8')

  for (const retiredPath of ['/product/229', '/product/230', '/product/241', '/product/117', '/product/130', '/product/133']) {
    assert.equal(catalog.includes(retiredPath), false, `${retiredPath} must not be used`)
  }

  for (const currentPath of [
    '/product/robot/ismk-2',
    '/product/robot/md-2',
    '/product/robot/iswv',
    '/product/robot/iwmc',
    '/product/automation/smk',
    '/product/automation/smh',
    '/product/automation/smc-48v',
    '/product/automation/smk-48v',
    '/product/automation/smk-96v',
  ]) {
    assert.equal(catalog.includes(currentPath), true, `${currentPath} must be present`)
  }
})

test('manual PDF opening uses a local signed proxy for Kinco download hotlink protection', async () => {
  const [app, manuals, viteConfig] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(manualsPath, 'utf8'),
    readFile(viteConfigPath, 'utf8'),
  ])

  assert.match(app, /new URL\('\/api\/manual-pdf', window\.location\.origin\)/)
  assert.match(app, /manualUrl\.searchParams\.set\('series', product\.series\)/)
  assert.doesNotMatch(app, /window\.open\(manual\.url/)
  assert.match(manuals, /refererUrl: 'https:\/\/www\.kincoautomation\.com\/product\//)
  assert.match(viteConfig, /name: 'kinco-manual-pdf-proxy'/)
  assert.match(viteConfig, /Referer: file\.refererUrl/)
  assert.match(viteConfig, /retrieveKincoDownload\(manual\)/)
})

test('model selection menu shows voltage, exact capacity, and communication support once', async () => {
  const app = await readFile(appPath, 'utf8')
  const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8')

  assert.match(app, /className="model-menu-power"/)
  assert.match(app, /className="model-menu-protocol"/)
  assert.match(app, /protocols\.join\(' · '\)/)
  assert.match(app, /function modelFeatureLabel/)
  assert.match(app, /function communicationLabel/)
  assert.match(app, /className="model-menu-features"/)
  assert.match(app, /className="product-card-specs"/)
  assert.match(app, /통신 방식/)
  assert.match(app, /className="product-card-feature"/)
  assert.doesNotMatch(app, /model-menu-capacity/)
  assert.match(styles, /\.model-menu-power \{[^}]*font-size: 17px/)
  assert.match(styles, /\.model-menu-features \{/)
  assert.match(styles, /\.product-card-specs \{/)
  assert.match(styles, /\.product-card-feature \{/)
  assert.match(styles, /background: color-mix\(in srgb, var\(--gold\) 13%/)
})

test('a model opened from the model menu can return to that menu', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /const \[detailReturnCategoryId, setDetailReturnCategoryId\]/)
  assert.match(app, /const returnToModelList = \(\) =>/)
  assert.match(app, /onBackToModels=\{detailReturnCategoryId \? returnToModelList : undefined\}/)
  assert.match(app, /className="detail-return"/)
  assert.match(styles, /\.detail-return \{/)
})

test('mobile model menus do not automatically focus the search field or open the keyboard', async () => {
  const app = await readFile(appPath, 'utf8')

  assert.match(app, /const shouldAutoFocusModelSearch = window\.matchMedia\('\(min-width: 761px\)'\)\.matches/)
  assert.match(app, /autoFocus=\{shouldAutoFocusModelSearch\}/)
  assert.doesNotMatch(app, /placeholder="모델명 · 용량 · 통신 방식 검색" autoFocus \/>/)
})

test('model comparison includes current and compatibility-critical rows', async () => {
  const app = await readFile(appPath, 'utf8')

  assert.match(app, /'전류 \(입력 \/ 연속 \/ 피크\)'/)
  assert.match(app, /'통신 방식'/)
  assert.match(app, /'엔코더 · 브레이크'/)
  assert.match(app, /'보호 · 안전'/)
  assert.match(app, /'핵심 특징'/)
})

test('comparison highlights differing specifications and summarizes the three highest-priority differences', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /const differencePriority = \[/)
  assert.match(app, /hasDifference: new Set\(values\)\.size > 1/)
  assert.match(app, /const keyDifferenceRows = populatedRows/)
  assert.match(app, /\.slice\(0, 3\)/)
  assert.match(app, /className="comparison-insights"/)
  assert.match(app, /className=\{`\$\{row\.hasDifference \? 'has-difference' : 'is-same'\}/)
  assert.match(styles, /\.compare-table tbody tr\.is-same td/)
  assert.match(styles, /\.compare-table tbody tr\.has-difference/)
  assert.match(styles, /\.comparison-insights \{/)
})

test('comparison can toggle between all specifications and differing rows only', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /const \[showDifferencesOnly, setShowDifferencesOnly\] = useState\(false\)/)
  assert.match(app, /const visibleRows = showDifferencesOnly \? populatedRows\.filter\(\(row\) => row\.hasDifference\) : populatedRows/)
  assert.match(app, /className=\{`difference-filter \$\{showDifferencesOnly \? 'is-active' : ''\}`\}/)
  assert.match(app, /visibleRows\.length > 0 \? visibleRows\.map/)
  assert.match(app, /className="comparison-empty-row"/)
  assert.match(styles, /\.difference-filter \{/)
  assert.match(styles, /\.difference-filter\.is-active/)
})

test('comparison replaces unavailable values with the official-publication status instead of a dash', async () => {
  const [app, catalog, workbook] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(catalogPath, 'utf8'),
    readFile(new URL('../tmp/xlsx-runtime/comparisonWorkbook.mjs', import.meta.url), 'utf8'),
  ])

  assert.match(app, /function comparisonUnavailableLabel/)
  assert.match(app, /사양 출처 상태/)
  assert.match(workbook, /function comparisonUnavailableLabel/)
  assert.match(workbook, /사양 출처 상태/)
  assert.match(catalog, /FMC13224-0118-3243N-8DK00', 1180, 3\.5, 8\.4, 29\.2, 70, 3220, 3800/)
  assert.match(catalog, /ratedTorqueText: '0\.64 \/ 1\.27 \/ 2\.39 Nm \(200 \/ 400 \/ 750 W\)'/)
})

test('model comparison can download an XLSX workbook through the local export route', async () => {
  const [app, viteConfig, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(viteConfigPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /new URL\('\/api\/comparison-xlsx', window\.location\.origin\)/)
  assert.match(app, /className="comparison-export"/)
  assert.match(viteConfig, /server\.middlewares\.use\('\/api\/comparison-xlsx'/)
  assert.match(viteConfig, /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/)
  assert.match(styles, /\.comparison-export \{/)
})

test('comparison tray can close without clearing the selected models', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /const \[comparisonCollapsed, setComparisonCollapsed\]/)
  assert.match(app, /onClose=\{\(\) => setComparisonCollapsed\(true\)\}/)
  assert.match(app, /comparisonProducts\.length > 0 && comparisonCollapsed/)
  assert.match(app, /className="comparison-reopen"/)
  assert.match(styles, /\.comparison-reopen \{/)
})

test('home screen focuses on search instead of the static selection guide', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.doesNotMatch(app, /<nav className="topnav"/)
  assert.doesNotMatch(app, /className="selection-guide"/)
  assert.match(app, /className="data-policy" aria-label=/)
  assert.doesNotMatch(styles, /\.selection-guide \{/)
})

test('official drawing ZIPs use the same protected-download proxy', async () => {
  const [app, drawings, viteConfig, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(drawingsPath, 'utf8'),
    readFile(viteConfigPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(drawings, /MD_drawings\.zip/)
  assert.match(drawings, /iSMK_drawings\.zip/)
  assert.match(app, /new URL\('\/api\/drawing-zip', window\.location\.origin\)/)
  assert.match(app, /className="drawing-download"/)
  assert.match(viteConfig, /server\.middlewares\.use\('\/api\/drawing-zip'/)
  assert.match(viteConfig, /Content-Type', 'application\/zip'/)
  assert.match(styles, /\.drawing-download \{/)
})

test('drawing ZIP coverage includes every catalog family with an official Kinco archive', async () => {
  const [app, drawings] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(drawingsPath, 'utf8'),
  ])

  for (const archive of [
    'FMK_drawings.zip', 'FMC_drawings.zip', 'iSMK_drawings.zip', 'MD_drawings.zip', 'iSML_drawings.zip',
    'SMK40S%2660S%2680S_AC220V_drawings.zip', 'SMH60S_AC220V.zip', 'SMC40S_AC220V_drawings.zip',
    'SMC40S_DC48V_drawings.zip', 'SMK80D_DC96V_drawings.zip', 'Stepper-motor_drawings.zip',
  ]) {
    assert.match(drawings, new RegExp(archive.replace(/[.]/g, '\\.'), 'i'), `${archive} must be registered`)
  }

  assert.match(app, /DWG ZIP 다운로드/)
  assert.match(app, /className="drawing-unavailable"/)
  assert.match(drawings, /modelPrefixes\?: string\[\]/)
  assert.match(drawings, /archive\.modelPrefixes \|\| archive\.modelPrefixes\.some/)
})

test('individual model details can export a one-page Korean specification PDF card', async () => {
  const [app, viteConfig, generator, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(viteConfigPath, 'utf8'),
    readFile(modelSpecPdfGeneratorPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /const \[modelPdfPendingId, setModelPdfPendingId\] = useState<string \| null>\(null\)/)
  assert.match(app, /new URL\('\/api\/model-spec-pdf', window\.location\.origin\)/)
  assert.match(app, /className="button secondary pdf-download"/)
  assert.match(app, /onDownloadSpecPdf=\{downloadModelSpecPdf\}/)
  assert.match(viteConfig, /name: 'model-spec-pdf'/)
  assert.match(viteConfig, /server\.middlewares\.use\('\/api\/model-spec-pdf'/)
  assert.match(viteConfig, /buildModelSpecPdf/)
  assert.match(viteConfig, /Content-Type', 'application\/pdf'/)
  assert.match(generator, /from reportlab\.pdfgen import canvas/)
  assert.match(generator, /NanumGothicBold/)
  assert.match(generator, /pagesize=A4/)
  assert.match(styles, /\.pdf-download \{/) 
})

test('condition-based selection shows every matching current motor across manufacturers with matching reasons', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /const \[selectionCategoryId, setSelectionCategoryId\] = useState<CategoryId \| 'all'>\('all'\)/)
  assert.match(app, /const \[selectionManufacturer, setSelectionManufacturer\] = useState<SelectionManufacturer>\('all'\)/)
  assert.match(app, /const selectionManufacturerOptions/)
  assert.match(app, /const \[selectionVoltage, setSelectionVoltage\] = useState<SelectionVoltage>\('all'\)/)
  assert.match(app, /const selectionMatchResult = useMemo/)
  assert.match(app, /return \{ matches: matchProducts\(motors\), inScope: inScope\.length, undisclosed \}/)
  // 조건에 해당하는 공개 수치가 없어 빠진 모델 수를 결과 머리말에 알려야 한다.
  assert.match(app, /const selectionUndisclosed = selectionMatchResult\.undisclosed \?\? 0/)
  assert.match(app, /선택한 조건의 공개 수치가 없는 \$\{selectionUndisclosed\}개 모델은 결과에서 빠졌습니다/)
  assert.match(app, /filter\(\(product\) => product\.lifecycle !== 'legacy'\)/)
  assert.match(app, /selectionManufacturer === 'all'/)
  assert.match(app, /product\.brand === manufacturerByBrandId\[selectionManufacturer\]/)
  assert.match(app, /const selectionMatches = selectionMatchResult\.matches/)
  assert.match(app, /supportsSelectionVoltage\(product, selectionVoltage\)/)
  assert.match(app, /supportsSelectionProtocol\(product, selectionProtocol\)/)
  assert.match(app, /const selectionResults = selectionMatches/)
  assert.match(app, /const selectionReportResults = selectionMatches\.slice\(0, 3\)/)
  assert.match(app, /function selectionReasons/)
  assert.match(app, /className="selection-assistant"/)
  assert.match(app, /className="selection-result-grid"/)
  assert.match(app, /className="selection-match-area" role="button" tabIndex=\{0\}/)
  assert.match(app, /aria-label=\{`\$\{product\.model\} 필터 일치 사양 상세 보기`\}/)
  assert.match(app, /onClick=\{\(\) => openDetail\(product\)\}/)
  assert.match(styles, /\.selection-assistant \{/) 
  assert.match(styles, /\.selection-result-grid \{/) 
  assert.match(styles, /\.selection-controls \{[^}]*repeat\(5, minmax\(0, 1fr\)\)/)
  assert.match(styles, /\.selection-match-area:hover, \.selection-match-area:focus-visible/)
})

test('selection filters validate every registered model against normalized published voltage and communication data', async () => {
  const vite = await createServer({
    root: process.cwd(),
    appType: 'custom',
    server: { middlewareMode: true },
  })

  try {
    const [{ motors, categories }, filters] = await Promise.all([
      vite.ssrLoadModule('/src/data/motors.ts'),
      vite.ssrLoadModule('/src/utils/selectionFilters.ts'),
    ])

    assert.equal(motors.length, 255)
    assert.equal(new Set(motors.map((product) => product.id)).size, motors.length)

    const selectionVoltage = { '5v': 5, '12v': 12, '24v': 24, '48v': 48, '96v': 96, '220v': 220 }
    const expectedVoltageMatch = (product, selection, voltage) => {
      const source = `${product.specs.ratedVoltage ?? ''} ${product.specs.dcInputRange ?? ''}`
        .replace(/\([^)]*(?:로직\s*전원|logic\s*supply)[^)]*\)/gi, ' ')
        .toLowerCase()
      const isAcRequest = selection === '220v'
      const hasAcSupply = /vac|\bac\b/.test(source) || (product.categoryId === 'ac-servo' && voltage >= 100)
      const hasDcSupply = /vdc/.test(source)
      if (isAcRequest ? !hasAcSupply : hasAcSupply && !hasDcSupply) return false
      return [...source.matchAll(/(\d+(?:\.\d+)?)\s*(?:[–—~-]\s*(\d+(?:\.\d+)?))?\s*v(?:dc|ac)?/g)]
        .some(([, start, end]) => voltage >= Math.min(Number(start), Number(end ?? start)) && voltage <= Math.max(Number(start), Number(end ?? start)))
    }

    for (const [selection, voltage] of Object.entries(selectionVoltage)) {
      const expectedIds = motors.filter((product) => expectedVoltageMatch(product, selection, voltage)).map((product) => product.id)
      const actualIds = motors.filter((product) => filters.supportsSelectionVoltage(product, selection)).map((product) => product.id)
      assert.deepEqual(actualIds, expectedIds, `${selection} 전압 조건은 238개 전체 모델의 전압·허용 범위와 일치해야 합니다.`)
    }

    const protocolNeedle = { ethercat: 'ethercat', canopen: 'canopen', modbus: 'modbus', profinet: 'profinet', pulse: 'pulse', ttl: 'ttl', rs485: 'rs485', uart: 'uart' }
    for (const [selection, needle] of Object.entries(protocolNeedle)) {
      const expectedIds = motors
        .filter((product) => [...(product.specs.protocols ?? []), product.specs.physicalConnection ?? ''].join(' ').toLowerCase().replace(/[^a-z0-9]/g, '').includes(needle))
        .map((product) => product.id)
      const actualIds = motors.filter((product) => filters.supportsSelectionProtocol(product, selection)).map((product) => product.id)
      assert.deepEqual(actualIds, expectedIds, `${selection} 통신 조건은 하이픈·공백 표기 차이 없이 일치해야 합니다.`)
    }

    for (const product of motors) {
      assert.ok(categories.some((category) => category.id === product.categoryId), `${product.model}은 유효한 모터 유형이 필요합니다.`)
      assert.match(product.officialUrl, /^https?:\/\//)
      assert.match(product.sourceChecked, /^20\d{2}-\d{2}-\d{2}$/)
      for (const value of [product.specs.ratedPower, product.specs.ratedTorque, product.specs.maxTorque, product.specs.holdingTorque, product.specs.ratedCurrent, product.specs.maxCurrent, product.specs.ratedSpeed, product.specs.maxSpeed]) {
        if (value !== undefined) assert.ok(Number.isFinite(value) && value >= 0, `${product.model} 수치 사양은 유효한 0 이상 숫자여야 합니다.`)
      }
      // 브레이크는 정지 마찰 토크, ROBOTIS·FASTECH는 공개 토크, 나머지는 출력(W)을 선정 기준으로 삼는다.
      const expectedCapability = product.categoryId === 'brake' || ['ROBOTIS', 'FASTECH'].includes(product.brand)
        ? product.specs.staticFrictionTorque ?? product.specs.maxTorque ?? product.specs.ratedTorque ?? product.specs.holdingTorque ?? -1
        : product.specs.selectionMaxPower ?? (product.specs.ratedPowerOptions?.length ? Math.max(...product.specs.ratedPowerOptions) : product.specs.ratedPower ?? -1)
      assert.equal(filters.selectionCapabilityValue(product), expectedCapability, `${product.model}의 선정 기준 단위가 제조사 기준과 일치해야 합니다.`)
    }

    const ismd = motors.find((product) => product.model === 'iSMD Series')
    const igmk = motors.find((product) => product.model === 'iGMK Series')
    const rangeServo = motors.find((product) => product.model === 'iFMH55H')
    const pega = motors.find((product) => product.model === 'PEGA')
    assert.ok(ismd && igmk && rangeServo && pega)
    assert.equal(filters.supportsSelectionVoltage(ismd, '5v'), false)
    assert.equal(filters.supportsSelectionVoltage(ismd, '48v'), true)
    assert.equal(filters.supportsSelectionVoltage(rangeServo, '24v'), true)
    assert.equal(filters.supportsSelectionProtocol(igmk, 'rs485'), true)
    assert.equal(filters.supportsSelectionVoltage(pega, '48v'), true)
    assert.equal(filters.supportsSelectionProtocol(pega, 'ethercat'), true)
  } finally {
    await vite.close()
  }
})

test('selection report keeps a concise top-three summary while the screen shows all matching motors', async () => {
  const [app, viteConfig] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(viteConfigPath, 'utf8'),
  ])

  assert.match(app, /recommendedIds: selectionReportResults\.map\(\(product\) => product\.id\)/)
  assert.match(viteConfig, /recommendedIds\?: string\[\]/)
  assert.match(viteConfig, /const requestedRecommendationIds = \[\.\.\.new Set\(request\.recommendedIds \?\? \[\]\)\]/)
  assert.match(viteConfig, /const recommendations = requestedRecommendations\.length \? requestedRecommendations : selectionReportMatches/)
  assert.match(viteConfig, /function selectionReportMatches\(criteria: SelectionReportCriteria\)/)
})

test('selection conditions can be saved locally, restored, and shared as a portable link', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /selectionPlans: 'motor-atlas:selection-plans:v1'/)
  assert.match(app, /function loadSelectionPlans/)
  assert.match(app, /function sharedSelectionUrl/)
  assert.match(app, /selection: '1'/)
  assert.match(app, /function clearSharedSelectionHash/)
  assert.match(app, /const saveSelectionPlan = \(\) =>/)
  assert.match(app, /const applySelectionPlan = \(plan: SelectionPlan\) =>/)
  assert.match(app, /const shareSelectionPlan = async \(plan: SelectionPlan\) =>/)
  assert.match(app, /className="selection-plan-save"/)
  assert.match(app, /className="selection-plan-list"/)
  assert.match(styles, /\.selection-plan-save \{/)
  assert.match(styles, /\.selection-plan-list ul \{/) 
})

test('comparison provides an evidence-bound primary option, alternative, and caution summary', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /function comparisonConclusion/)
  assert.match(app, /function comparisonTorqueCapacity/)
  assert.match(app, /const conclusion = comparisonConclusion\(products\)/)
  assert.match(app, /className="comparison-conclusion"/)
  assert.match(app, /피해야 할 조합/)
  assert.match(styles, /\.comparison-conclusion \{/) 
  assert.match(styles, /\.comparison-cautions \{/) 
})

test('advanced drive calculator is removed from the motor selection workflow', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.doesNotMatch(app, /sizingCalculator|sizing-calculator|applySizingResult|ADVANCED POWER CHECK/)
  assert.doesNotMatch(styles, /\.sizing-calculator|\.sizing-output/)
  return
  assert.match(app, /감속비 \(모터:출력축\)/)
  assert.match(app, /부하 관성 \(출력축\)/)
  assert.match(styles, /\.sizing-calculator \{/) 
  assert.match(styles, /\.sizing-output \{/) 
})

test('selection results export a two-page PDF report with candidates, comparison, and memo', async () => {
  const [app, viteConfig, generator, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(viteConfigPath, 'utf8'),
    readFile(selectionReportPdfGeneratorPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /const \[selectionReportPending, setSelectionReportPending\] = useState\(false\)/)
  assert.match(app, /const downloadSelectionReport = async \(\) =>/)
  assert.match(app, /new URL\('\/api\/selection-report-pdf', window\.location\.origin\)/)
  assert.match(app, /className="selection-report"/)
  assert.match(viteConfig, /name: 'selection-report-pdf'/)
  assert.match(viteConfig, /server\.middlewares\.use\('\/api\/selection-report-pdf'/)
  assert.match(viteConfig, /function selectionReportPayload/)
  assert.doesNotMatch(viteConfig, /function selectionReportSizing|SelectionReportSizingInput/)
  assert.match(generator, /MOTOR SELECTION REPORT/)
  assert.match(generator, /NanumGothicBold/)
  assert.match(generator, /PAGE \{page_number\} \/ 2/)
  assert.match(styles, /\.selection-report \{/) 
})

test('external-drive matching separates integrated systems, published-spec candidates, and confirmation-needed products', async () => {
  const [app, drives, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(drivesPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /import \{ driveCompatibilityFor, type DriveMatch \} from '\.\/data\/drives'/)
  assert.match(app, /const driveCompatibility = driveCompatibilityFor\(product\)/)
  assert.match(app, /className=\{`product-card-drive is-\$\{driveCompatibility\.requirement\}`\}/)
  assert.match(app, /function DriveCompatibilityPanel/)
  assert.match(app, /const candidates = compatibility\.matches\.map/)
  assert.match(app, /onOpenDrive: \(url: string\) => void/)
  assert.match(app, /onOpenDrive=\{openDriveOfficial\}/)
  assert.match(drives, /FD125-AB\/AU/)
  assert.match(drives, /FD412S-LA\/CA\/EA-000/)
  assert.match(drives, /FM560-EA-000/)
  assert.match(drives, /FD2X5 Series/)
  assert.match(drives, /requirement: 'integrated'/)
  assert.match(styles, /\.drive-matching \{/)
  assert.match(styles, /\.drive-match-grid \{/)
})

test('a motor and driver candidate can be confirmed locally, restored, and copied as a configuration sheet', async () => {
  const [app, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /drivePairings: 'motor-atlas:drive-pairings:v1'/)
  assert.match(app, /function loadDrivePairings/)
  assert.match(app, /const \[drivePairings, setDrivePairings\] = useState<Record<string, string>>/)
  assert.match(app, /window\.localStorage\.setItem\(storageKeys\.drivePairings/)
  assert.match(app, /function driveMatchKey/)
  assert.match(app, /function drivePairingText/)
  assert.match(app, /const selectDrivePairing = \(productId: string, driveKey: string \| null\) =>/)
  assert.match(app, /const copyDrivePairing = async \(product: MotorProduct, item: DriveMatch\) =>/)
  assert.match(app, /className=\{`drive-select-button \$\{isSelected \? 'is-selected' : ''\}`\}/)
  assert.match(app, /className=\{`drive-pairing-summary is-\$\{selectedDrive\.status\}`\}/)
  assert.match(app, /selectedDriveKey=\{drivePairings\[selected\.id\]\}/)
  assert.match(styles, /\.drive-select-button \{/)
  assert.match(styles, /\.drive-pairing-summary \{/)
})

test('project BOMs retain procurement fields, accept motor-drive configurations, and export a purchase workbook', async () => {
  const [app, viteConfig, workbook, styles] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(viteConfigPath, 'utf8'),
    readFile(new URL('../tmp/xlsx-runtime/comparisonWorkbook.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ])

  assert.match(app, /bomProjects: 'motor-atlas:bom-projects:v1'/)
  assert.match(app, /activeBomProject: 'motor-atlas:active-bom-project:v1'/)
  assert.match(app, /function loadBomProjects/)
  assert.match(app, /function BomProjectModal/)
  assert.match(app, /const addDrivePairingToBom = \(product: MotorProduct, item: DriveMatch\) =>/)
  assert.match(app, /className="bom-open-button"/)
  assert.match(app, /프로젝트 BOM 담기/)
  assert.match(app, /new URL\('\/api\/project-bom-xlsx', window\.location\.origin\)/)
  assert.match(app, /className="bom-table"/)
  assert.match(viteConfig, /server\.middlewares\.use\('\/api\/project-bom-xlsx'/)
  assert.match(viteConfig, /function isBomXlsxRequest/)
  assert.match(viteConfig, /buildBomXlsx/)
  assert.match(workbook, /export async function createBomWorkbook/)
  assert.match(workbook, /export async function buildBomXlsx/)
  assert.match(workbook, /Magicup-Work-Flow \| 프로젝트 BOM/)
  assert.match(workbook, /SUMPRODUCT\(E\$\{firstDataRow\}:E\$\{lastDataRow\},G\$\{firstDataRow\}:G\$\{lastDataRow\}\)/)
  assert.match(styles, /\.bom-modal \{/)
  assert.match(styles, /\.bom-table \{/)
})

test('a selected FASTECH sub-model drives every detail panel with its own frame values instead of the family range', async () => {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { middlewareMode: true } })

  try {
    const [{ externalMotors }, variants] = await Promise.all([
      vite.ssrLoadModule('/src/data/externalCatalog.ts'),
      vite.ssrLoadModule('/src/data/fastechVariants.ts'),
    ])
    const [app, viteConfig] = await Promise.all([readFile(appPath, 'utf8'), readFile(viteConfigPath, 'utf8')])

    const ethercat = externalMotors.find((product) => product.series === 'Ezi-SERVO II EtherCAT ALL')
    const stepBt = externalMotors.find((product) => product.series === 'Ezi-STEP BT')
    assert.ok(ethercat && stepBt)

    // A family record publishes a combined range; a single frame must not repeat it.
    assert.equal(ethercat.specs.holdingTorqueText, '0.44–12 Nm')
    assert.equal(ethercat.specs.ratedTorqueText, undefined)

    const findVariant = (product, model) => variants.fastechVariantsFor(product).find((variant) => variant.model === model)
    const ethercat42m = findVariant(ethercat, 'Ezi-SERVO II EtherCAT ALL-42M')
    const ethercat86xl = findVariant(ethercat, 'Ezi-SERVO II EtherCAT ALL-86XL')
    const step42s = findVariant(stepBt, 'Ezi-STEP BT-42S')
    const step86xl = findVariant(stepBt, 'Ezi-STEP BT-86XL')
    assert.ok(ethercat42m && ethercat86xl && step42s && step86xl)

    const lowFrame = variants.fastechVariantSpecs(ethercat, ethercat42m)
    const highFrame = variants.fastechVariantSpecs(ethercat, ethercat86xl)
    assert.equal(lowFrame.ratedVoltage, '24 VDC ±10%')
    assert.equal(lowFrame.ratedSpeedText, '0–3,000 rpm')
    assert.equal(lowFrame.holdingTorque, 0.44)
    assert.equal(lowFrame.holdingTorqueText, undefined)
    assert.equal(lowFrame.ratedTorqueText, undefined)
    assert.equal(lowFrame.ratedCurrentText, undefined)
    assert.equal(lowFrame.phaseCurrentText, '1.2 A')
    assert.equal(highFrame.ratedVoltage, '48 VDC ±10%')
    assert.equal(highFrame.ratedSpeedText, '0–2,000 rpm')
    assert.equal(highFrame.maxSpeed, 2000)
    assert.equal(highFrame.holdingTorque, 12)
    assert.equal(highFrame.phaseCurrentText, '6 A')

    assert.equal(variants.fastechVariantSpecs(stepBt, step42s).ratedVoltage, '24 VDC ±10%')
    assert.equal(variants.fastechVariantSpecs(stepBt, step86xl).ratedVoltage, '40–70 VDC')

    // The Korean guide, the share text, and the PDF card all follow the selected sub-model.
    assert.match(app, /const displayProduct: MotorProduct = selectedFastechVariant/)
    assert.match(app, /<ManualPanel product=\{displayProduct\}/)
    assert.match(app, /onShare\(displayProduct\)/)
    assert.match(app, /onDownloadSpecPdf\(product, selectedFastechVariant\?\.id\)/)
    assert.match(app, /downloadUrl\.searchParams\.set\('variant', fastechVariantId\)/)
    assert.match(app, /\['상전류', specs\.phaseCurrentText \?\? ''\]/)
    assert.match(viteConfig, /requestParams\.get\('variant'\)/)
    assert.match(viteConfig, /fastechVariantsFor\(product\)\.find\(\(item\) => item\.id === variantId\)/)
  } finally {
    await vite.close()
  }
})

test('Miki Pulley BXR spring-applied brakes are registered as brakes, not motors', async () => {
  const vite = await createServer({
    root: process.cwd(),
    appType: 'custom',
    server: { middlewareMode: true },
  })

  try {
    const [{ motors, categories, brandCatalogs }, filters, drives] = await Promise.all([
      vite.ssrLoadModule('/src/data/motors.ts'),
      vite.ssrLoadModule('/src/utils/selectionFilters.ts'),
      vite.ssrLoadModule('/src/data/drives.ts'),
    ])

    // The brand and the brake category are both registered.
    assert.ok(brandCatalogs.some((brand) => brand.id === 'mikipulley' && brand.name === '미키풀리'))
    assert.ok(categories.some((category) => category.id === 'brake' && category.name === '브레이크'))

    const brakes = motors.filter((product) => product.brand === '미키풀리')
    assert.equal(brakes.length, 12)
    assert.ok(brakes.every((product) => product.categoryId === 'brake'))
    assert.ok(brakes.every((product) => product.officialUrl.startsWith('https://www.mikipulley-us.com/')))

    // Official published static friction torque, exactly as listed by Miki Pulley.
    const torqueByModel = Object.fromEntries(brakes.map((product) => [product.id, product.specs.staticFrictionTorque]))
    assert.deepEqual(torqueByModel, {
      'mikipulley-bxr-le-015': 0.06,
      'mikipulley-bxr-le-020': 0.14,
      'mikipulley-bxr-le-025': 0.32,
      'mikipulley-bxr-le-035': 0.62,
      'mikipulley-bxr-le-040': 1.32,
      'mikipulley-bxr-le-050': 3.2,
      'mikipulley-bxr-06': 5,
      'mikipulley-bxr-08': 12,
      'mikipulley-bxr-10': 16,
      'mikipulley-bxr-12': 30,
      'mikipulley-bxr-14': 38,
      'mikipulley-bxr-16': 55,
    })

    // Brakes are selected by static friction torque, never by watts.
    for (const brake of brakes) {
      assert.equal(filters.selectionCapabilityUnit(brake), 'torque')
      assert.equal(filters.selectionCapabilityValue(brake), brake.specs.staticFrictionTorque)
      assert.equal(brake.specs.ratedPower, undefined)
      assert.equal(brake.specs.powerRange, undefined)
    }

    // A brake never renders a motor drive-selection panel.
    for (const brake of brakes) {
      const compatibility = drives.driveCompatibilityFor(brake)
      assert.equal(compatibility.matches.length, 0)
      assert.match(compatibility.badge, /브레이크/)
      assert.ok(compatibility.checks.length > 0)
    }

    // Both BXR and BXR-LE run on a 24 V coil supply, so both stay filterable.
    const bxr10 = brakes.find((product) => product.id === 'mikipulley-bxr-10')
    assert.equal(bxr10.specs.ratedVoltage, '24 VDC')
    assert.equal(filters.supportsSelectionVoltage(bxr10, '24v'), true)
    assert.equal(filters.supportsSelectionVoltage(bxr10, '48v'), false)
    assert.equal(bxr10.specs.maxSpeed, 5000)
    for (const brake of brakes) {
      assert.equal(filters.supportsSelectionVoltage(brake, '24v'), true, `${brake.model}은 24 V 조건에 포함되어야 합니다.`)
    }

    // Catalog values, not the product-page values. The web pages put the release time in the
    // "Armature Pull-in Time" field and print a different total braking energy and spline mass.
    assert.equal(bxr10.specs.coilResistance, '26.8 Ω')
    assert.equal(bxr10.specs.coilPowerText, '21.5 W')
    assert.equal(bxr10.specs.armaturePullInTime, '0.110 초')
    assert.equal(bxr10.specs.armatureReleaseTime, '0.050 초')
    assert.equal(bxr10.specs.totalBrakingEnergy, '2.2×10⁶ J')
    assert.match(bxr10.specs.boreRangeText, /표준 24 mm/)

    const bxr06 = brakes.find((product) => product.id === 'mikipulley-bxr-06')
    assert.equal(bxr06.specs.armaturePullInTime, '0.050 초')
    assert.equal(bxr06.specs.armatureReleaseTime, '0.020 초')
    assert.equal(bxr06.specs.totalBrakingEnergy, '2.0×10⁶ J')
    assert.match(bxr06.specs.hubOptions, /BXR-06-20-005 \(1\.1 kg\)/)

    // BXR-LE needs its dedicated controller, and every frame shares the 35 ohm coil.
    const bxrLe = brakes.filter((product) => product.series === 'BXR-LE')
    assert.equal(bxrLe.length, 6)
    for (const brake of bxrLe) {
      assert.equal(brake.specs.coilResistance, '35 Ω')
      assert.match(brake.specs.brakeController, /BEM-24ESN7-120N/)
      assert.match(brake.specs.ratedVoltage, /24 VDC/)
    }

    // Backlash is published per hub style, so both figures must be recorded.
    for (const brake of brakes.filter((product) => product.series === 'BXR')) {
      assert.match(brake.specs.backlashText, /사각 허브.*스플라인 허브/)
    }

    // The new brake rows are rendered in the detail panel.
    const appSource = await readFile(appPath, 'utf8')
    for (const row of ['전용 컨트롤러', '코일 소비 전력', '해제 시간', '1회 허용 제동 일량']) {
      assert.ok(appSource.includes(`['${row}'`), `상세 사양에 '${row}' 행이 있어야 합니다.`)
    }

    // The brake category and both brake series carry an official representative image.
    const images = await vite.ssrLoadModule('/src/data/productImages.ts')
    const brakeTile = images.categoryProductImageFor('brake', 'mikipulley')
    assert.ok(brakeTile, '브레이크 카테고리에 대표 이미지가 있어야 합니다.')
    assert.match(brakeTile.src, /mikipulley-products\/bxr\.jpg$/)
    assert.match(brakeTile.sourceUrl, /^https:\/\/www\.mikipulley-us\.com\//)
    for (const brake of brakes) {
      const image = images.productImageFor(brake)
      assert.ok(image, `${brake.model}에 대표 이미지가 연결되어야 합니다.`)
      assert.match(image.src, /mikipulley-products\/bxr(-le)?\.jpg$/)
    }

    // Local public/ assets must be resolved against the deployment base path, otherwise every
    // bundled product photo 404s under the GitHub Pages subpath.
    const imagesSource = await readFile(new URL('../src/data/productImages.ts', import.meta.url), 'utf8')
    assert.match(imagesSource, /import\.meta\.env\.BASE_URL/)
    assert.match(imagesSource, /function withBasePath/)
    assert.match(imagesSource, /withResolvedSrc\(officialSeriesImages\[product\.model\]/)
    // Remote manufacturer images are left untouched.
    const komotek = motors.find((product) => product.series === 'KANZ')
    if (komotek) assert.match(images.productImageFor(komotek).src, /^https?:\/\//)

    // Both hub styles are recorded on every frame size so the part number can be picked.
    assert.ok(brakes.every((product) => typeof product.specs.hubOptions === 'string' && product.specs.hubOptions.length > 0))

    // Every brake must stay reachable from the torque filter. The shared 0.2 Nm floor
    // would strand the 0.06 and 0.14 Nm BXR-LE frames, so the floors follow the published range.
    const app = await readFile(appPath, 'utf8')
    assert.match(app, /const extendedTorqueFloors = \[0\.05, 0\.1, 0\.2, 0\.5, 1, 3, 5, 9, 15, 30, 60\]/)
    assert.match(app, /function torqueOptionsFor/)
    assert.match(app, /torqueOptionsFor\(catalogMotors, activeBrandId\)/)
    assert.match(app, /torqueOptionsFor\(selectionCandidateMotors, selectionManufacturer\)/)

    const torques = brakes.map((product) => product.specs.staticFrictionTorque)
    const smallest = Math.min(...torques)
    const largest = Math.max(...torques)
    const floors = [0.05, 0.1, 0.2, 0.5, 1, 3, 5, 9, 15, 30, 60].filter((value) => value > smallest && value <= largest)
    assert.deepEqual(floors, [0.1, 0.2, 0.5, 1, 3, 5, 9, 15, 30])
    // Each offered floor returns at least one brake, and the smallest frame is never stranded.
    for (const floor of floors) {
      assert.ok(brakes.some((product) => filters.selectionCapabilityValue(product) >= floor), `${floor} Nm 이상 조건에 해당하는 브레이크가 있어야 합니다.`)
    }
    assert.ok(smallest < floors[0], '최소 프레임은 하한 조건이 아니라 전체 조건으로만 도달합니다.')

    // Brakes label their supply the way the manufacturer sheet does.
    assert.match(app, /specs\.brakeAction \? '코일 전압' : '정격 전압'/)
  } finally {
    await vite.close()
  }
})

test('search keeps numeric queries precise and every capacity floor returns results', async () => {
  const vite = await createServer({
    root: process.cwd(),
    appType: 'custom',
    server: { middlewareMode: true },
  })

  try {
    const [{ motors }, filters, app] = await Promise.all([
      vite.ssrLoadModule('/src/data/motors.ts'),
      vite.ssrLoadModule('/src/utils/selectionFilters.ts'),
      readFile(appPath, 'utf8'),
    ])

    // Search matches per field. Concatenating every field into one string made "12 Nm" match
    // 12-bit, 12.5 A and 125 W — 77 hits where only 4 products actually published 12 Nm.
    assert.match(app, /function searchFields/)
    assert.match(app, /function matchesQuery/)
    assert.match(app, /const phraseMatches = products\.filter/)
    assert.doesNotMatch(app, /function toSearchText/)
    // Numeric-only torque is now searchable, so an exact torque query can work at all.
    for (const field of ['ratedTorque', 'maxTorque', 'holdingTorque', 'staticFrictionTorque']) {
      assert.ok(app.includes(`specs.${field} !== undefined ? \``), `${field}가 검색 대상에 있어야 합니다.`)
    }

    // Every offered capacity floor must return at least one product, for every brand.
    const brandByManufacturer = {
      Kinco: 'kinco', ROBOTIS: 'robotis', 'LS메카피온': 'ls-mecapion',
      KOMOTEK: 'komotek', FASTECH: 'fastech', '미키풀리': 'mikipulley',
    }
    const torqueFloors = [0.05, 0.1, 0.2, 0.5, 1, 3, 5, 9, 15, 30, 60]
    for (const [manufacturer, brandId] of Object.entries(brandByManufacturer)) {
      const products = motors.filter((product) => product.brand === manufacturer && product.lifecycle !== 'legacy')
      if (!products.length) continue
      const published = products.map(filters.selectionCapabilityValue).filter((value) => value > 0)
      if (!published.length) continue
      const usesTorque = filters.selectionCapabilityUnit(products[0]) === 'torque'
      if (!usesTorque) continue
      const smallest = Math.min(...published)
      const largest = Math.max(...published)
      const offered = torqueFloors.filter((value) => value > smallest && value <= largest)
      for (const floor of offered) {
        const hits = products.filter((product) => filters.selectionCapabilityValue(product) >= floor).length
        assert.ok(hits > 0, `${brandId}의 ${floor} Nm 하한은 결과가 있어야 합니다.`)
      }
      // FASTECH tops out at 12 Nm, so 15/30/60 must not be offered any more.
      if (brandId === 'fastech') {
        assert.equal(largest, 12)
        assert.deepEqual(offered.filter((value) => value > 12), [])
      }
    }

    // Voltage and protocol dropdowns are narrowed to options that actually match.
    assert.match(app, /const selectionVoltageChoices = useMemo/)
    assert.match(app, /const selectionProtocolChoices = useMemo/)
    assert.match(app, /\{selectionVoltageChoices\.map/)
    assert.match(app, /\{selectionProtocolChoices\.map/)

    // KOMOTEK and 미키풀리 publish no communication data, so no protocol option may survive for them.
    for (const manufacturer of ['KOMOTEK', '미키풀리']) {
      const products = motors.filter((product) => product.brand === manufacturer && product.lifecycle !== 'legacy')
      const anyProtocol = ['ethercat', 'canopen', 'modbus', 'profinet', 'pulse', 'ttl', 'rs485', 'uart']
        .some((protocol) => products.some((product) => filters.supportsSelectionProtocol(product, protocol)))
      assert.equal(anyProtocol, false, `${manufacturer}는 공개된 통신 정보가 없습니다.`)
    }

    // Dead code removed.
    assert.doesNotMatch(app, /function Metric\(/)
  } finally {
    await vite.close()
  }
})
