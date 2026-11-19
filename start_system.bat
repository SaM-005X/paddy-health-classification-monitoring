@echo off
title Paddy Health Classification & Monitoring System
color 0A

echo ======================================================================
echo    Starting Paddy Health Classification and Monitoring System
echo    AI Model: MobileNetV2 (4-Class Edge Architecture)
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000...
start "Paddy Health API Backend" cmd /k "cd backend && ..\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Vite Frontend on http://localhost:3000...
start "Paddy Health Web UI" cmd /k "cd frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo Opening browser at http://localhost:3000...
start http://localhost:3000

echo.
echo ======================================================================
echo System is running!
echo Frontend: http://localhost:3000
echo Backend API Docs: http://127.0.0.1:8000/docs
echo ======================================================================
pause
