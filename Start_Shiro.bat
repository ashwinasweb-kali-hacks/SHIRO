@echo off
title Shiro AI Launcher
color 0A
cls
echo.
echo  ============================================
echo      SHIRO AI  -  Local Studio Launcher
echo  ============================================
echo.

echo [1/4] Checking Ollama Engine...
curl -s http://localhost:11434/api/tags > NUL
if %ERRORLEVEL% NEQ 0 (
    echo [!] Ollama is not running. Starting it now...
    start "Ollama" cmd /c "ollama serve"
    timeout /t 5 /nobreak > NUL
) else (
    echo [^] Ollama is already running!
)

echo.
echo [2/4] Starting Ollama Bridge (Port 3000)...
cd Ollama
start "Ollama Bridge" cmd /c "npm start"
cd ..
timeout /t 2 /nobreak > NUL

echo.
echo [3/4] Starting Shiro AI Backend...
cd Backend
:: Check if venv exists
if not exist "venv\Scripts\python.exe" (
    echo [!] Virtual environment not found. Please run install_backend.bat or setup manually.
    pause
    exit /b
)
start "Shiro Backend" cmd /k ".\venv\Scripts\python main.py"
cd ..
timeout /t 4 /nobreak > NUL

echo.
echo [4/4] Network Information (for Mobile Connection)
echo  --------------------------------------------
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do set IP=%%a
echo   Your PC's Local IP: %IP%
echo   Use this IP in your Mobile App settings!
echo  --------------------------------------------

echo.
echo  Opening Shiro AI on Netlify...
:: CHANGE THIS URL to your specific Netlify site if different
set NETLIFY_URL=https://shiro-ai.netlify.app
start "" "%NETLIFY_URL%"

echo.
echo  ============================================
echo   Shiro AI Services are running:
echo   - Hosted Application: %NETLIFY_URL%
echo   - Local Studio (Port 8000): http://localhost:8000
echo   - Ollama Bridge (Port 3000): http://localhost:3000
echo   - Ollama Engine (Port 11434): http://localhost:11434
echo  ============================================
echo.
echo  [P] Package for Netlify (Create clean 'dist' folder)
echo  [ANY KEY] Continue to keep services running...
echo.
set /p CHOICE=Choose an option: 

if /i "%CHOICE%"=="P" (
    echo.
    echo [Packaging] Creating clean 'dist' folder for Netlify...
    if exist "dist" rd /s /q "dist"
    mkdir "dist"
    mkdir "dist\Css"
    mkdir "dist\JavaScript"
    mkdir "dist\Assets"
    mkdir "dist\Images"
    mkdir "dist\Fonts"
    
    copy /y *.html "dist\" > NUL
    copy /y *.toml "dist\" > NUL
    if exist "Css" copy /y Css\* "dist\Css\" > NUL
    if exist "JavaScript" copy /y JavaScript\* "dist\JavaScript\" > NUL
    if exist "Assets" xcopy /y /e Assets "dist\Assets\" > NUL
    if exist "Images" xcopy /y /e Images "dist\Images\" > NUL
    if exist "Fonts" xcopy /y /e Fonts "dist\Fonts\" > NUL
    
    echo.
    echo [DONE] Your Netlify-ready files are in the 'dist' folder.
    echo        Drag and drop the 'dist' folder into Netlify to deploy!
    echo.
    pause
)

echo.
echo  Keep this window open while using Shiro AI.
echo  Close it to stop all services.
echo.
pause



