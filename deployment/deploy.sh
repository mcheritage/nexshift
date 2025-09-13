#!/bin/bash
# Universal Deployment Script
# Copy this to any Laravel project and it will work with minimal configuration

set -e

# =============================================================================
# CONFIGURATION - Variables are now set in GitHub Actions workflow
# =============================================================================

# VPS Configuration
VPS_HOST="${VPS_HOST:-}"
VPS_USER="${VPS_USER:-}"
VPS_PATH="${VPS_PATH:-}"

# Project Configuration (set in GitHub workflow)
PROJECT_NAME="${PROJECT_NAME:-nexshift}"
DEPLOY_ENV="${DEPLOY_ENV:-sandbox}"
PROJECT_PORT="${PROJECT_PORT:-8080}"

# Nginx Port Configuration (auto-calculated from PROJECT_PORT)
NGINX_PORT_80="${PROJECT_PORT}"
NGINX_PORT_443="$((PROJECT_PORT + 1))"

# Domain Configuration (set in GitHub workflow)
DOMAIN="${DOMAIN:-nexshift.sandbox.novarelabs.dev}"
API_DOMAIN="${API_DOMAIN:-api.nexshift.sandbox.novarelabs.dev}"

# Deployment Options (set in GitHub workflow)
FORCE_REBUILD="${FORCE_REBUILD:-false}"
CLEAR_VOLUMES="${CLEAR_VOLUMES:-false}"
SEED_DATA="${SEED_DATA:-false}"
FORCE_CLEANUP="${FORCE_CLEANUP:-false}"
CLEAR_NODE_MODULES="${CLEAR_NODE_MODULES:-false}"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

# Function to run docker-compose commands with environment variables
run_docker_compose() {
    local command="$1"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && PROJECT_NAME=$PROJECT_NAME NGINX_PORT_80=$NGINX_PORT_80 NGINX_PORT_443=$NGINX_PORT_443 docker-compose -f $COMPOSE_FILE -p $COMPOSE_PROJECT_NAME $command"
}

# =============================================================================
# SCRIPT LOGIC - Don't edit below this line
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 $PROJECT_NAME App Deployment Script${NC}"
echo -e "${YELLOW}Project: $PROJECT_NAME${NC}"
echo -e "${YELLOW}Environment: $DEPLOY_ENV${NC}"
echo -e "${YELLOW}HTTP Port: $NGINX_PORT_80${NC}"
echo -e "${YELLOW}HTTPS Port: $NGINX_PORT_443${NC}"

# Show which variables are set from GitHub
echo ""
echo -e "${BLUE}🔧 Configuration Sources:${NC}"
if [ -n "$GITHUB_ACTIONS" ]; then
  echo -e "${GREEN}✅ Running in GitHub Actions${NC}"
  echo "  GitHub Variables:"
  [ -n "$PROJECT_NAME" ] && echo "    PROJECT_NAME: $PROJECT_NAME"
  [ -n "$PROJECT_PORT" ] && echo "    PROJECT_PORT: $PROJECT_PORT"
  [ -n "$NGINX_PORT_80" ] && echo "    NGINX_PORT_80: $NGINX_PORT_80"
  [ -n "$NGINX_PORT_443" ] && echo "    NGINX_PORT_443: $NGINX_PORT_443"
  [ -n "$DOMAIN" ] && echo "    DOMAIN: $DOMAIN"
  [ -n "$API_DOMAIN" ] && echo "    API_DOMAIN: $API_DOMAIN"
  [ -n "$FORCE_REBUILD" ] && echo "    FORCE_REBUILD: $FORCE_REBUILD"
  [ -n "$CLEAR_VOLUMES" ] && echo "    CLEAR_VOLUMES: $CLEAR_VOLUMES"
  [ -n "$SEED_DATA" ] && echo "    SEED_DATA: $SEED_DATA"
  [ -n "$FORCE_CLEANUP" ] && echo "    FORCE_CLEANUP: $FORCE_CLEANUP"
else
  echo -e "${YELLOW}⚠️  Running locally - using default values${NC}"
fi
echo ""

# Validate configuration
if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ] || [ -z "$VPS_PATH" ]; then
    echo -e "${RED}❌ Error: VPS_HOST, VPS_USER, and VPS_PATH must be set${NC}"
    exit 1
fi

# Set derived variables
COMPOSE_PROJECT_NAME="${PROJECT_NAME}_${DEPLOY_ENV}"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  VPS: $VPS_USER@$VPS_HOST:$VPS_PATH"
echo "  Project: $PROJECT_NAME"
echo "  Environment: $DEPLOY_ENV"
echo "  HTTP Port: $NGINX_PORT_80"
echo "  HTTPS Port: $NGINX_PORT_443"
echo "  Database: $DB_DATABASE"
echo ""

# Use the main compose file
COMPOSE_FILE="deployment/docker-compose.yml"
if [ -n "$DOMAIN" ]; then
  echo -e "${GREEN}✅ Using domain-based configuration for $DOMAIN${NC}"
else
  echo -e "${YELLOW}⚠️  Using standard configuration (no domain)${NC}"
fi

# Check if VPS_PATH exists and handle repository setup
echo -e "${BLUE}📁 Checking project directory...${NC}"
if ssh $VPS_USER@$VPS_HOST "[ -d \"$VPS_PATH\" ]"; then
    echo -e "${GREEN}✅ Project directory exists, pulling latest changes...${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && GIT_SSH_COMMAND='ssh -i ~/.ssh/nexshift' git fetch origin && GIT_SSH_COMMAND='ssh -i ~/.ssh/nexshift' git reset --hard origin/$DEPLOY_ENV"
else
    echo -e "${YELLOW}⚠️  Project directory does not exist, creating and cloning repository...${NC}"

    # Create the parent directory if it doesn't exist
    ssh $VPS_USER@$VPS_HOST "mkdir -p \$(dirname \"$VPS_PATH\")"

    # Clone the repository using SSH key
    echo -e "${BLUE}📥 Cloning repository to $VPS_PATH using SSH key...${NC}"
    ssh $VPS_USER@$VPS_HOST "GIT_SSH_COMMAND='ssh -i ~/.ssh/nexshift' git clone -b $DEPLOY_ENV git@github.com:novarelabs/nexshift.git \"$VPS_PATH\""

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to clone repository. Please check:${NC}"
        echo "  1. Repository URL is correct"
        echo "  2. SSH key is properly configured"
        echo "  3. Branch '$DEPLOY_ENV' exists"
        echo "  4. User has access to the repository"
        exit 1
    fi

    echo -e "${GREEN}✅ Repository cloned successfully${NC}"
fi


# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
run_docker_compose "down"

# Handle volume cache issues and conflicts
if [ "$FORCE_CLEANUP" = "true" ]; then
  echo -e "${RED}🧨 Force cleanup mode - removing ALL project containers and volumes...${NC}"

  # Stop and remove all containers and volumes
  run_docker_compose "down -v --remove-orphans"

  # Remove all project-related volumes
  ssh $VPS_USER@$VPS_HOST "docker volume ls -q | grep -E '${COMPOSE_PROJECT_NAME}_|${PROJECT_NAME}_' | xargs -r docker volume rm --force" || echo "No volumes to remove"

  # Remove any orphaned containers
  ssh $VPS_USER@$VPS_HOST "docker ps -a -q --filter name=${COMPOSE_PROJECT_NAME} | xargs -r docker rm --force" || echo "No orphaned containers to remove"

  echo -e "${RED}⚠️ Force cleanup completed. All project data has been removed.${NC}"

elif [ "$CLEAR_VOLUMES" = "true" ]; then
  echo -e "${YELLOW}🗑️ Clearing project volumes to resolve cache issues...${NC}"

  # Stop containers and remove project-specific volumes
  run_docker_compose "down -v"

  # Remove only volumes specific to this project
  # Docker Compose creates volumes with pattern: PROJECT_NAME_ENV_volumename
  # Example: nexshift_sandbox_code_base, nexshift_sandbox_db_data, etc.
  ssh $VPS_USER@$VPS_HOST "docker volume ls -q | grep -E '${COMPOSE_PROJECT_NAME}_|${PROJECT_NAME}_' | xargs -r docker volume rm" || echo "No project-specific volumes found to remove"

  echo -e "${YELLOW}⚠️ Project volumes cleared. This will reset database and cache data for $PROJECT_NAME only.${NC}"
else
  # Always clean up any conflicting volumes before starting
  echo -e "${BLUE}🧹 Cleaning up any conflicting volumes...${NC}"
  run_docker_compose "down" || echo "No containers to stop"

  # Remove any orphaned volumes that might cause conflicts
  ssh $VPS_USER@$VPS_HOST "docker volume ls -q | grep -E '${COMPOSE_PROJECT_NAME}_|${PROJECT_NAME}_' | xargs -r docker volume rm" || echo "No conflicting volumes found"

  # Clean up any corrupted volume data
  echo -e "${BLUE}🔧 Cleaning up corrupted volume data...${NC}"
  ssh $VPS_USER@$VPS_HOST "docker volume ls -q | grep -E '${COMPOSE_PROJECT_NAME}_|${PROJECT_NAME}_' | while read volume; do echo \"Checking volume: \$volume\"; docker volume inspect \$volume 2>/dev/null || (echo \"Volume \$volume is corrupted, removing...\" && docker volume rm --force \$volume 2>/dev/null || true); done" || echo "Volume check completed"
fi

# Clear Docker build cache if force rebuild is enabled
if [ "$FORCE_REBUILD" = "true" ]; then
  echo -e "${YELLOW}🧹 Clearing Docker build cache...${NC}"
  ssh $VPS_USER@$VPS_HOST "docker builder prune -f"
  echo "Build cache cleared."
fi

# Fix Git ownership issues on VPS before building containers
echo -e "${BLUE}🔧 Fixing Git ownership issues...${NC}"
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && git config --global --add safe.directory $VPS_PATH" || echo "Git config already set"
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && git config --global user.name 'Deployment Script'" || echo "Git user.name already set"
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && git config --global user.email 'deploy@novarelabs.dev'" || echo "Git user.email already set"
echo -e "${GREEN}✅ Git ownership issues resolved${NC}"

# Copy .env file to VPS
echo -e "${BLUE}📋 Copying .env file...${NC}"

# Create .env from GitHub APP_ENV variable (if set)
if [ -n "$APP_ENV" ]; then
    echo -e "${BLUE}📋 Creating .env from GitHub APP_ENV variable...${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && echo '$APP_ENV' > .env"
    # Set ownership and permissions so the Docker container can write to the .env file
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && sudo chown 1000:1000 .env && chmod 644 .env"
    echo -e "${GREEN}✅ .env created from GitHub APP_ENV variable with proper permissions${NC}"
fi

# Build new containers
echo -e "${BLUE}🔨 Building containers...${NC}"
if [ "$FORCE_REBUILD" = "true" ]; then
  run_docker_compose "build --no-cache"
else
  run_docker_compose "build"
fi

# Handle any remaining volume conflicts
echo -e "${BLUE}🔧 Checking for volume conflicts...${NC}"
ssh $VPS_USER@$VPS_HOST "docker volume ls -q | grep -E '${COMPOSE_PROJECT_NAME}_|${PROJECT_NAME}_' | while read volume; do echo \"Checking volume: \$volume\"; docker volume inspect \$volume 2>/dev/null || echo \"Volume \$volume is corrupted, removing...\"; done" || echo "Volume check completed"

# Start containers
echo -e "${BLUE}🚀 Starting containers...${NC}"

# Clean up any existing node_modules conflicts before starting
if [ "$CLEAR_NODE_MODULES" = "true" ] || [ "$CLEAR_VOLUMES" = "true" ] || [ "$FORCE_CLEANUP" = "true" ]; then
  echo -e "${BLUE}🧹 Cleaning up node_modules conflicts...${NC}"
  if ssh $VPS_USER@$VPS_HOST "docker volume ls -q | grep -q '${COMPOSE_PROJECT_NAME}_code_base'"; then
    ssh $VPS_USER@$VPS_HOST "docker run --rm -v ${COMPOSE_PROJECT_NAME}_code_base:/var/www alpine:latest sh -c 'rm -rf /var/www/node_modules 2>/dev/null || true'" || echo "Node modules cleanup completed"
  else
    echo "Code base volume doesn't exist yet, will be created fresh"
  fi
else
  echo -e "${BLUE}🧹 Checking for node_modules conflicts...${NC}"
  if ssh $VPS_USER@$VPS_HOST "docker volume ls -q | grep -q '${COMPOSE_PROJECT_NAME}_code_base'"; then
    # Only clean if there's a conflict
    if ssh $VPS_USER@$VPS_HOST "docker run --rm -v ${COMPOSE_PROJECT_NAME}_code_base:/var/www alpine:latest sh -c 'test -d /var/www/node_modules && echo \"exists\"' 2>/dev/null"; then
      echo -e "${YELLOW}⚠️  Found existing node_modules, cleaning to prevent conflicts...${NC}"
      ssh $VPS_USER@$VPS_HOST "docker run --rm -v ${COMPOSE_PROJECT_NAME}_code_base:/var/www alpine:latest sh -c 'rm -rf /var/www/node_modules 2>/dev/null || true'" || echo "Node modules cleanup completed"
    else
      echo "No existing node_modules found"
    fi
  else
    echo "Code base volume doesn't exist yet, will be created fresh"
  fi
fi

run_docker_compose "up -d"

# Note: SSL certificates are handled by the main VPS nginx reverse proxy
echo -e "${BLUE}ℹ️  SSL certificates are managed by the main VPS nginx reverse proxy${NC}"

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check if containers are running properly
echo -e "${BLUE}📊 Checking container status...${NC}"
run_docker_compose "ps"

# Generate application key if not set
echo -e "${BLUE}🔑 Generating application key...${NC}"
run_docker_compose "exec -T app php artisan key:generate --force"

# Run database migrations
echo -e "${BLUE}🗄️ Running database migrations...${NC}"
run_docker_compose "exec -T app php artisan migrate --force"

# Seed database if SEED_DATA is enabled
if [ "$SEED_DATA" = "true" ]; then
  echo -e "${BLUE}🌱 Seeding database with sample data...${NC}"
  run_docker_compose "exec -T app php artisan db:seed --force"
  echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
  echo -e "${YELLOW}⚠️  Skipping database seeding (SEED_DATA=false)${NC}"
fi

# Clear all caches to resolve volume cache issues
echo -e "${BLUE}🧹 Clearing application caches...${NC}"
run_docker_compose "exec -T app php artisan config:clear"
run_docker_compose "exec -T app php artisan cache:clear"
run_docker_compose "exec -T app php artisan route:clear"
run_docker_compose "exec -T app php artisan view:clear"

# Clear Redis cache if it exists
echo -e "${BLUE}🔴 Clearing Redis cache...${NC}"
run_docker_compose "exec -T redis redis-cli FLUSHALL" || echo "Redis cache clear failed (container might not be ready yet)"

# Optimize for production
echo -e "${BLUE}⚡ Optimizing for production...${NC}"
run_docker_compose "exec -T app php artisan config:cache"
run_docker_compose "exec -T app php artisan route:cache"
run_docker_compose "exec -T app php artisan view:cache"

# Set proper permissions (using the dev user that's configured in Dockerfile)
echo -e "${BLUE}🔐 Setting proper permissions...${NC}"
run_docker_compose "exec -T --user root app chown -R dev:dev storage bootstrap/cache && chmod -R 775 storage bootstrap/cache" || echo "Permission setting failed (this is OK if files are already owned correctly)"

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Project Information:${NC}"
echo "  Project Name: $PROJECT_NAME"
echo "  Environment: $DEPLOY_ENV"
echo "  Container Prefix: $COMPOSE_PROJECT_NAME"
echo "  Nginx Container: ${PROJECT_NAME}_nginx_prod"
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo "  HTTP:  http://$VPS_HOST:$NGINX_PORT_80"
echo "  HTTPS: https://$VPS_HOST:$NGINX_PORT_443"
if [ -n "$DOMAIN" ]; then
  echo "  Main Domain: https://$DOMAIN"
  echo "  API Domain: https://$API_DOMAIN"
fi
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "  # View logs"
echo "  ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE -p $COMPOSE_PROJECT_NAME logs'"
echo ""
echo "  # Force rebuild"
echo "  FORCE_REBUILD=true ./deployment/deploy.sh"
echo ""
echo "  # Clear project volumes (safe - only affects this project)"
echo "  CLEAR_VOLUMES=true ./deployment/deploy.sh"
echo ""
echo -e "${GREEN}🎉 Your $PROJECT_NAME project is now live!${NC}"
