@echo off
cd /d "%~dp0"

where uv >nul 2>nul
if %ERRORLEVEL%==0 (
    echo [Info] Starting server with uv...
    uv run server.py
) else (
    echo [Info] "uv" not found in PATH, falling back to standard Python...
    python server.py
)

pause
