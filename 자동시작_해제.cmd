@echo off
setlocal

echo Magicup-Work-Flow 자동 시작 등록을 해제합니다.
schtasks /delete /tn "Magicup-Work-Flow AutoStart" /f

echo.
echo 해제되었습니다. 다음 로그인부터는 서버가 자동으로 켜지지 않습니다.
echo 지금 이미 실행 중인 서버는 그대로 유지되니, 끄려면 작업 관리자에서
echo node.exe 프로세스를 종료하거나 PC를 재부팅하세요.
echo.
pause
endlocal
