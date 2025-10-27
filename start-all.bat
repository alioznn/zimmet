@echo off
echo Zimmet Uygulaması Başlatılıyor...
echo.

echo Backend başlatılıyor...
start "Backend" cmd /k "cd /d C:\Users\aligo\OneDrive\Masaüstü\depo zimmet\zim-api\src\Zim.Api && dotnet run"

timeout /t 3 /nobreak >nul

echo Frontend başlatılıyor...
start "Frontend" cmd /k "cd /d C:\Users\aligo\OneDrive\Masaüstü\depo zimmet\zim-ui && npm run dev"

echo.
echo Her iki uygulama da başlatıldı!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
