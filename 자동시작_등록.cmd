@echo off
setlocal
cd /d "%~dp0"

if not exist logs mkdir logs

echo.
echo Magicup-Work-Flow 서버를 "윈도우 로그인 시 화면 없이 자동 실행"으로 등록합니다.
echo (관리자 권한 필요 없음. 이 PC의 현재 로그인 계정에만 적용됩니다.)
echo.

schtasks /create /tn "Magicup-Work-Flow AutoStart" /tr "wscript.exe %~dp0auto-start.vbs" /sc onlogon /rl limited /f
if errorlevel 1 goto :fail

echo.
echo 등록 완료. 다음 로그인부터 서버가 보이는 창 없이 자동으로 켜집니다.
echo 로그: logs\dev-server.log
echo.

choice /c YN /n /m "지금 바로 서버를 시작할까요? (Y/N): "
if errorlevel 2 goto :end

start "" wscript.exe "%~dp0auto-start.vbs"
echo 서버를 백그라운드에서 시작했습니다. 5~10초 후 http://localhost:5173 을 열어보세요.
goto :end

:fail
echo.
echo 등록에 실패했습니다. 위 오류 메시지를 확인해 주세요.

:end
echo.
pause
endlocal
