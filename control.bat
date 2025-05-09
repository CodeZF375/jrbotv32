@echo off
REM Launch the Node.js admin console for bot control
REM Make sure adminConsole.js is in the same directory as this batch file

echo Starting Discord Bot Admin Console...
node adminConsole.js

echo.
echo The admin console has exited. Press any key to close this window...
pause >nul