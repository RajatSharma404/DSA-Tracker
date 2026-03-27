# Quick Start: Deploy DSA Tracker to Google App Engine

## Prerequisites

- Google Cloud account with billing enabled
- Google Cloud SDK installed (`gcloud` CLI)
- Node.js 20+

## Quick Setup (5 minutes)

### 1. Install Google Cloud SDK

```bash
# Windows: Download installer from https://cloud.google.com/sdk/docs/install
# macOS: brew install google-cloud-sdk
# Linux: curl https://sdk.cloud.google.com | bash
```

### 2. Initialize gcloud

```bash
gcloud init
gcloud auth login
export GCP_PROJECT_ID=your-project-id
export GCP_REGION=us-central1  # or your preferred region
```

### 3. Deploy (Automated)

#### Option A: macOS/Linux

```bash
chmod +x deploy-to-gae.sh
./deploy-to-gae.sh
```

#### Option B: Windows

```cmd
deploy-to-gae.bat
```

#### Option C: Manual Steps (if scripts don't work)

```bash
# 1. Enable APIs
gcloud services enable appengine.googleapis.com sqladmin.googleapis.com compute.googleapis.com servicenetworking.googleapis.com

# 2. Initialize App Engine
gcloud app create --region=us-central1

# 3. Create VPC Connector
gcloud compute networks vpc-access connectors create dsa-connector \
  --network default \
  --region us-central1 \
  --range 10.8.0.0/28

# 4. Create Cloud SQL (PostgreSQL)
gcloud sql instances create dsa-postgres-prod \
  --database-version POSTGRES_15 \
  --tier db-f1-micro \
  --region us-central1 \
  --no-backup

# 5. Create database and user
gcloud sql databases create dsatracker --instance dsa-postgres-prod
gcloud sql users create dsauser --instance dsa-postgres-prod --password

# 6. Update app.yaml files with your project ID
# Edit backend/app.yaml and frontend/app.yaml, replace:
#   - PROJECT_ID with your actual project ID
#   - REGION with us-central1 (or your region)

# 7. Build and deploy
cd backend
npm install && npm run build
gcloud app deploy app.yaml

cd ../frontend
npm install && npm run build
gcloud app deploy app.yaml
```

## Configuration After Deployment

### 1. Set Environment Variables

Update `backend/app.yaml` and `frontend/app.yaml` with your `env_variables`:

```yaml
env_variables:
  NODE_ENV: "production"
  DATABASE_URL: "postgresql://dsauser:PASSWORD@/dsatracker?host=/cloudsql/PROJECT_ID:REGION:dsa-postgres-prod"
  NEXTAUTH_SECRET: "your-secret"
  NEXTAUTH_URL: "https://yourdomain.com"
  GEMINI_API_KEY: "your-api-key"
  GOOGLE_CLIENT_ID: "your-client-id"
  GOOGLE_CLIENT_SECRET: "your-client-secret"
  NEXT_PUBLIC_API_URL: "https://backend-SERVICE_ID.uc.r.appspot.com/api"
```

### 2. Run Database Migrations

```bash
# Get the Cloud SQL connection string
gcloud sql instances describe dsa-postgres-prod --format='value(connectionName)'

# Start Cloud SQL Proxy
cloud-sql-proxy "PROJECT_ID:REGION:dsa-postgres-prod" &

# Run migrations
cd backend
npx prisma migrate deploy
```

### 3. Add Custom Domain (Optional)

```bash
# Go to Google Cloud Console > App Engine > Settings > Custom domains
# Or use gcloud:
gcloud app custom-domains create yourdomain.com

# Update frontend NEXT_PUBLIC_API_URL if using custom domain
# Then redeploy frontend
cd frontend
gcloud app deploy app.yaml
```

## View Your Application

```bash
# List deployed services
gcloud app services list

# View logs
gcloud app logs read -s backend -f    # Backend logs
gcloud app logs read -s frontend -f   # Frontend logs

# View service URLs
# Backend: https://backend-SERVICE_ID.uc.r.appspot.com
# Frontend: https://SERVICE_ID.uc.r.appspot.com
```

## Troubleshooting

### Health Check Failures

```bash
# Check if /health endpoint exists in backend
# Check if frontend returns 200 on /
# View full logs:
gcloud app logs read --limit 100
```

### Database Connection Issues

```bash
# Verify Cloud SQL instance is running
gcloud sql instances list

# Check VPC connector exists
gcloud compute networks vpc-access connectors list --region=us-central1

# Test connection locally with Cloud SQL Proxy
cloud-sql-proxy "PROJECT_ID:REGION:dsa-postgres-prod"
```

### Out of Memory Errors

- Increase instance class in `app.yaml`:
  ```yaml
  env: flexible # Change from standard
  instance_class: F2
  ```
- Or reduce max_instances

### Deployment Hanging

```bash
# View deployment status
gcloud app describe

# Check operation status
gcloud operations list --limit=10
```

## Scaling

### Auto-scaling Configuration in app.yaml

```yaml
automatic_scaling:
  min_instances: 1 # Always keep at least 1 running
  max_instances: 10 # Scale up to 10 if needed
  target_cpu_utilization: 0.65
  target_throughput_utilization: 0.65
```

### Manual Scaling

```bash
# Set fixed number of instances
gcloud app services update BACKEND_SERVICE_NAME --min-instances=2 --max-instances=5
```

## Cost Optimization

1. **Use db-f1-micro** (default) for low traffic
2. **Set min-instances to 0** for cold starts (but response time slower):
   ```yaml
   env: flexible
   ```
3. **Use committed discounts** via Cloud Commitments
4. **Monitor costs**:
   ```bash
   gcloud billing budgets list
   ```

## Cleanup (Delete Resources)

```bash
# Delete services
gcloud app services delete backend frontend

# Delete Cloud SQL
gcloud sql instances delete dsa-postgres-prod

# Delete VPC connector
gcloud compute networks vpc-access connectors delete dsa-connector --region=us-central1

# Delete project (careful!)
gcloud projects delete PROJECT_ID
```

## More Information

- [App Engine Docs](https://cloud.google.com/appengine/docs)
- [Cloud SQL Docs](https://cloud.google.com/sql/docs)
- [Next.js on App Engine](https://cloud.google.com/appengine/docs/standard/nodejs/runtime)
- [Full Deployment Guide](./GOOGLE_APP_ENGINE_DEPLOYMENT.md)
