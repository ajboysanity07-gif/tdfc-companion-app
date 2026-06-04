# syntax=docker/dockerfile:1

# Install PHP dependencies with Composer on PHP 8.3.
# Do not use composer:2 directly here because it can move to a newer PHP version
# than the project's locked dependencies support.
FROM php:8.3-cli-bookworm AS vendor

WORKDIR /app

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
        libicu-dev \
    && docker-php-ext-install \
        bcmath \
        intl \
        mbstring \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction \
    --no-progress


# Build React/Inertia/Vite frontend assets.
FROM node:22-bookworm AS frontend

WORKDIR /app
COPY --from=vendor /app /app

RUN npm ci
RUN npm run build


# Runtime image: PHP 8.3 + Apache + SQL Server drivers.
FROM php:8.3-apache-bookworm AS app

WORKDIR /var/www/html

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        $PHPIZE_DEPS \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg2 \
        git \
        unzip \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
        libicu-dev \
        unixodbc-dev \
    && curl -sSL -O https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
    && docker-php-ext-install \
        bcmath \
        intl \
        mbstring \
        opcache \
        zip \
    && pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv opcache \
    && a2enmod rewrite headers \
    && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/pear ~/.pearrc

COPY --from=frontend /app /var/www/html

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://127.0.0.1/up || exit 1

EXPOSE 80

CMD ["apache2-foreground"]
