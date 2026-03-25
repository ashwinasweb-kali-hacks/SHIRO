@echo off
title Shiro AI - Studio Host
color 0A
cls

echo.
echo ========================================================
echo   SHIRO AI  -  Unified Local Studio Host
echo ========================================================
echo.

:: -------------------------------------------------------------------
:: [1/5] Checking Ollama Engine
:: -------------------------------------------------------------------
echo [1/5] Checking Ollama AI Engine...
curl -s http://localhost:11434/api/tags > NUL
if %ERRORLEVEL% NEQ 0 (
    echo [!] Ollama is not running. Starting it now...
    start "Ollama Engine" cmd /c "ollama serve"
    timeout /t 5 /nobreak > NUL
) else (
    echo [^] Ollama is already running!
)

:: -------------------------------------------------------------------
:: [2/5] Starting Ollama Bridge (Node.js)
:: -------------------------------------------------------------------
echo.
echo [2/5] Starting Ollama Bridge (Port 3000)...
if exist "Ollama\package.json" (
    cd Ollama
    start "Ollama Bridge" cmd /c "npm start"
    cd ..
) else (
    echo [!] Ollama bridge directory not found! Skipping.
)
timeout /t 2 /nobreak > NUL

:: -------------------------------------------------------------------
:: [3/5] Starting Shiro AI Backend (Python)
:: -------------------------------------------------------------------
echo.
echo [3/5] Starting Shiro AI Backend (Port 8000)...
if exist "Backend\venv\Scripts\python.exe" (
    cd Backend
    start "Shiro Backend" cmd /c ".\venv\Scripts\python main.py"
    cd ..
) else (
    echo [!] Shiro Backend virtual environment not found! Skipping.
)
timeout /t 4 /nobreak > NUL

:: -------------------------------------------------------------------
:: [4/5] Starting Public Cloudflare Tunnel
:: -------------------------------------------------------------------
echo.
echo [4/5] Starting Public HTTPS Tunnel...
if not exist cloudflared.exe (
    echo [Downloading] cloudflared.exe from Cloudflare...
    curl -L -o cloudflared.exe "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
)
start "Cloudflare Tunnel" cmd /c "cloudflared.exe tunnel --url http://localhost:3000"

:: -------------------------------------------------------------------
:: [5/5] Dashboard and Information
:: -------------------------------------------------------------------
echo.
echo ========================================================
echo   HOSTING DASHBOARD
echo ========================================================
echo.

:: Get Local IP
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do set IP=%%a
echo   [LOCAL CONNECTION]:
echo   PC IP: %IP%
echo   (Use this if you are on the same Wi-Fi)
echo.

echo   [REMOTE CONNECTION]:
echo   IMPORTANT: In the "Cloudflare Tunnel" window, look for a 
echo   URL ending with ".trycloudflare.com".
echo   Enter that URL in your Shiro App settings to connect!
echo.

echo   [WEB ACCESS]:
echo   Local App: http://localhost:8000
echo   Remote (if deployed): https://shiro-ai.netlify.app
echo ========================================================
echo.
echo   Keep this dashboard open while using Shiro AI.
echo   Close all secondary windows to stop services.
echo.
pause
