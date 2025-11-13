# syntax=docker/dockerfile:1.7

############################
# 1) PHP deps (Composer)
############################
FROM composer:2 AS deps
WORKDIR /app

# Install vendor without running scripts (no artisan yet)
COPY composer.json composer.lock ./
RUN composer install --prefer-dist --no-interaction --no-progress --no-scripts

# Now bring in the full app and finalize vendor (still no scripts)
COPY . .
RUN composer install --prefer-dist --no-interaction --no-progress --no-scripts \
    && composer dump-autoload --optimize


############################
# 2) Frontend assets (Node + PHP for wayfinder)
############################
FROM node:22-alpine AS assets
WORKDIR /app

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    LOG_LEVEL=error \
    CACHE_DRIVER=file \
    SESSION_DRIVER=array \
    QUEUE_CONNECTION=sync \
    BROADCAST_DRIVER=log \
    APP_KEY='base64:9qa6QAAwxUOITTDDqxo/JD4p39yVXxN9cJnu3GfKoi0=' \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/tmp/wayfinder.sqlite

RUN touch /tmp/wayfinder.sqlite

# Install PHP and required extensions for wayfinder plugin
RUN apk add --no-cache \
    php php-cli php-common php-curl php-dom php-fileinfo php-json php-mbstring \
    php-openssl php-phar php-session php-tokenizer php-xml php-zip \
    php-pdo php-pdo_sqlite php-sqlite3 \
    composer php-xmlwriter php-simplexml

# only copy what's needed for faster caching; adjust if you use Vite/Mix
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    else npm i; fi


# Copy composer files for wayfinder plugin
COPY composer.json composer.lock ./
RUN composer install --prefer-dist --no-interaction --no-progress --no-scripts

# Copy the full application for wayfinder to work
COPY . .


# Adjust for your build command (vite/mix)
RUN npm run build

############################
# 3) Runtime image (PHP-FPM)
############################
FROM php:8.4-fpm AS runtime
# (You can switch to 8.4 when it’s stable for you)
WORKDIR /var/www/html

# System deps
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libpq-dev gnupg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

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
