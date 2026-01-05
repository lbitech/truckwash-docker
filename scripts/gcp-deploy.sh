#!/bin/bash
set -e

# Configuration
PROJECT_ID="uktruck"
REGION="europe-west2"
REPO_NAME="uktruck"
IMAGE_NAME="truckwash-prod"
SERVICE_NAME="truckwash-service"

echo "=== Truck Wash Cloud Run Deployer ==="
read -p "Enter version tag (e.g. v1.0): " VERSION
echo ""

FULL_IMAGE_PATH="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION"

echo "1. Building Docker Image for Linux/AMD64..."
# Cloud Run requires linux/amd64. Mac M1/M2 builds arm64 by default, which fails on Cloud Run.
docker build --platform linux/amd64 -t $FULL_IMAGE_PATH .

echo "2. Pushing to Artifact Registry..."
docker push $FULL_IMAGE_PATH

echo "3. Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $FULL_IMAGE_PATH \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production"

echo ""
echo "=== Deployment Complete! ==="
