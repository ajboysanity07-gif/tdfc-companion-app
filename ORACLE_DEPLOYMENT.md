# Oracle Cloud Free Tier Deployment Guide

## Prerequisites
- Oracle Cloud account (free tier)
- Your application is ready and tested locally
- Basic understanding of Linux commands

## Step 1: Create Oracle Cloud Account
1. Go to https://www.oracle.com/cloud/free/
2. Sign up for Oracle Cloud Free Tier
3. Complete verification (requires credit card but won't be charged)
4. Wait for account activation

## Step 2: Create Compute Instance (VM)

### Launch Instance
1. Login to Oracle Cloud Console
2. Navigate to: **Compute** → **Instances** → **Create Instance**

### Instance Configuration
- **Name**: `tdfc-app-server`
- **Image**: Ubuntu 22.04 (recommended)
- **Shape**: 
  - Choose **VM.Standard.A1.Flex** (Ampere ARM - Free tier eligible)
  - OCPU: 2
  - Memory: 12 GB
  - OR choose **VM.Standard.E2.1.Micro** (x86 - simpler but less resources)

### Networking
- **Virtual Cloud Network**: Create new or use existing
- **Subnet**: Public subnet
- **Public IP**: Assign public IPv4 address ✓

### SSH Keys
- **Generate SSH Key Pair**: Download both private and public keys
- Save the private key securely (e.g., `tdfc-oracle-key.pem`)

### Boot Volume
- Default 50 GB is sufficient

Click **Create** and wait for instance to provision (2-5 minutes)

## Step 3: Configure Security Rules

### Add Ingress Rules
1. Go to your instance details
2. Click on the subnet name
3. Click on **Default Security List**
4. Click **Add Ingress Rules**

Add these rules:
```
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port: 80 (HTTP)

Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port: 443 (HTTPS)

Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port: 22 (SSH)
```

## Step 4: Connect to Your Instance

### From Windows PowerShell:
```powershell
# Set correct permissions on private key
icacls "path\to\tdfc-oracle-key.pem" /inheritance:r
icacls "path\to\tdfc-oracle-key.pem" /grant:r "$env:USERNAME:R"

# Connect via SSH
ssh -i "path\to\tdfc-oracle-key.pem" ubuntu@<YOUR_PUBLIC_IP>
```

## Step 5: Server Setup Script

Once connected, run this setup script:

```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y software-properties-common curl wget git unzip

# Install PHP 8.2
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common \
  php8.2-mysql php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip \
  php8.2-bcmath php8.2-gd php8.2-intl php8.2-soap php8.2-sqlite3

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourStrongPassword123!';"
sudo mysql -e "DELETE FROM mysql.user WHERE User='';"
sudo mysql -e "DROP DATABASE IF EXISTS test;"
sudo mysql -e "FLUSH PRIVILEGES;"

# Create database and user
sudo mysql -u root -pYourStrongPassword123! <<EOF
CREATE DATABASE tdfc_app;
CREATE USER 'tdfc_user'@'localhost' IDENTIFIED BY 'TdfcUser@2026!';
GRANT ALL PRIVILEGES ON tdfc_app.* TO 'tdfc_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF

# Install Nginx
sudo apt install -y nginx

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "✓ Server setup complete!"
```

Save this as `setup.sh`, make it executable, and run:
```bash
chmod +x setup.sh
./setup.sh
```

## Step 6: Deploy Application

### 1. Create application directory
```bash
sudo mkdir -p /var/www/tdfc-app
sudo chown -R ubuntu:ubuntu /var/www/tdfc-app
cd /var/www/tdfc-app
```

### 2. Clone or Upload Your Code

**Option A: Using Git (Recommended)**
```bash
# If you have a Git repository
git clone <your-repo-url> .
```

**Option B: Upload via SCP from your local machine**
```powershell
# From your Windows machine in the project directory
scp -i "path\to\tdfc-oracle-key.pem" -r * ubuntu@<YOUR_PUBLIC_IP>:/var/www/tdfc-app/
```

### 3. Install Dependencies
```bash
cd /var/www/tdfc-app

# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Install Node dependencies and build
npm install
npm run build
```

### 4. Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit environment file
nano .env
```

Update these values in `.env`:
```env
APP_NAME="TDFC App"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://<YOUR_PUBLIC_IP>

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tdfc_app
DB_USERNAME=tdfc_user
DB_PASSWORD=TdfcUser@2026!

# Generate these in next step
APP_KEY=
```

### 5. Generate Application Key
```bash
php artisan key:generate
```

### 6. Run Migrations
```bash
php artisan migrate --force
php artisan db:seed --force  # If you have seeders
```

### 7. Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/tdfc-app
sudo chmod -R 755 /var/www/tdfc-app
sudo chmod -R 775 /var/www/tdfc-app/storage
sudo chmod -R 775 /var/www/tdfc-app/bootstrap/cache
```

## Step 7: Configure Nginx

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/tdfc-app
```

Paste this configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name <YOUR_PUBLIC_IP>;
    root /var/www/tdfc-app/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 20M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/tdfc-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
```

## Step 8: SSL Setup (Optional but Recommended)

### Using Let's Encrypt (Free SSL)

First, you need a domain name pointing to your IP. If you don't have one:
- Use a free subdomain service like FreeDNS, Afraid.org, or DuckDNS
- Point it to your Oracle Cloud public IP

Once you have a domain:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts to set up SSL.

## Step 9: Create Deployment Script

Create a script for easy updates:
```bash
nano /var/www/tdfc-app/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Enable maintenance mode
php artisan down

# Pull latest changes (if using git)
# git pull origin main

# Install/update dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# Clear and cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Set permissions
sudo chown -R www-data:www-data /var/www/tdfc-app
sudo chmod -R 755 /var/www/tdfc-app
sudo chmod -R 775 /var/www/tdfc-app/storage
sudo chmod -R 775 /var/www/tdfc-app/bootstrap/cache

# Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx

# Disable maintenance mode
php artisan up

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

## Step 10: Optimize for Production

```bash
cd /var/www/tdfc-app

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize Composer autoloader
composer dump-autoload --optimize

# Clear application cache
php artisan cache:clear
```

## Step 11: Set Up Process Monitoring (Optional)

Install Supervisor for queue workers:
```bash
sudo apt install -y supervisor

sudo nano /etc/supervisor/conf.d/tdfc-worker.conf
```

```ini
[program:tdfc-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/tdfc-app/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/tdfc-app/storage/logs/worker.log
stopwaitsecs=3600
```

Start supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start tdfc-worker:*
```

## Step 12: Backup Strategy

Create a backup script:
```bash
nano ~/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u tdfc_user -pTdfcUser@2026! tdfc_app > $BACKUP_DIR/db_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/tdfc-app

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x ~/backup.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup.sh") | crontab -
```

## Access Your Application

Your application should now be accessible at:
- **HTTP**: `http://<YOUR_PUBLIC_IP>`
- **HTTPS** (if SSL configured): `https://yourdomain.com`

## Troubleshooting

### Check logs:
```bash
# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PHP-FPM logs
sudo tail -f /var/log/php8.2-fpm.log

# Laravel logs
tail -f /var/www/tdfc-app/storage/logs/laravel.log
```

### Common Issues:

**500 Error:**
```bash
cd /var/www/tdfc-app
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

**Database Connection Error:**
```bash
# Test database connection
mysql -u tdfc_user -pTdfcUser@2026! tdfc_app

# Check .env file
cat /var/www/tdfc-app/.env | grep DB_
```

**Nginx not starting:**
```bash
sudo nginx -t  # Test configuration
sudo systemctl status nginx
```

## Security Checklist

- [ ] Changed default MySQL password
- [ ] Set `APP_DEBUG=false` in production
- [ ] Configured firewall (ufw)
- [ ] Set up SSL certificate
- [ ] Regular backups configured
- [ ] Disabled directory listing
- [ ] Set proper file permissions
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`

## Monitoring

Monitor your application:
```bash
# Check system resources
htop

# Monitor disk usage
df -h

# Check running services
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
```

## Cost Considerations

Oracle Cloud Free Tier includes:
- ✓ 2 VMs (E2.1.Micro) or 1 VM (A1.Flex with 4 OCPUs, 24GB RAM)
- ✓ 200GB block storage
- ✓ 10TB/month outbound data transfer
- ✓ Always Free (no time limit)

Your application should run completely free as long as you stay within these limits!

## Need Help?

Common commands:
```bash
# Restart all services
sudo systemctl restart nginx php8.2-fpm mysql

# View Laravel logs
tail -f /var/www/tdfc-app/storage/logs/laravel.log

# Run artisan commands
cd /var/www/tdfc-app && php artisan <command>

# Update application
cd /var/www/tdfc-app && ./deploy.sh
```
