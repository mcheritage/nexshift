#!/usr/bin/env bash
set -e

# Fail fast if APP_KEY is missing (protects you from silent bad deploys)
if [ -z "${APP_KEY:-}" ]; then
  echo "ERROR: APP_KEY is not set. Add it in Dokploy → Environment and redeploy."
  exit 1
fi

# Ensure writable dirs (in case of volume/permissions changes)
mkdir -p storage/framework/{cache,sessions,views}
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# Clear any stale caches (built without envs) and rebuild with current env
php artisan config:clear || true
php artisan cache:clear || true

# Refresh database if REFRESH_DB is enabled
if [ "$REFRESH_DB" = "true" ]; then
  echo -e "${BLUE}🌱 Running fresh migrations...${NC}"
  php artisan migrate:fresh --force
  echo -e "${GREEN}✅ Database fresh migration successful ${NC}"
else
  php artisan migrate --force
  echo -e "${GREEN}✅ Database migration successful ${NC}"

fi

# Seed database if SEED_DATA is enabled
if [ "$SEED_DATA" = "true" ]; then
  echo -e "${BLUE}🌱 Seeding database with sample data...${NC}"
  php artisan db:seed --force
  echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
  echo -e "${YELLOW}⚠️  Skipping database seeding (SEED_DATA=false)${NC}"
fi


php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true
php artisan storage:link || true

# Restart workers so they load the new code/config
php artisan queue:restart || true

exec "$@"
