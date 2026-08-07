# Kinco 공식 링크 404 조사 기록

- 날짜: 2026-07-14 (KST)
- 증상: Motor Atlas의 `공식 페이지` 버튼이 일부 Kinco 제품에서 404 화면으로 연결됨.
- 근본 원인: 카탈로그에 Kinco의 숫자형 구 경로(`/product/229`, `/product/230` 등)가 저장되어 있었음. 현재 Kinco 제품 센터 메뉴는 `/product/robot/ismk-2`, `/product/robot/md-2`와 같은 제품군 경로를 사용함. 구 경로는 HTTP 200을 반환하더라도 실제 404 템플릿을 내려줄 수 있었음.
- 수정: iSMK, MD, iSWV, iWMC, SMK/SMH AC 서보, SMC/SMK 48V·96V DC 서보 링크를 현재 제품 센터 경로로 교체.
- 회귀 방지: `tests/official-links.test.mjs`를 추가하고 `npm run test:links` 스크립트를 등록. 구 경로가 다시 들어오면 테스트가 실패함.
- 검증: 2026-07-14에 회귀 테스트 통과, `npm run build` 통과, 교체한 9개 URL 모두 HTTP 200 및 제품 페이지 표식 확인.
- 상태: DONE
