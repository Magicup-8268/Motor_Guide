# R06 공개 배포 사전 검증

- 확인일: 2026-09-16 KST. 사용자가 기존 공개 주소에 최신 R06 반영 승인.
- 대상: https://magicup-8268.github.io/Motor_Guide/
- 원본 d177ccb → 승인된 R06 c23e82f, fast-forward. 신규 호스팅·API·DB 없음.
- GH_PAGES=true, VITE_SERVER_API_AVAILABLE=false 빌드 성공. 53/53 테스트 통과, COWORK 구조 테스트 통과.
- 배포물 25파일, 11,788,056 bytes. JS gzip 122.28KB, CSS gzip 11.03KB. 브라우저 내 303개 제품 검색, 서버 API/DB 읽기·쓰기 0. 공개 서버에는 개인 선정 데이터 전송 안 함.

## 비용·부하 가정과 한계

개인 1명, 하루 검색 100회, 전체 파일 재다운로드 10회, 월 30일 가정. 정상/3배 피크: 검색 3,000/9,000회, 전체 로드 300/900회, 요청 상한 7,500/22,500회, 전송 3.5364/10.6093GB/월. 검색 자체는 로컬 O(303), 항목별 DB/API 호출 없음. 로컬 프로젝트 저장 300/900회/월. 최대 100개 프로젝트 JSON 690,670bytes, 300회 파싱 499.84ms는 R06 기존 실측. 브라우저 저장 한도는 UNKNOWN이며 실패 안내로 원본 보호.

공식 한도 확인: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), 2026-09-16 KST. 공개 저장소 GitHub Free 지원. 사이트 1GB, 월 대역폭 soft 100GB, 배포 10분 제한. custom Actions는 시간당 10 builds soft 제한 예외. 과다 요청 429, 초과 시 서비스 제한 가능. 월 리셋의 정확한 시각은 해당 문서 미공개.

정상 추정 3.54%, 피크 10.61%. 실제 공개 방문량·CDN 캐시·누적 대역폭은 UNKNOWN. 50/70/85% 대역폭 알림은 미설정이며 제공 여부 미검증. 따라서 무료 한도 안전 보장 또는 운영 안전 완료 판정은 하지 않음. 지속 모니터링 예약 없음. 대량 공개 홍보 전 실제 분석 계측 필요. 모든 검색마다 전체 재로드 시 피크 106.09GB로 한도 초과하므로 해당 사용 모델은 승인 대상 아님.

## 배포 경계·복구

기존 Actions의 dist만 공개. PDF/ZIP 서버 프록시 미제공, 제조사 공식 자료실로 안내. 즐겨찾기·선정함은 각 브라우저 저장소에만 보관되며 기기 간 자동 동기화 없음. 장애 시 이전 d177ccb의 배포 artifact로 재배포 또는 승인 후 후속 revert 커밋; force push 금지. 배포 후 HTTP/실제 화면/console 확인 별도 기록.

## 원본 보존

읽기 전용 백업 폴더: OUTPUT/originals/deploy_20260916_074428. 파일 접미사 `_20260916_074428_ORIGINAL`.

|원본|SHA-256|
|---|---|
|HANDOFF.md|8DE2CFBCAB8DA5FA6F39F0DDCABE4CDC461217FD41B2231A81E316D0424E9535|
|HANDOFF_LOG.md|A3644E748AE6DA42FA8065124D933F028906173DDDC9BC433CBAC98F13ED921C|
|README.md|242BB19CBF1EEEF26875C746EF83338DDF0B8DB225F1A352EDD9620630AA8809|
|src/App.tsx|C188D392BEA9A50C4AA3C76D2726B1BD0BB2D43C1E975E306ACDBCADE68F356C|
|src/styles.css|CEA18B4D39363F2F690A05485698B57520C2DF14B1A4F61A00CD4392FB131FD7|
|src/utils/selectionFilters.ts|C59A48DAF8D7D893E37DFAE96E2EC5BBE674B803954F2A10C7E703921A1A28DC|
|tests/official-links.test.mjs|9D056C4AD497704D9003F2669413018566103FA11E7459FEC3803685DFB7E230|
|vite.config.ts|E8F3B94588AC58D88C0ABF921D883D343B1D2E8309F5FE8A9C2E74B8E4D53DF0|
