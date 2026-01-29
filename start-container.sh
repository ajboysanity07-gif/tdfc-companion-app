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

# Add performance tuning to Apache config
cat >> /etc/apache2/conf-enabled/performance.conf <<'EOF'
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Enable browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# KeepAlive settings for connection reuse
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 5
EOF

# Wait for Tailscale to fully establish SOCKS5 proxy
echo "Waiting for Tailscale SOCKS5 proxy to stabilize..."
sleep 5

# Test SOCKS5 proxy is accessible
if ! nc -z 127.0.0.1 1055 2>/dev/null; then
    echo "⚠️  WARNING: SOCKS5 proxy not responding on localhost:1055"
else
    echo "✓ SOCKS5 proxy is listening on localhost:1055"
fi

# Start socat with aggressive timeouts and retry logic
# -d -d for verbose logging
# -T300: 300 second total inactivity timeout
# connect-timeout: 180s for initial SOCKS5 handshake
echo "Starting SQL Server tunnel through Tailscale SOCKS5..."
socat -d -d -T300 TCP-LISTEN:1433,fork,reuseaddr,so-keepalive,connect-timeout=180 SOCKS5:127.0.0.1:100.100.54.27:1433,socksport=1055 2>&1 | grep -v "transferred" &

# Wait for socat to start and verify it's listening
sleep 3
if ! nc -z 127.0.0.1 1433 2>/dev/null; then
    echo "⚠️  WARNING: Socat tunnel not listening on localhost:1433"
else
    echo "✓ Socat tunnel is listening on localhost:1433"
fi

# Start Apache in foreground
echo "Starting Apache..."
exec apache2-foreground
