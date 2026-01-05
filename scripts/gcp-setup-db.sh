#!/bin/bash
set -e

# Configuration
INSTANCE_NAME="truckwash-pg"
REGION="europe-west2"
DB_NAME="truckwash"
DB_USER="truckwash_user"

echo "=== GCP Cloud SQL Setup ==="
read -p "Enter your GCP Project ID: " PROJECT_ID
read -s -p "Enter a password for the database user ($DB_USER): " DB_PASS
echo ""

echo "Enabling Cloud SQL Admin API..."
gcloud services enable sqladmin.googleapis.com --project=$PROJECT_ID

echo "Creating Cloud SQL Instance '$INSTANCE_NAME' in '$REGION'..."
# Using explicit public-ip-enabled for ease of access (consider private IP for prod)
gcloud sql instances create $INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --region=$REGION \
    --project=$PROJECT_ID \
    --tier=db-f1-micro \
    --storage-size=10GB \
    --assign-ip

echo "Creating Database '$DB_NAME'..."
gcloud sql databases create $DB_NAME --instance=$INSTANCE_NAME --project=$PROJECT_ID

echo "Creating User '$DB_USER'..."
gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password=$DB_PASS \
    --project=$PROJECT_ID

echo "=== Setup Complete ==="
echo "Instance Connection Name:"
gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="value(connectionName)"
echo ""
echo "To connect safely, use the Cloud SQL Auth Proxy:"
echo "./cloud-sql-proxy $INSTANCE_NAME"
