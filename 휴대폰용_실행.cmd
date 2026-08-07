@echo off
setlocal
cd /d "%~dp0"
title Magicup-Work-Flow - 휴대폰 LAN 실행

echo.
echo Magicup-Work-Flow를 같은 Wi-Fi의 휴대폰에서 사용할 수 있도록 실행합니다.
echo 휴대폰 주소: http://192.168.1.24:5173
echo.
echo 이 창을 닫으면 휴대폰 접속도 종료됩니다.
echo.

powershell -NoProfile -Command "$listener = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue; if ($listener) { Write-Host '이미 5173 포트에서 실행 중입니다. 휴대폰 주소를 열어 주세요.'; exit 1 }"
if %ERRORLEVEL% EQU 1 goto :already_running

call npm run dev:lan -- --strictPort
goto :end

:already_running
pause

:end
endlocal
