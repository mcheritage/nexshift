# syntax=docker/dockerfile:1.7

############################
# 1) PHP base with extensions for Composer
############################
FROM php:8.3-cli AS deps
WORKDIR /app

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# System deps for PHP extensions
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libpq-dev libzip-dev gnupg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions needed for Composer
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd zip

# Install vendor without running scripts (no artisan yet)
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts

# Now bring in the full app and finalize vendor (still no scripts)
COPY . .
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts \
    && composer dump-autoload --optimize


############################
# 2) Frontend assets (Node)
############################
FROM node:20-alpine AS assets
WORKDIR /app
# only copy what's needed for faster caching; adjust if you use Vite/Mix
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    else npm i; fi
COPY . .
# Adjust for your build command (vite/mix)
RUN npm run build

############################
# 3) Runtime image (PHP-FPM)
############################
FROM php:8.3-fpm AS runtime
# (You can switch to 8.4 when it’s stable for you)
WORKDIR /var/www/html

# System deps
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libpq-dev libzip-dev gnupg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd zip

# Optional: PECL, Redis, etc.
# RUN pecl install redis && docker-php-ext-enable redis

# Copy application (code + vendor)
COPY --from=deps /app /var/www/html

# Copy built frontend assets (adjust paths for your setup)
COPY --from=assets /app/public/build /var/www/html/public/build

# --- do all filesystem prep as root ---
USER root

# Entrypoint/script (own line; no trailing "\" above)
COPY deployment/dokploy-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create writable dirs and set ownership in one shot
# (use `install -d` to avoid partial states)
RUN set -eux; \
    install -d -m 0775 -o www-data -g www-data \
    storage \
    storage/framework \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache; \
    chown -R www-data:www-data storage bootstrap/cache

# now drop privileges
#USER www-data

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm", "-F"]

# at the end of your Dockerfile
FROM nginx:alpine AS web
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
# copy the built public dir from your runtime stage
COPY --from=runtime /var/www/html/public /var/www/html/public
