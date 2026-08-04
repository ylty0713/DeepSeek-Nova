@echo off
setlocal
cd /d "%~dp0desktop"
if not exist "node_modules\electron\dist\electron.exe" (
  echo Installing desktop runtime for the first launch...
  call npm install
  if errorlevel 1 (
    echo.
    echo Installation failed. Check the network and Node.js, then try again.
    pause
    exit /b 1
  )
  if not exist "node_modules\electron\dist\electron.exe" (
    node node_modules\electron\install.js
  )
)
start "DeepSeek Nova" "node_modules\electron\dist\electron.exe" .
