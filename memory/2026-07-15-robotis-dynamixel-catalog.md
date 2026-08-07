# ROBOTIS DYNAMIXEL 카탈로그 보정 기록

- 증상: ROBOTIS 탭이 일부 X-Series 12개만 단일 제품군으로 보였고, 실제 DYNAMIXEL 통신(TTL, RS-485, UART)을 선정·보고서 필터에서 고를 수 없었다.
- 근본 원인: `externalCatalog.ts`가 X-Series 일부 대표 모델만 보유했고, 제품군 필드가 없었으며, 프런트엔드와 PDF 보고서 검증기의 통신 옵션이 산업용 필드버스만 허용했다.
- 조치: Y(12), P(6), X 확장, MX(4) 제품군을 추가하고 `family` 필드를 기반으로 DYNAMIXEL 제품군 필터를 만들었다. TTL·RS-485·UART를 화면 및 PDF 보고서 검증기에 함께 등록했다. X 계열의 XM/XH/XD/XL/XC 잘못된 시리즈 라벨도 수정했다.
- 근거: ROBOTIS DYNAMIXEL e-Manual의 Y, P, X, MX 제품군 및 개별 사양 페이지를 2026-07-15에 대조했다.
- 검증: `npm run test:links` 35/35 통과, `npm run build` 통과, UART 및 RS-485 조건의 `/api/selection-report-pdf` 요청 모두 HTTP 200 및 `application/pdf` 반환.
