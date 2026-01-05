#!/bin/bash
set -e

echo "=== Truck Wash Database Repair ==="
echo "This script will reset the database user password and ensure the database exists."

read -p "Enter GCP Project ID (default: uktruck): " PROJECT_ID
PROJECT_ID=${PROJECT_ID:-uktruck}

INSTANCE_NAME="truckwash-pg"

echo "1. Resetting password for 'truckwash_user'..."
read -s -p "Enter NEW Password: " DB_PASS
echo ""

gcloud sql users set-password truckwash_user \
    --instance=$INSTANCE_NAME \
    --password=$DB_PASS \
    --project=$PROJECT_ID

echo "2. Ensuring 'truckwash' database exists..."
# We allow this to fail if it already exists
gcloud sql databases create truckwash --instance=$INSTANCE_NAME --project=$PROJECT_ID || echo "Database 'truckwash' already exists (or creation failed)."

echo ""
echo "=== Repair Complete ==="
echo "Now try running ./scripts/gcp-seed-db.sh again."
echo "When asked for the password, use the NEW password you just set."
