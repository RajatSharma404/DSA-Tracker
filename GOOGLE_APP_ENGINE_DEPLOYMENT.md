# Deploy DSA-Tracker to Google App Engine

This guide covers deploying the DSA-Tracker application to Google App Engine with Cloud SQL for the PostgreSQL database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Google Cloud Setup](#google-cloud-setup)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [Local Testing](#local-testing)
7. [Deployment](#deployment)
8. [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)

---

## Prerequisites

### Required Tools

- Google Cloud SDK (`gcloud` CLI) - [Install here](https://cloud.google.com/sdk/docs/install)
- Node.js 20+ (for local testing)
- Git

### Required Accounts

- Google Cloud Platform (GCP) account
- Active billing account (App Engine standard and Cloud SQL require billing)

### Installation

```bash
# Install Google Cloud SDK
# Windows: Download installer from https://cloud.google.com/sdk/docs/install

# Initialize gcloud
gcloud init

# Login to GCP
gcloud auth login

# Set your project ID
gcloud config set project PROJECT_ID
```

---

## Project Setup

### 1. Create a GCP Project

```bash
# Create a new project
gcloud projects create dsa-tracker-prod --name="DSA Tracker Production"

# Set it as active
gcloud config set project dsa-tracker-prod

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable servicenetworking.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

### 2. Set Region

```bash
# Choose a region (e.g., us-central1, europe-west1, asia-southeast1)
export REGION=us-central1

# Initialize App Engine
gcloud app create --region=$REGION
```

---

## Google Cloud Setup

### 1. Create VPC Connector (for database connectivity)

```bash
# Create a VPC connector to connect App Engine to Cloud SQL
gcloud compute networks vpc-access connectors create dsa-connector \
  --network default \
  --region $REGION \
  --range 10.8.0.0/28
```

### 2. Create Cloud SQL Instance

```bash
# Create a PostgreSQL 15 instance
gcloud sql instances create dsa-postgres-prod \
  --database-version POSTGRES_15 \
  --tier db-f1-micro \
  --region $REGION \
  --no-backup \
  --availability-type ZONAL

# Create a database
gcloud sql databases create dsatracker \
  --instance dsa-postgres-prod

# Create a database user
gcloud sql users create dsauser \
  --instance dsa-postgres-prod \
  --password

# Get the Cloud SQL connection name (you'll need this later)
gcloud sql instances describe dsa-postgres-prod --format='value(connectionName)'
```

**Output example:** `dsa-tracker-prod:us-central1:dsa-postgres-prod`

---

## Database Configuration

### 1. Getting Cloud SQL Proxy Connection String

For local testing and remote connections, you'll need the Cloud SQL Proxy connection string:

```
postgresql://dsauser:PASSWORD@/dsatracker?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

### 2. Initialize Database to Cloud SQL

First, create a `.env` file in the backend directory for running migrations:

```env
DATABASE_URL="postgresql://dsauser:YOUR_PASSWORD@/dsatracker?host=/cloudsql/PROJECT_ID:REGION:dsa-postgres-prod"
```

---

## Environment Variables

### 1. Set Secret Variables in Google Cloud Secret Manager

```bash
# Store sensitive variables as secrets
echo -n "your-strong-password" | gcloud secrets create db-password --data-file=-
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-
echo -n "your-nextauth-secret" | gcloud secrets create nextauth-secret --data-file=-
echo -n "your-google-client-id" | gcloud secrets create google-client-id --data-file=-
echo -n "your-google-client-secret" | gcloud secrets create google-client-secret --data-file=-
```

### 2. Backend Environment (.env for backend service)

Create `.env.gae` in the backend directory:

```env
NODE_ENV=production
PORT=8080
DATABASE_URL="postgresql://dsauser:PASSWORD@/dsatracker?host=/cloudsql/PROJECT_ID:REGION:dsa-postgres-prod"
NEXTAUTH_SECRET=your-secret-here
GEMINI_API_KEY=your-gemini-api-key
NEXTAUTH_URL=https://yourdomain.com
```

### 3. Frontend Environment (.env.gae for frontend service)

Create `.env.gae` in the frontend directory:

```env
NODE_ENV=production
PORT=8080
DATABASE_URL="postgresql://dsauser:PASSWORD@/dsatracker?host=/cloudsql/PROJECT_ID:REGION:dsa-postgres-prod"
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-here
NEXT_PUBLIC_API_URL=https://backend-123456789.uc.r.appspot.com/api
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Local Testing

### 1. Test Backend Locally

```bash
# Install Cloud SQL Proxy
gcloud components install cloud-sql-proxy

# Start Cloud SQL Proxy in a separate terminal
cloud-sql-proxy "PROJECT_ID:REGION:dsa-postgres-prod"

# In another terminal, in the backend directory
cd backend
npm install
npm run build

# Create .env file with cloud SQL connection
DATABASE_URL="postgresql://dsauser:PASSWORD@/dsatracker?host=/cloudsql/127.0.0.1" \
npm start
```

### 2. Test Frontend Locally

```bash
cd frontend
npm install
npm run build

# Test with backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api npm start
```

---

## Deployment

### 1. Update app.yaml Files

Replace placeholders in both `backend/app.yaml` and `frontend/app.yaml`:

```bash
# Set your actual project ID and region
sed -i "s/PROJECT_ID/dsa-tracker-prod/g" backend/app.yaml frontend/app.yaml
sed -i "s/REGION/$REGION/g" backend/app.yaml frontend/app.yaml
```

### 2. Prepare Environment for Deployment

Create `.env.yaml` file in root directory with environment variables:

```yaml
env_variables:
  NODE_ENV: "production"
  NEXTAUTH_SECRET: "your-secret"
  GEMINI_API_KEY: "your-api-key"
  NEXTAUTH_URL: "https://yourdomain.com"
```

**Or** pass them via app.yaml (recommended for secrets):

```yaml
env_variables:
  DATABASE_URL: "postgresql://dsauser:PASSWORD@/dsatracker?host=/cloudsql/PROJECT_ID:REGION:dsa-postgres-prod"
  NEXTAUTH_SECRET: "your-secret"
  GEMINI_API_KEY: "your-api-key"
```

### 3. Deploy Backend Service

```bash
cd backend

# Build the application
npm run build

# Deploy to App Engine
gcloud app deploy app.yaml --region=$REGION

# Verify deployment
gcloud app describe
```

### 4. Deploy Frontend Service

```bash
cd ../frontend

# Build the application
npm run build

# Deploy to App Engine
gcloud app deploy app.yaml --region=$REGION
```

### 5. Verify Deployment

```bash
# Get service URLs
gcloud app services list

# Check logs
gcloud app logs read -s backend
gcloud app logs read -s frontend

# Visit your services
# Backend: https://backend-SERVICE_ID.uc.r.appspot.com
# Frontend: https://SERVICE_ID.uc.r.appspot.com
```

---

## Custom Domain Setup

### 1. Add Custom Domain

```bash
# Go to Google Cloud Console > App Engine > Settings > Custom domains
# Or use gcloud command:
gcloud app custom-domains create yourdomain.com

# Point your domain's DNS records to the given IP address
```

### 2. Update Frontend .env

Update `NEXT_PUBLIC_API_URL` to point to your backend service:

```env
NEXT_PUBLIC_API_URL=https://backend-SERVICE_ID.uc.r.appspot.com/api
# Or if using custom domain:
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

Redeploy frontend after updating environment variables.

---

## Monitoring and Troubleshooting

### 1. View Logs

```bash
# Backend logs
gcloud app logs read -s backend --limit 100

# Frontend logs
gcloud app logs read -s frontend --limit 100

# Real-time logs
gcloud app logs read -s backend -f
```

### 2. Scale Services

```bash
# Edit service configuration
gcloud app services describe backend

# Update min/max instances in app.yaml and redeploy
gcloud app deploy backend/app.yaml
```

### 3. Common Issues

#### Database Connection Error

```bash
# Verify Cloud SQL instance is running
gcloud sql instances list

# Check Cloud SQL Proxy connectivity
cloud-sql-proxy "PROJECT_ID:REGION:instance-name" --port 5432
```

#### Health Check Failures

- Ensure backend has a `/health` endpoint
- Ensure frontend returns 200 status code on `/`
- Check logs for actual error messages

#### Out of Memory

- Increase instance class: Change `db-f1-micro` to `db-f1-small`
- Reduce Max Instances in app.yaml

### 4. Performance Monitoring

```bash
# View App Engine metrics
gcloud monitoring dashboards list

# View Cloud SQL metrics
# Go to Google Cloud Console > Cloud SQL > Metrics
```

---

## Cleanup

To delete resources and stop incurring charges:

```bash
# Delete App Engine services
gcloud app services delete backend frontend

# Delete Cloud SQL instance
gcloud sql instances delete dsa-postgres-prod

# Delete VPC connector
gcloud compute networks vpc-access connectors delete dsa-connector --region=$REGION

# Delete project (if needed)
gcloud projects delete dsa-tracker-prod
```

---

## Additional Resources

- [Google App Engine Documentation](https://cloud.google.com/appengine/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Next.js on Google App Engine](https://cloud.google.com/appengine/docs/standard/nodejs/runtime)
- [Express.js on Google App Engine](https://cloud.google.com/appengine/docs/standard/nodejs/quickstart)
