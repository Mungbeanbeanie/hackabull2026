@echo off
setlocal
cd /d "%~dp0"

REM One-command launcher (Windows)
REM - Requires: Node.js 18+, Java 17+, Maven 3.8+
REM - Canonical launcher is the cross-platform ./run-all (Node script)

node "%~dp0run-all" %*

endlocal
