FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip \
    gnupg apt-transport-https unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# Install ODBC Driver 18 for SQL Server
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18 && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd opcache && \
    pecl install sqlsrv pdo_sqlsrv && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

# Copy Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy and install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --optimize-autoloader

# Copy application
COPY . .

# Regenerate autoloader
RUN composer dump-autoload --optimize

# Install Node dependencies and build assets
RUN npm ci && npm run build

# Clean up Node
RUN rm -rf node_modules

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Configure Apache - fix MPM conflict by editing mods-available directly
RUN rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf /etc/apache2/mods-available/mpm_*.load /etc/apache2/mods-available/mpm_*.conf && \
    mkdir -p /etc/apache2/mods-available && \
    echo "LoadModule mpm_prefork_module modules/mod_mpm_prefork.so" > /etc/apache2/mods-available/mpm_prefork.load && \
    touch /etc/apache2/mods-available/mpm_prefork.conf && \
    mkdir -p /etc/apache2/mods-enabled && \
    ln -s /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load && \
    ln -s /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf && \
    a2enmod rewrite && \
    sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

# Install Tailscale
RUN apt-get update && \
    curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.noarmor.gpg -o /usr/share/keyrings/tailscale-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/tailscale-archive-keyring.gpg] https://pkgs.tailscale.com/stable/debian bookworm main" > /etc/apt/sources.list.d/tailscale.list && \
    apt-get update && apt-get install -y tailscale && rm -rf /var/lib/apt/lists/*

# Copy startup scripts
COPY start-tailscale.sh /usr/local/bin/start-tailscale
COPY start-container.sh /usr/local/bin/start-container
RUN chmod +x /usr/local/bin/start-tailscale /usr/local/bin/start-container

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/start-tailscale"]
CMD ["/usr/local/bin/start-container"]
