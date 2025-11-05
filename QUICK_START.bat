@echo off
echo ========================================
echo x402 Presale Platform - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file with your configuration!
    echo Press any key to open .env file...
    pause
    notepad .env
)

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to generate Prisma client!
    pause
    exit /b 1
)

echo.
echo Setting up database...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Database setup failed. Please configure DATABASE_URL in .env
    echo and run: npx prisma db push
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Starting development server...
echo Visit: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause







