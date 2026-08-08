@echo off
setlocal
cd /d "%~dp0"
title Magicup-Work-Flow - PC 실행

set PORT=5173
set URL=http://localhost:%PORT%

for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty IPAddress)"`) do set WIFI_IP=%%A
if not defined WIFI_IP set WIFI_IP=Wi-Fi 연결을 확인하세요
set PHONE_URL=http://%WIFI_IP%:%PORT%

echo.
echo Magicup-Work-Flow를 PC와 휴대폰에서 함께 쓸 수 있도록 실행합니다.
echo PC 주소: %URL%
echo 휴대폰 주소(같은 Wi-Fi): %PHONE_URL%
echo.

powershell -NoProfile -Command "$listener = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if ($listener) { exit 1 } else { exit 0 }"
if %ERRORLEVEL% EQU 1 goto :already_running

echo 서버를 시작합니다. 준비되면 브라우저가 자동으로 열립니다...
start "Magicup-Work-Flow 서버" /min cmd /k "npm run dev:lan -- --strictPort"

set /a tries=0

:wait_loop
set /a tries+=1
powershell -NoProfile -Command "$listener = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if ($listener) { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 goto :open_browser
if %tries% GEQ 30 goto :timeout
timeout /t 1 /nobreak >nul
goto :wait_loop

:timeout
echo 서버 준비를 30초 넘게 기다렸습니다. 서버 창(최소화됨)에서 오류가 없는지 확인해 주세요.
goto :open_browser

:open_browser
start "" "%URL%"
echo.
echo 브라우저를 열었습니다. 휴대폰에서는 %PHONE_URL% 로 접속하세요(같은 Wi-Fi 필요).
echo 이 창은 닫아도 됩니다.
echo 최소화된 "Magicup-Work-Flow 서버" 창은 서버가 실행되는 동안 열려 있어야 합니다.
echo (서버를 끄려면 그 창을 열어 Ctrl+C를 누르거나 창을 닫으세요.)
goto :end

:already_running
echo 이미 5173 포트에서 실행 중입니다. 브라우저만 엽니다.
echo 휴대폰에서는 %PHONE_URL% 로 접속하세요.
start "" "%URL%"
goto :end

:end
endlocal
