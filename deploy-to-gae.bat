@echo off
REM DSA Tracker - Google App Engine Deployment Helper Script (Windows)
REM This script helps set up Google App Engine for DSA Tracker

setlocal enabledelayedexpansion

REM Colors (Windows Command Prompt doesn't support ANSI colors natively)
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "NC=[0m"

REM Configuration
set PROJECT_ID=%GCP_PROJECT_ID%
set REGION=us-central1
set INSTANCE_NAME=dsa-postgres-prod
set DB_USER=dsauser
set DB_NAME=dsatracker

echo.
echo === DSA Tracker Google App Engine Deployment (Windows) ===
echo.

REM Step 1: Check gcloud
echo Checking for gcloud CLI...
where gcloud >nul 2>nul
if errorlevel 1 (
    echo Error: gcloud CLI not found. Please install Google Cloud SDK.
    echo Download from: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)
echo gcloud CLI found.

REM Step 2: Get Project ID
if "%PROJECT_ID%"=="" (
    echo Enter your Google Cloud Project ID:
    set /p PROJECT_ID=
)

echo Setting project to %PROJECT_ID%...
call gcloud config set project %PROJECT_ID%

REM Step 3: Enable APIs
echo.
echo Enabling required APIs...
call gcloud services enable appengine.googleapis.com
call gcloud services enable sqladmin.googleapis.com
call gcloud services enable compute.googleapis.com
call gcloud services enable servicenetworking.googleapis.com
echo APIs enabled.

REM Step 4: Update app.yaml files
echo.
echo Updating app.yaml files...
powershell -Command "(Get-Content backend\app.yaml) -replace 'PROJECT_ID', '%PROJECT_ID%' | Set-Content backend\app.yaml"
powershell -Command "(Get-Content frontend\app.yaml) -replace 'PROJECT_ID', '%PROJECT_ID%' | Set-Content frontend\app.yaml"
powershell -Command "(Get-Content backend\app.yaml) -replace 'REGION', '%REGION%' | Set-Content backend\app.yaml"
powershell -Command "(Get-Content frontend\app.yaml) -replace 'REGION', '%REGION%' | Set-Content frontend\app.yaml"
echo app.yaml files updated.

REM Step 5: Build services
echo.
echo Building backend...
cd backend
call npm install
call npm run build
cd ..
echo Backend built.

echo.
echo Building frontend...
cd frontend
call npm install
call npm run build
cd ..
echo Frontend built.

REM Step 6: Deploy
echo.
echo Deploying backend...
call gcloud app deploy backend\app.yaml --quiet
echo Backend deployed.

echo.
echo Deploying frontend...
call gcloud app deploy frontend\app.yaml --quiet
echo Frontend deployed.

REM Step 7: Display services
echo.
echo === Deployment Complete ===
echo.
echo Services:
call gcloud app services list

echo.
echo Next Steps:
echo 1. Set up Cloud SQL (manual):
echo    gcloud sql instances create %INSTANCE_NAME% --database-version POSTGRES_15 --tier db-f1-micro --region %REGION%
echo.
echo 2. Create VPC connector:
echo    gcloud compute networks vpc-access connectors create dsa-connector --network default --region %REGION% --range 10.8.0.0/28
echo.
echo 3. Update environment variables in app.yaml with your database connection string
echo.
echo.
pause
