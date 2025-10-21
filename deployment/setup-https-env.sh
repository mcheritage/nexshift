#!/bin/bash

# Script to set up HTTPS environment variables for Laravel deployment
# Run this on your VPS after deployment to ensure HTTPS is properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Setting up HTTPS environment variables...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found in current directory${NC}"
    exit 1
fi

# Backup original .env file
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

echo -e "${YELLOW}📋 Current APP_URL setting:${NC}"
grep "APP_URL=" .env || echo "APP_URL not found in .env"

# Update APP_URL to use HTTPS
echo -e "${BLUE}🔧 Updating APP_URL to use HTTPS...${NC}"
sed -i 's|APP_URL=http://|APP_URL=https://|g' .env

# Set APP_ENV to production if not already set
if ! grep -q "APP_ENV=production" .env; then
    echo -e "${BLUE}🔧 Setting APP_ENV to production...${NC}"
    sed -i 's/APP_ENV=.*/APP_ENV=production/' .env
fi

# Ensure ASSET_URL is set to HTTPS
if grep -q "ASSET_URL=" .env; then
    echo -e "${BLUE}🔧 Updating ASSET_URL to use HTTPS...${NC}"
    sed -i 's|ASSET_URL=http://|ASSET_URL=https://|g' .env
else
    echo -e "${BLUE}🔧 Adding ASSET_URL with HTTPS...${NC}"
    echo "ASSET_URL=https://fibroidscare.sandbox.novarelabs.dev" >> .env
fi

echo -e "${GREEN}✅ Environment variables updated successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Updated settings:${NC}"
echo "  APP_URL: $(grep "APP_URL=" .env | cut -d'=' -f2-)"
echo "  APP_ENV: $(grep "APP_ENV=" .env | cut -d'=' -f2-)"
echo "  ASSET_URL: $(grep "ASSET_URL=" .env | cut -d'=' -f2-)"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "  1. Restart your Laravel application containers"
echo "  2. Clear Laravel caches: php artisan config:clear && php artisan cache:clear"
echo "  3. Rebuild assets if needed: npm run build"
echo ""
echo -e "${GREEN}🎉 HTTPS environment setup complete!${NC}" 