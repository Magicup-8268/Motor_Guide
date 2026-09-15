# 맥슨 내장 모터 강조 R02

확인일: 2026-09-15 KST. 원본 승격 전 검토본이며 R01 수정사항을 포함합니다.

## 적용

- ROBOTIS 공식 사양에 Coreless(Maxon)으로 명시된 등록 모델 19개: XH 8개, XD 4개, XW 4개, MX-28/64/106 3개.
- 상세 상단 강조 배지, 내장 모터 제조사 사양 행, 공식 근거 링크와 확인일을 표시합니다.
- 기존 비교표 및 엑셀 공통 행에 내장 모터 제조사를 표시합니다.
- 미확인 모델은 맥슨 미적용 판정이 아닙니다. 코어리스라는 이유만으로 맥슨이라고 추정하지 않습니다.
- 공식 근거: https://emanual.robotis.com/docs/en/dxl/x/ 및 https://emanual.robotis.com/docs/en/dxl/mx/ (2026-09-15 KST 확인).

## 검증

- npm run build 성공. node --test --test-reporter=tap tests/*.test.mjs: 50개 통과, 실패 0개.
- COWORK.cmd test 통과. git diff --check 통과.
- 375/768/1440px 브라우저 확인: 배지와 공식 링크 줄바꿈, 화면 경계 내 표시 확인. 브라우저 오류 로그 없음.
- localhost:5175 HTTP 200. PC http://localhost:5175/ / 동일 Wi-Fi http://192.168.0.11:5175/.
- 직접 확인: http://localhost:5175/#model=robotis-xh430-v350-r

## 보존 및 복구

원본 D:/Magicup/MY_WORK/Motor_Guide의 코드와 5173 서버는 변경하지 않았습니다. 본 검토본은 별도 브랜치 codex/maxon-highlight-r02에 있습니다. 승인 전 원본에 병합하지 않습니다.

수정 전 읽기 전용 백업:
- OUTPUT/originals/App_20260915_203534_ORIGINAL.tsx — SHA256 624AC7413A7635387315B91FB4816A362AC7C06B899EAC190AC3A594DFB2DE7F
- OUTPUT/originals/styles_20260915_203534_ORIGINAL.css — SHA256 385B5E1ED5793A69AB5A6CDA257B24E9293538BA0F1737391DE81050A7022939

## 비용·부하 경계

추가 의존성/외부 API/DB/예약 작업/클라우드 배포 없음. 공식 링크는 사용자가 클릭할 때만 방문합니다. 렌더링은 고정 16개 Set 및 MX 모델 코드 검사입니다.
가정: 일 100회 상세 확인, 3배 피크 300회(월 3,000/9,000회). 추가 API 요청 및 DB 읽기/쓰기: 일·월 모두 0. 빌드 JS는 R01 428.87 kB에서 R02 430.13 kB(비압축)로 약 1.26 kB 증가; 매번 캐시 없이 받는 보수적 추가 전송량 월 약 3.78/11.34 MB.
기존 전체 서비스의 운영 부하·공급자 할당량은 이번 변경 검증 범위가 아니며 UNKNOWN. 새 공급자가 없어 신규 할당량·알림 설정은 해당 없음. 프로덕션 안전 인증이나 외부 배포를 수행한 것은 아닙니다. 복구는 원본 5173 사용으로 가능하며 원본 파일 교체가 필요 없습니다.
