# Magicup-Work-Flow · Motor Guide

KINCO, ROBOTIS DYNAMIXEL, LS메카피온, KOMOTEK의 모터·액추에이터를 공식 공개 사양 기준으로 검색·필터·비교하는 로컬 우선 PWA입니다.

## 접속 방법

### 1) 온라인 (GitHub Pages) — Wi-Fi·IP 무관, PC·휴대폰 모두 가능

<https://magicup-8268.github.io/Motor_Guide/>

`main` 브랜치에 푸시될 때마다 GitHub Actions(`.github/workflows/deploy-pages.yml`)가 자동으로 빌드·배포합니다. 서버가 없는 정적 사이트이므로 아래 기능은 이 주소에서 지원되지 않고 안내 메시지만 표시됩니다(2번 PC 로컬 실행에서만 가능).

- 비교표 엑셀 다운로드
- 공식 매뉴얼 PDF · 도면 ZIP 열기

### 2) PC 로컬 실행 — 위 기능 전체 포함

```powershell
npm install
npm run dev
```

같은 Wi-Fi의 휴대폰에서 확인할 때는 아래 명령을 사용합니다.

```powershell
npm run dev:lan
```

`PC용_실행.cmd` / `휴대폰용_실행.cmd`를 더블클릭해도 동일하게 실행됩니다.

프로덕션 빌드 검증은 `npm run build`입니다. GitHub Pages용 정적 빌드를 로컬에서 재현하려면 `GH_PAGES=true`와 `VITE_SERVER_API_AVAILABLE=false` 환경변수를 설정한 뒤 `npm run build`를 실행합니다.

## 제공 기능

- 제조사별 카테고리, 모델명·종류·토크·출력·전압·통신 방식 통합 검색
- 모터 유형 및 제조사별 최소 출력 또는 공개 토크 필터
- 제품군 카드에서 모델·용량 하위 목록 열기
- 사양 상세, 공식 원문 열기, 최대 3개 모델 비교
- DYNAMIXEL 현재 라인업과 공식 레거시 자료 분리, 제품군별 토크 기준 표시
- 모델 선택 시 공식 원문 매뉴얼·다운로드와 한글 요약 번역 안내 제공
- 즐겨찾기와 최근 확인 모델의 브라우저 로컬 저장
- `Ctrl/Cmd + K` 빠른 검색, PWA 설치용 매니페스트·오프라인 셸
- Pretendard Variable 로컬 번들 (네트워크 글꼴에 의존하지 않음)

## 데이터 관리

- 기본 데이터·분류: [src/data/motors.ts](src/data/motors.ts)
- Kinco 공식 카탈로그 정규화 데이터: [src/data/kincoCatalog.ts](src/data/kincoCatalog.ts)
- ROBOTIS·LS메카피온·KOMOTEK 공식 카탈로그 정규화 데이터: [src/data/externalCatalog.ts](src/data/externalCatalog.ts)
- 타입: [src/types.ts](src/types.ts)
- 화면/상호작용: [src/App.tsx](src/App.tsx)
- 디자인 토큰/반응형: [src/styles.css](src/styles.css)

2026-07-15(KST) 기준으로 각 제조사 공식 제품 페이지와 e-Manual에서 확인한 모델/시리즈를 반영했습니다. 공개 수치가 없는 항목은 모델명과 원문 링크만 제공하며, 값을 추정하지 않습니다. DYNAMIXEL은 X·MX·AX 계열의 스톨 토크와 Y·P 계열의 연속/최대 토크를 같은 숫자로 직접 비교하지 않도록 기준을 함께 표시합니다.

매뉴얼 화면의 한글 내용은 공식 제품 페이지의 공개 정보에 대한 요약 번역입니다. 배선도·파라미터·안전 절차는 각 모델의 Kinco 원문 매뉴얼을 기준으로 확인해야 합니다.

## 공식 출처

- [Kinco Product Center](https://www.kincoautomation.com/)
- [FMK Series Frameless Torque Motor](https://www.kincoautomation.com/product/robot/fmk)
- [iSMD Integrated Servo Motor](https://www.kincoautomation.com/product/robot/ismd-2)
- [SMC Series AC Servo Motor](https://www.kincoautomation.com/product/automation/smc)
- [FMC Frameless Torque Motor](https://www.kincoautomation.com/product/robot/fmc)
- [Low Voltage Servo Motor](https://www.kincoautomation.com/products/automation/servo-motor/low-voltage-servo-motor)
- [Stepper Motor](https://www.kincoautomation.com/product/automation/stepper)
- [ROBOTIS DYNAMIXEL e-Manual](https://emanual.robotis.com/docs/en/dxl/)
- [LS메카피온 모터 제품군](https://www.lsmecapion.com/bbs/board.php?bo_table=pd_motor)
- [KOMOTEK Servo System](http://komotek.com/ko/products-servo-system/)
