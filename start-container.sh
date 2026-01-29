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

# Wait for Tailscale to fully establish SOCKS5 proxy
echo "Waiting for Tailscale SOCKS5 proxy to stabilize..."
sleep 5

# Start socat with aggressive timeouts and retry logic
# connect-timeout: 180s for initial SOCKS5 handshake
# read timeout: 300s for SQL Server TLS negotiation
echo "Starting SQL Server tunnel through Tailscale SOCKS5..."
socat TCP-LISTEN:1433,fork,reuseaddr,so-keepalive,connect-timeout=180,readbytes=unlimited SOCKS5:127.0.0.1:100.100.54.27:1433,socksport=1055,connect-timeout=180,readbytes=unlimited &

# Wait for socat to start
sleep 3

# Start Apache in foreground
echo "Starting Apache..."
exec apache2-foreground
