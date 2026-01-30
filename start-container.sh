#!/bin/bash
set -e

# Run initialization tasks in parallel for faster startup
{
    # Create storage link for public file access
    php artisan storage:link 2>/dev/null || true
} &

{
    # Cache Laravel configs (already cached in Dockerfile, just refresh)
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
} &

# Wait for parallel tasks to complete
wait

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

# Apache MPM Prefork tuning for Railway (512MB container)
<IfModule mpm_prefork_module>
    StartServers 2
    MinSpareServers 2
    MaxSpareServers 5
    MaxRequestWorkers 20
    MaxConnectionsPerChild 1000
</IfModule>
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

# Skip socat tunnel - connect directly to SQL Server IP via SOCKS5
# If DB_HOST is not set, assume local SQL Server on Railway Tailscale
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
    echo "⚠️  ERROR: DB_HOST not properly configured"
    echo "   Current: DB_HOST=$DB_HOST"
    echo "   Required: DB_HOST=100.100.54.27 (your desktop's Tailscale IP)"
    echo ""
    echo "   Set this in Railway dashboard:"
    echo "   1. Go to your Railway project"
    echo "   2. Select 'Variables' tab"
    echo "   3. Add: DB_HOST = 100.100.54.27"
    echo "   4. Redeploy"
    exit 1
else
    echo "✓ SQL Server configured: $DB_HOST:${DB_PORT:-1433}"
fi

# Start Apache in foreground
echo "Starting Apache..."
exec apache2-foreground
