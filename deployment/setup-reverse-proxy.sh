#!/bin/bash
# Setup script for nginx reverse proxy configuration
# Run this on your VPS to configure the reverse proxy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting up Nginx Reverse Proxy for Nexshift Web Admin${NC}"

# Configuration variables
DOMAIN="${1:-nexshift.sandbox.novarelabs.dev}"
API_DOMAIN="${2:-api.nexshift.sandbox.novarelabs.dev}"
PROJECT_PORT="${3:-8080}"

if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️  Usage: $0 <domain> [api-domain] [port]${NC}"
    echo "Example: $0 nexshift.sandbox.novarelabs.dev api.nexshift.sandbox.novarelabs.dev 8080"
    echo ""
    echo -e "${BLUE}Please provide your domain name:${NC}"
    read -p "Domain (e.g., nexshift.sandbox.novarelabs.dev): " DOMAIN
    read -p "API Domain (optional, e.g., api.nexshift.sandbox.novarelabs.dev): " API_DOMAIN
    read -p "Project Port (default: 8080): " PROJECT_PORT
    PROJECT_PORT="${PROJECT_PORT:-8080}"
fi

echo ""
echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  API Domain: $API_DOMAIN"
echo "  Project Port: $PROJECT_PORT"
echo ""

# Create nginx configuration
echo -e "${BLUE}📝 Creating nginx configuration...${NC}"

# Backup existing config if it exists
if [ -f "/etc/nginx/sites-available/$DOMAIN" ]; then
    echo -e "${YELLOW}⚠️  Backing up existing configuration...${NC}"
    sudo cp "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-available/$DOMAIN.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create the nginx configuration
sudo tee "/etc/nginx/sites-available/$DOMAIN" > /dev/null <<EOF
# Nginx Reverse Proxy Configuration for Nexshift Web Admin
# Generated on $(date)

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $DOMAIN;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/sandbox.novarelabs.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sandbox.novarelabs.dev/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy Settings
    location / {
        proxy_pass http://localhost:$PROJECT_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:$PROJECT_PORT/health;
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF

# Add API subdomain if provided
if [ -n "$API_DOMAIN" ] && [ "$API_DOMAIN" != "null" ]; then
    echo -e "${BLUE}📝 Adding API subdomain configuration...${NC}"

    # Backup existing API config if it exists
    if [ -f "/etc/nginx/sites-available/$API_DOMAIN" ]; then
        echo -e "${YELLOW}⚠️  Backing up existing API configuration...${NC}"
        sudo cp "/etc/nginx/sites-available/$API_DOMAIN" "/etc/nginx/sites-available/$API_DOMAIN.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Create API nginx configuration
    sudo tee "/etc/nginx/sites-available/$API_DOMAIN" > /dev/null <<EOF
# API Nginx Reverse Proxy Configuration for Nexshift Web Admin
# Generated on $(date)

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $API_DOMAIN;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    server_name $API_DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/sandbox.novarelabs.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sandbox.novarelabs.dev/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy Settings
    location / {
        proxy_pass http://localhost:$PROJECT_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # API-specific headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";

        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
}
EOF

    # Enable API site
    sudo ln -sf "/etc/nginx/sites-available/$API_DOMAIN" "/etc/nginx/sites-enabled/"
    echo -e "${GREEN}✅ API subdomain configuration created and enabled${NC}"
fi

# Enable the main site
echo -e "${BLUE}🔗 Enabling nginx site...${NC}"
sudo ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/"

# Test nginx configuration
echo -e "${BLUE}🧪 Testing nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration is invalid. Please check the configuration.${NC}"
    exit 1
fi

# Reload nginx
echo -e "${BLUE}🔄 Reloading nginx...${NC}"
sudo systemctl reload nginx

echo ""
echo -e "${GREEN}✅ Reverse proxy setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Set up SSL certificates for your domains:"
echo "   sudo certbot --nginx -d $DOMAIN"
if [ -n "$API_DOMAIN" ] && [ "$API_DOMAIN" != "null" ]; then
    echo "   sudo certbot --nginx -d $API_DOMAIN"
fi
echo ""
echo "2. Update your DNS records to point to this server"
echo ""
echo "3. Deploy your project with the correct port:"
echo "   PROJECT_PORT=$PROJECT_PORT ./deployment/deploy.sh"
echo ""
echo -e "${BLUE}🌐 Your application will be available at:${NC}"
echo "  https://$DOMAIN"
if [ -n "$API_DOMAIN" ] && [ "$API_DOMAIN" != "null" ]; then
    echo "  https://$API_DOMAIN"
fi
echo ""
echo -e "${YELLOW}⚠️  Note: Make sure your project is running on port $PROJECT_PORT${NC}"
