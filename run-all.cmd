@echo off
setlocal
cd /d "%~dp0"

REM One-command launcher (Windows)
REM - Requires: Node.js 18+, Java 17+, Maven 3.8+
REM - Uses: backend/java-chassis/.env (if present)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-all.ps1" %*

endlocal
