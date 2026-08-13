@echo off
setlocal
cd /d "%~dp0"
title Magicup-Work-Flow - 폰으로 열기

set PORT=5173

rem Wi-Fi IP는 공유기 DHCP로 바뀌므로 실행할 때마다 새로 찾는다.
for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty IPAddress)"`) do set WIFI_IP=%%A
if not defined WIFI_IP goto :no_wifi

set PHONE_URL=http://%WIFI_IP%:%PORT%

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if %ERRORLEVEL% EQU 1 goto :ready

echo.
echo 서버를 시작합니다. 잠시 기다려 주세요...
start "Magicup-Work-Flow 서버" /min cmd /k "npm run dev:lan -- --strictPort"

set /a tries=0
:wait_loop
set /a tries+=1
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 goto :ready
if %tries% GEQ 30 goto :timeout
timeout /t 1 /nobreak >nul
goto :wait_loop

:timeout
echo.
echo 서버 준비를 30초 넘게 기다렸습니다.
echo 최소화된 "Magicup-Work-Flow 서버" 창에서 오류를 확인해 주세요.

:ready
echo.
echo ============================================================
echo.
echo    휴대폰 브라우저에서 아래 주소를 여세요
echo.
echo        %PHONE_URL%
echo.
echo    PC와 같은 Wi-Fi에 연결되어 있어야 합니다.
echo.
echo ------------------------------------------------------------
echo.
echo    한 번 열고 나서 브라우저 메뉴에서
echo    "홈 화면에 추가"를 누르면 앱 아이콘이 생겨
echo    다음부터는 주소를 입력하지 않아도 됩니다.
echo.
echo    Wi-Fi 없이 어디서나 쓰려면 아래 주소를 쓰세요.
echo    PDF, BOM 내려받기는 위 주소에서만 됩니다.
echo.
echo        https://magicup-8268.github.io/Motor_Guide/
echo.
echo ============================================================
echo.
echo 이 창은 닫아도 서버는 계속 실행됩니다.
echo.
pause
goto :end

:no_wifi
echo.
echo Wi-Fi 연결을 확인해 주세요. 현재 Wi-Fi IP를 찾지 못했습니다.
echo 유선 LAN만 연결된 경우에는 아래 온라인 주소를 사용하세요.
echo.
echo     https://magicup-8268.github.io/Motor_Guide/
echo.
pause

:end
endlocal
