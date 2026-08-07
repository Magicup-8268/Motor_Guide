# 코덱스·클로드 공동개발 규칙

## 단일 기준 원본

- 프로젝트 루트: `D:\Magicup\MY_WORK\Motor_Guide`
- 기준 원본: `.`
- 변경 이력: 프로젝트 루트의 Git 저장소
- 현재 인수인계: `HANDOFF.md`

두 에이전트는 같은 프로젝트 루트를 직접 열고 순차적으로 작업한다. 파일 수정시각이나 크기가 아니라 Git 커밋을 최신 기준으로 사용한다.

## 작업 절차

1. `COWORK.cmd status`로 현재 상태를 확인한다.
2. `COWORK.cmd claim CODEX "작업명"` 또는 `COWORK.cmd claim CLAUDE "작업명"`으로 점유한다.
3. 다른 에이전트가 작업 중이면 수정하지 않는다.
4. 기준 원본을 직접 수정한다.
5. `COWORK.cmd test`를 통과시킨다.
6. 기능 변경을 Git에 커밋한다.
7. 작업 트리가 깨끗할 때 `handoff`를 실행한다.

## 인수인계

```powershell
.\COWORK.cmd handoff CLAUDE CODEX "변경 요약" "테스트 결과" "다음 작업"
.\COWORK.cmd handoff CODEX CLAUDE "변경 요약" "테스트 결과" "다음 작업"
```

인수인계 명령은 `HANDOFF.md`, `HANDOFF_LOG.md`, 인수인계 커밋을 생성한다.

## 간편 대화 명령

| 명령 | 의미 |
|---|---|
| `이어받기` | 현재 에이전트가 `status`와 `HANDOFF.md`를 확인하고 자신에게 온 작업을 `claim`한 뒤 계속 진행 |
| `투 코워크` 또는 `투 클로드` | 코덱스가 테스트·기능 커밋 후 클로드로 `handoff` |
| `투 코덱스` | 클로드가 테스트·기능 커밋 후 코덱스로 `handoff` |

간편 명령은 안전 절차를 생략하는 명령이 아니다. 테스트 실패, 다른 에이전트의 잠금, 관련 없는 미커밋 변경이 있으면 인수인계를 중단하고 원인을 보고한다.

## 안전 규칙

- 미커밋 변경이 있는 상태에서 상대방 파일을 덮어쓰지 않는다.
- `git reset --hard`, 강제 체크아웃, 강제 푸시로 상대방 작업을 삭제하지 않는다.
- 비밀정보와 개인정보를 저장소에 넣지 않는다.
- 프로젝트별 안전 경계는 `PROJECT_CONTEXT.md`를 따른다.
- 병렬 작업이 필요하면 별도 branch/worktree를 사용한다.

## 보조 교환 폴더

`TO_COWORK`, `FROM_COWORK`, `claude_handoff`는 직접 프로젝트 공유가 불가능할 때만 사용하며 Git에서 제외한다.
