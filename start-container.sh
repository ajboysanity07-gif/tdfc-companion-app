#!/bin/bash
set -e

# Create storage link for public file access
php artisan storage:link

# Cache Laravel configs
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Disable conflicting MPM modules
a2dismod mpm_event mpm_worker 2>/dev/null || true

# Configure Apache to use Railway's PORT (defaults to 80 if not set)
PORT=${PORT:-80}
echo "Configuring Apache to listen on port $PORT"

# Update Apache ports configuration
sed -i "s/Listen 80/Listen 0.0.0.0:$PORT/" /etc/apache2/ports.conf

# Update VirtualHost configuration to listen on all interfaces
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:$PORT>/" /etc/apache2/sites-available/*.conf

# Verify configuration
echo "Apache will listen on 0.0.0.0:$PORT"
cat /etc/apache2/ports.conf | grep Listen
cat /etc/apache2/sites-available/000-default.conf | grep VirtualHost

# Start Apache
exec apache2-foreground
