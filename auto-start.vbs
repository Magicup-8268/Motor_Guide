Set objShell = CreateObject("WScript.Shell")
objShell.Run "cmd /c cd /d D:\Magicup\MY_WORK\Motor_Guide && npm run dev:lan -- --strictPort >> D:\Magicup\MY_WORK\Motor_Guide\logs\dev-server.log 2>&1", 0, False
