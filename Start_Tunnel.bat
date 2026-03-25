@echo off
title Shiro AI - Cloudflare Tunnel
color 0B
echo ============================================
echo   Shiro AI - Public HTTPS Tunnel
echo ============================================
echo.
if not exist cloudflared.exe (
    echo [Downloading] cloudflared.exe from Cloudflare...
    curl -L -o cloudflared.exe "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
)
echo.
echo [Starting] Tunnel to Local Port 3000 (Shiro Bridge)...
echo.
echo ----------------------------------------------------
echo IMPORTANT: Look for the URL that ends with .trycloudflare.com
echo Copy that URL and paste it into "Remote Tunnel" in Shiro Settings!
echo ----------------------------------------------------
echo.
cloudflared.exe tunnel --url http://localhost:3000
pause
