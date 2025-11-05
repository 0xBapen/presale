@echo off
echo ========================================
echo x402 Presale Platform - Windows Quick Start
echo ========================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Install dependencies
echo Step 1/6: Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Generate wallet
echo Step 2/6: Generating Solana wallet...
call node scripts/generate-wallet.js
echo.
echo [IMPORTANT] Save the wallet info above!
echo Press any key to continue...
pause >nul
echo.

REM Setup environment
echo Step 3/6: Setting up environment...
if not exist ".env" (
    copy .env.solana-devnet .env >nul
    echo [OK] Created .env file
    echo.
    echo [ACTION REQUIRED] Please edit .env file now:
    echo 1. Update DATABASE_URL with your database
    echo 2. Add your wallet address and private key
    echo 3. Set a secure ADMIN_PASSWORD
    echo.
    echo Press any key to open .env in Notepad...
    pause >nul
    notepad .env
) else (
    echo [OK] .env file already exists
)
echo.

REM Setup database
echo Step 4/6: Setting up database...
echo Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma client!
    pause
    exit /b 1
)

echo.
echo Creating database tables...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database push failed
    echo Make sure DATABASE_URL in .env is correct
    echo You can run 'npx prisma db push' manually later
    echo.
)
echo.

REM Fund wallet
echo Step 5/6: Funding devnet wallet...
echo.
echo [ACTION REQUIRED] Fund your wallet with devnet SOL:
echo.
echo Option 1: Use Solana CLI (if installed):
echo   solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
echo.
echo Option 2: Use web faucet:
echo   https://solfaucet.com/
echo.
echo Press any key when wallet is funded...
pause >nul
echo.

REM Start server
echo Step 6/6: Starting development server...
echo.
echo ========================================
echo Platform is starting!
echo ========================================
echo.
echo Your platform will open at: http://localhost:3000
echo.
echo Admin Panel: http://localhost:3000/admin
echo Create Presale: http://localhost:3000/create
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause







