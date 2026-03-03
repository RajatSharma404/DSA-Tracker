@echo off
echo Starting DSA Tracker...

:: Check if concurrently is installed in the root
if not exist node_modules\concurrently (
    echo Installing dependencies...
    npm install
)

:: Run both backend and frontend using the root package.json script
npm run dev
