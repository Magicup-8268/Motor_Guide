param(
    [Parameter(Position = 0)]
    [ValidateSet('status', 'claim', 'test', 'handoff', 'release', 'help')]
    [string]$Action = 'status',

    [Parameter(Position = 1)]
    [string]$Agent = '',

    [Parameter(Position = 2)]
    [string]$TargetOrTask = '',

    [Parameter(Position = 3)]
    [string]$Summary = '',

    [Parameter(Position = 4)]
    [string]$Tests = '',

    [Parameter(Position = 5)]
    [string]$NextAction = ''
)

$ErrorActionPreference = 'Stop'
$Utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $Utf8
$OutputEncoding = $Utf8

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$StateDir = Join-Path $ProjectRoot '.cowork'
$ConfigPath = Join-Path $StateDir 'project.json'
$ActiveStatePath = Join-Path $StateDir 'ACTIVE.json'
$HandoffPath = Join-Path $ProjectRoot 'HANDOFF.md'
$HandoffLogPath = Join-Path $ProjectRoot 'HANDOFF_LOG.md'
$AllowedAgents = @('CODEX', 'CLAUDE')

if (-not (Test-Path -LiteralPath $ConfigPath)) {
    throw "프로젝트 설정이 없습니다: $ConfigPath"
}
$Config = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json

function Get-KstTimestamp {
    $kst = [System.TimeZoneInfo]::FindSystemTimeZoneById('Korea Standard Time')
    return [System.TimeZoneInfo]::ConvertTimeFromUtc([DateTime]::UtcNow, $kst).ToString('yyyy-MM-dd HH:mm:ss')
}

function Assert-GitRepository {
    & git -C $ProjectRoot rev-parse --is-inside-work-tree 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'Git 저장소가 초기화되지 않았습니다.'
    }
}

function Get-GitHead {
    $head = (& git -C $ProjectRoot rev-parse --short HEAD 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return 'NO-COMMIT'
    }
    return ($head | Select-Object -First 1).Trim()
}

function Get-GitStatus {
    return @(& git -C $ProjectRoot status --porcelain)
}

function Assert-Agent([string]$Value) {
    $normalized = $Value.ToUpperInvariant()
    if ($AllowedAgents -notcontains $normalized) {
        throw "에이전트는 CODEX 또는 CLAUDE여야 합니다: $Value"
    }
    return $normalized
}

function Read-ActiveState {
    if (-not (Test-Path -LiteralPath $ActiveStatePath)) {
        return $null
    }
    return Get-Content -LiteralPath $ActiveStatePath -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Show-Status {
    Write-Host ''
    Write-Host "=== $($Config.projectName) · COWORK STATUS ===" -ForegroundColor Cyan
    Write-Host "기준 원본: $($Config.sourceOfTruth)"
    $state = Read-ActiveState
    if ($null -eq $state) {
        Write-Host '작업 잠금: 없음'
    }
    else {
        Write-Host '작업 잠금: ACTIVE'
        Write-Host "소유자: $($state.agent)"
        Write-Host "작업: $($state.task)"
        Write-Host "시작: $($state.startedAtKst) KST"
        Write-Host "기준 커밋: $($state.baseCommit)"
    }

    Write-Host ''
    Write-Host '--- 현재 인수인계 ---' -ForegroundColor Cyan
    Get-Content -LiteralPath $HandoffPath -Encoding UTF8

    Write-Host ''
    Write-Host '--- Git 상태 ---' -ForegroundColor Cyan
    & git -C $ProjectRoot status --short --branch

    Write-Host ''
    Write-Host '--- 최근 커밋 ---' -ForegroundColor Cyan
    & git -C $ProjectRoot log -3 --oneline 2>$null
}

function Claim-Work {
    Assert-GitRepository
    $owner = Assert-Agent $Agent
    $task = $TargetOrTask.Trim()
    if ([string]::IsNullOrWhiteSpace($task)) {
        throw '작업명을 입력하십시오.'
    }

    $dirty = Get-GitStatus
    if ($dirty.Count -gt 0) {
        throw "미커밋 변경이 있어 작업을 시작할 수 없습니다.`n$($dirty -join [Environment]::NewLine)"
    }

    $current = Read-ActiveState
    if ($null -ne $current) {
        if ($current.agent -eq $owner) {
            Write-Host "$owner 에이전트가 이미 작업을 점유하고 있습니다." -ForegroundColor Yellow
            return
        }
        throw "$($current.agent) 에이전트가 '$($current.task)' 작업 중입니다."
    }

    $state = [ordered]@{
        status       = 'ACTIVE'
        agent        = $owner
        task         = $task
        baseCommit   = Get-GitHead
        startedAtKst = Get-KstTimestamp
    }
    $state | ConvertTo-Json | Set-Content -LiteralPath $ActiveStatePath -Encoding UTF8
    Write-Host "$owner 작업 잠금 완료: $task" -ForegroundColor Green
}

function Run-ProjectTest {
    $testPath = Join-Path $ProjectRoot $Config.testScript
    if (-not (Test-Path -LiteralPath $testPath)) {
        throw "테스트 실행 파일이 없습니다: $testPath"
    }
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $testPath
    if ($LASTEXITCODE -ne 0) {
        throw '프로젝트 테스트가 실패했습니다.'
    }
}

function Handoff-Work {
    Assert-GitRepository
    $owner = Assert-Agent $Agent
    $target = Assert-Agent $TargetOrTask
    if ($owner -eq $target) {
        throw '보내는 에이전트와 받는 에이전트가 같습니다.'
    }
    if ([string]::IsNullOrWhiteSpace($Summary) -or
        [string]::IsNullOrWhiteSpace($Tests) -or
        [string]::IsNullOrWhiteSpace($NextAction)) {
        throw '변경 요약, 테스트 결과, 다음 작업을 모두 입력하십시오.'
    }

    $state = Read-ActiveState
    if ($null -eq $state) {
        throw '활성 작업 잠금이 없습니다. 먼저 claim을 실행하십시오.'
    }
    if ($state.agent -ne $owner) {
        throw "현재 작업 소유자는 $($state.agent)입니다."
    }

    $dirty = Get-GitStatus
    if ($dirty.Count -gt 0) {
        throw "기능 변경을 먼저 커밋하십시오.`n$($dirty -join [Environment]::NewLine)"
    }

    $timestamp = Get-KstTimestamp
    $workCommit = Get-GitHead
    $handoffText = @"
# 현재 인수인계

- 상태: ``READY``
- 보내는 에이전트: ``$owner``
- 받는 에이전트: ``$target``
- 기준 작업 커밋: ``$workCommit``
- 갱신시각(KST): ``$timestamp``

## 변경 요약

$Summary

## 테스트

$Tests

## 다음 작업

$NextAction
"@
    Set-Content -LiteralPath $HandoffPath -Value $handoffText -Encoding UTF8

    $logText = @"

## $timestamp KST · $owner → $target

- 기준 작업 커밋: ``$workCommit``
- 변경 요약: $Summary
- 테스트: $Tests
- 다음 작업: $NextAction
"@
    Add-Content -LiteralPath $HandoffLogPath -Value $logText -Encoding UTF8

    & git -C $ProjectRoot add -- HANDOFF.md HANDOFF_LOG.md
    & git -C $ProjectRoot commit -m "chore: handoff $owner to $target"
    if ($LASTEXITCODE -ne 0) {
        throw '인수인계 커밋 생성에 실패했습니다.'
    }

    Remove-Item -LiteralPath $ActiveStatePath -Force
    Write-Host "$owner → $target 인수인계 완료: $(Get-GitHead)" -ForegroundColor Green
}

function Release-Work {
    $owner = Assert-Agent $Agent
    $state = Read-ActiveState
    if ($null -eq $state) {
        Write-Host '해제할 작업 잠금이 없습니다.' -ForegroundColor Yellow
        return
    }
    if ($state.agent -ne $owner) {
        throw "현재 작업 소유자는 $($state.agent)입니다."
    }

    $dirty = Get-GitStatus
    if ($dirty.Count -gt 0) {
        throw "미커밋 변경이 있어 잠금을 해제할 수 없습니다.`n$($dirty -join [Environment]::NewLine)"
    }

    Remove-Item -LiteralPath $ActiveStatePath -Force
    Write-Host "$owner 작업 잠금을 해제했습니다." -ForegroundColor Green
}

function Show-Help {
    @'
COWORK 사용법

  COWORK.cmd status
  COWORK.cmd claim CODEX "작업명"
  COWORK.cmd claim CLAUDE "작업명"
  COWORK.cmd test
  COWORK.cmd handoff CODEX CLAUDE "변경 요약" "테스트 결과" "다음 작업"
  COWORK.cmd handoff CLAUDE CODEX "변경 요약" "테스트 결과" "다음 작업"
  COWORK.cmd release CODEX
  COWORK.cmd release CLAUDE
'@ | Write-Host
}

switch ($Action) {
    'status' { Assert-GitRepository; Show-Status }
    'claim' { Claim-Work }
    'test' { Run-ProjectTest }
    'handoff' { Handoff-Work }
    'release' { Release-Work }
    'help' { Show-Help }
}

