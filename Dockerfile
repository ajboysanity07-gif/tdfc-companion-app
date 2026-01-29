# Use PHP 8.3 with Apache
FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    gnupg \
    apt-transport-https \
    unixodbc-dev \
    socat \
    && rm -rf /var/lib/apt/lists/*

# Install Microsoft ODBC Driver 18 for SQL Server
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd

# Install SQL Server drivers
RUN pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Enable and configure OPcache for production performance
RUN docker-php-ext-install opcache \
    && { \
        echo 'opcache.enable=1'; \
        echo 'opcache.memory_consumption=256'; \
        echo 'opcache.interned_strings_buffer=16'; \
        echo 'opcache.max_accelerated_files=20000'; \
        echo 'opcache.validate_timestamps=0'; \
        echo 'opcache.revalidate_freq=0'; \
        echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev --no-interaction --ignore-platform-reqs

# Install npm dependencies and build assets
RUN npm install && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Copy startup script
COPY start-container.sh /usr/local/bin/start-container
RUN chmod +x /usr/local/bin/start-container

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Enable compression for faster response times
RUN a2enmod deflate headers expires

# Disable any conflicting MPM modules if loaded
RUN if a2query -m mpm_event; then a2dismod mpm_event; fi && \
    if a2query -m mpm_worker; then a2dismod mpm_worker; fi

# Configure Apache document root and listen on Railway's PORT
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Set ServerName to suppress Apache warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Install Tailscale
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.noarmor.gpg -o /usr/share/keyrings/tailscale-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/tailscale-archive-keyring.gpg] https://pkgs.tailscale.com/stable/debian bookworm main" > /etc/apt/sources.list.d/tailscale.list && \
    apt-get update && \
    apt-get install -y tailscale && \
    rm -rf /var/lib/apt/lists/*

# Copy Tailscale startup script
COPY start-tailscale.sh /usr/local/bin/start-tailscale.sh
RUN chmod +x /usr/local/bin/start-tailscale.sh

# Expose port (Railway will set PORT env variable)
EXPOSE ${PORT:-80}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-80}/ || exit 1

# Start Tailscale first, then Apache
ENTRYPOINT ["/usr/local/bin/start-tailscale.sh"]
CMD ["/usr/local/bin/start-container"]
