FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    gnupg \
    ca-certificates

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user to run Composer and Artisan Commands
RUN useradd -G www-data,root -u 1000 -d /home/dev dev
RUN mkdir -p /home/dev/.composer && \
    chown -R dev:dev /home/dev

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . /var/www

# Set proper ownership for all files
RUN chown -R dev:dev /var/www

# Install Composer dependencies
RUN composer install --no-interaction

# Install Node dependencies and build assets
RUN npm ci && npm run build

# Ensure storage and bootstrap/cache are writable
RUN chmod -R 775 storage bootstrap/cache

# Change current user to dev
USER dev


# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]
