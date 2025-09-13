@echo off
REM Real-time Analytics Dashboard - Development Setup Script

echo ========================================
echo Real-time Analytics Dashboard Setup
echo ========================================

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop and try again
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and try again
    pause
    exit /b 1
)

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ and try again
    pause
    exit /b 1
)

echo All prerequisites are installed!
echo.

echo Setting up backend environment...
cd backend
if not exist .env (
    copy .env.example .env
    echo Created backend .env file
)

echo.
echo Setting up frontend environment...
cd ..\frontend
if not exist .env.local (
    copy .env.example .env.local
    echo Created frontend .env.local file
)

cd ..

echo.
echo Starting Docker services (PostgreSQL and Redis)...
docker-compose up -d postgres redis

echo.
echo Waiting for database to be ready...
timeout /t 10

echo.
echo Setup complete!
echo.
echo To start development:
echo 1. Backend: cd backend && uvicorn app.main:app --reload
echo 2. Frontend: cd frontend && npm run dev
echo 3. Or use Docker: docker-compose up
echo.
echo Visit http://localhost:3000 for the frontend
echo Visit http://localhost:8000/docs for the API documentation
echo.

pause
