#!/bin/bash
set -e

echo "=== Truck Wash Database Seeder ==="
echo "Ensure you have the Cloud SQL Auth Proxy running on PORT 5433 (to avoid conflict with local Postgres)!"
echo "Download: https://cloud.google.com/sql/docs/postgres/sql-proxy#install"
echo "Run: ./cloud_sql_proxy -instances=uktruck:europe-west2:truckwash-pg=tcp:5433"
echo ""
echo "NOTE: Data will be seeded for user: truckwash_user"
echo "Password is the one you created during the setup step."
echo ""

read -p "Enter DB User (default: truckwash_user): " DB_USER
DB_USER=${DB_USER:-truckwash_user}

read -s -p "Enter DB Password: " DB_PASS
echo ""

# Default to localhost via proxy on port 5433
export DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/truckwash"
# export DATABASE_URL="postgresql://truckwash_user:password@localhost:5433/truckwash"

echo "Pushing Schema..."
npm run db:push

echo "Seeding Data..."
npx tsx seed.ts

echo "=== Done! ==="
