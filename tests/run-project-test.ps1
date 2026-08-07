$ErrorActionPreference = 'Stop'
$Utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $Utf8
$OutputEncoding = $Utf8

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ConfigPath = Join-Path $ProjectRoot '.cowork\project.json'

if (-not (Test-Path -LiteralPath $ConfigPath)) {
    throw "프로젝트 설정이 없습니다: $ConfigPath"
}

$config = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
$sourcePath = Join-Path $ProjectRoot $config.sourceOfTruth

foreach ($required in @(
    'COWORK_RULES.md',
    'AGENTS.md',
    'CLAUDE.md',
    'PROJECT_CONTEXT.md',
    'HANDOFF.md',
    'HANDOFF_LOG.md'
)) {
    $path = Join-Path $ProjectRoot $required
    if (-not (Test-Path -LiteralPath $path)) {
        throw "필수 공동개발 파일이 없습니다: $required"
    }
}

if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "기준 원본이 없습니다: $sourcePath"
}

$agentsContent = Get-Content -LiteralPath (Join-Path $ProjectRoot 'AGENTS.md') -Raw -Encoding UTF8
if ($agentsContent -notmatch [regex]::Escape('투 클로드')) {
    throw 'AGENTS.md에 간편 인수인계 명령이 없습니다: 투 클로드'
}
if ($agentsContent -notmatch [regex]::Escape('투 코워크')) {
    throw 'AGENTS.md에 간편 인수인계 명령이 없습니다: 투 코워크'
}
if ($agentsContent -notmatch [regex]::Escape('이어받기')) {
    throw 'AGENTS.md에 간편 이어받기 명령이 없습니다: 이어받기'
}

$claudeContent = Get-Content -LiteralPath (Join-Path $ProjectRoot 'CLAUDE.md') -Raw -Encoding UTF8
if ($claudeContent -notmatch [regex]::Escape('투 코덱스')) {
    throw 'CLAUDE.md에 간편 인수인계 명령이 없습니다: 투 코덱스'
}
if ($claudeContent -notmatch [regex]::Escape('이어받기')) {
    throw 'CLAUDE.md에 간편 이어받기 명령이 없습니다: 이어받기'
}

& git -C $ProjectRoot rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'Git 저장소가 아닙니다.'
}

Write-Host "PASS: $($config.projectName) 공동개발 구조와 기준 원본 확인"
Write-Host "SOURCE: $($config.sourceOfTruth)"
Write-Host '주의: 프로젝트 고유 기능 테스트를 tests\run-project-test.ps1에 추가하십시오.'
