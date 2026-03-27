#!/bin/bash

# DSA Tracker - Google App Engine Deployment Helper Script
# This script automates the deployment process for DSA Tracker on GAE

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-}
REGION=${GCP_REGION:-us-central1}
INSTANCE_NAME="dsa-postgres-prod"
DB_USER="dsauser"
DB_NAME="dsatracker"

echo -e "${GREEN}=== DSA Tracker Google App Engine Deployment ===${NC}"

# Step 1: Validate GCP Setup
echo -e "\n${YELLOW}Step 1: Validating GCP Setup...${NC}"

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not found. Please install Google Cloud SDK.${NC}"
    exit 1
fi

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your Google Cloud Project ID:${NC}"
    read -r PROJECT_ID
fi

gcloud config set project "$PROJECT_ID"
echo -e "${GREEN}✓ Using project: $PROJECT_ID${NC}"

# Display current region
CURRENT_REGION=$(gcloud app describe --format='value(gae_application.location_id)' 2>/dev/null || echo "not-set")
if [ "$CURRENT_REGION" != "not-set" ]; then
    REGION=$CURRENT_REGION
fi
echo -e "${GREEN}✓ Using region: $REGION${NC}"

# Step 2: Enable Required APIs
echo -e "\n${YELLOW}Step 2: Enabling Required APIs...${NC}"
gcloud services enable appengine.googleapis.com || true
gcloud services enable sqladmin.googleapis.com || true
gcloud services enable compute.googleapis.com || true
gcloud services enable servicenetworking.googleapis.com || true
echo -e "${GREEN}✓ APIs enabled${NC}"

# Step 3: Create VPC Connector (if not exists)
echo -e "\n${YELLOW}Step 3: Checking VPC Connector...${NC}"
if ! gcloud compute networks vpc-access connectors describe dsa-connector --region="$REGION" &>/dev/null; then
    echo -e "${YELLOW}Creating VPC connector (this may take a few minutes)...${NC}"
    gcloud compute networks vpc-access connectors create dsa-connector \
        --network default \
        --region "$REGION" \
        --range 10.8.0.0/28
    echo -e "${GREEN}✓ VPC connector created${NC}"
else
    echo -e "${GREEN}✓ VPC connector already exists${NC}"
fi

# Step 4: Create Cloud SQL Instance (if not exists)
echo -e "\n${YELLOW}Step 4: Checking Cloud SQL Instance...${NC}"
if ! gcloud sql instances describe "$INSTANCE_NAME" --region="$REGION" &>/dev/null; then
    echo -e "${YELLOW}Creating Cloud SQL instance (this may take a few minutes)...${NC}"
    gcloud sql instances create "$INSTANCE_NAME" \
        --database-version POSTGRES_15 \
        --tier db-f1-micro \
        --region "$REGION" \
        --no-backup \
        --availability-type ZONAL
    echo -e "${GREEN}✓ Cloud SQL instance created${NC}"
    
    # Create database
    echo -e "${YELLOW}Creating database...${NC}"
    gcloud sql databases create "$DB_NAME" --instance="$INSTANCE_NAME"
    echo -e "${GREEN}✓ Database created${NC}"
    
    # Create database user
    echo -e "${YELLOW}Enter password for database user '$DB_USER':${NC}"
    read -r -s DB_PASSWORD
    gcloud sql users create "$DB_USER" \
        --instance "$INSTANCE_NAME" \
        --password="$DB_PASSWORD"
    echo -e "${GREEN}✓ Database user created${NC}"
else
    echo -e "${GREEN}✓ Cloud SQL instance already exists${NC}"
fi

# Get Cloud SQL connection string
SQL_CONNECTION=$(gcloud sql instances describe "$INSTANCE_NAME" --format='value(connectionName)')
echo -e "${GREEN}✓ Cloud SQL connection: $SQL_CONNECTION${NC}"

# Step 5: Update app.yaml files
echo -e "\n${YELLOW}Step 5: Updating app.yaml files...${NC}"
sed -i "s/PROJECT_ID/$PROJECT_ID/g" backend/app.yaml frontend/app.yaml
sed -i "s/REGION/$REGION/g" backend/app.yaml frontend/app.yaml
echo -e "${GREEN}✓ app.yaml files updated${NC}"

# Step 6: Build services
echo -e "\n${YELLOW}Step 6: Building services...${NC}"

echo -e "${YELLOW}Building backend...${NC}"
cd backend
npm install
npm run build
cd ..
echo -e "${GREEN}✓ Backend built${NC}"

echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✓ Frontend built${NC}"

# Step 7: Deploy services
echo -e "\n${YELLOW}Step 7: Deploying services...${NC}"

echo -e "${YELLOW}Deploying backend service...${NC}"
gcloud app deploy backend/app.yaml --region="$REGION" --quiet
echo -e "${GREEN}✓ Backend deployed${NC}"

echo -e "${YELLOW}Deploying frontend service...${NC}"
gcloud app deploy frontend/app.yaml --region="$REGION" --quiet
echo -e "${GREEN}✓ Frontend deployed${NC}"

# Step 8: Display information
echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "\n${YELLOW}Services:${NC}"
gcloud app services list

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Run database migrations:"
echo "   export CLOUDSQL_CONNECTION='$SQL_CONNECTION'"
echo "   cd backend && npx prisma migrate deploy"
echo ""
echo "2. Set custom domain:"
echo "   gcloud app custom-domains create yourdomain.com"
echo ""
echo "3. View logs:"
echo "   gcloud app logs read -s backend -f"
echo "   gcloud app logs read -s frontend -f"
echo ""
echo -e "${GREEN}Deployment successful!${NC}"
