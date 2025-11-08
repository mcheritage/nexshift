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

# If you run migrations on each deploy, do it before config:cache
php artisan migrate --force --no-interaction || true

php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Restart workers so they load the new code/config
php artisan queue:restart || true

exec "$@"
