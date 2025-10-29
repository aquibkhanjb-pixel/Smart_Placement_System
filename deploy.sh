#!/bin/bash

# Smart Placement System - Production Deployment Script
# This script automates the production deployment process

set -e  # Exit on any error

echo "🚀 Starting Smart Placement System Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please copy .env.production template and configure it for your environment"
    exit 1
fi

# Check if required environment variables are set
print_status "Checking environment configuration..."

# Source the production environment
export $(cat .env.production | grep -v '^#' | xargs)

# Validate critical environment variables
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL is not set in .env.production"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    print_error "JWT_SECRET is not set in .env.production"
    exit 1
fi

if [ "$JWT_SECRET" = "REPLACE_WITH_64_CHARACTER_SECURE_RANDOM_STRING" ]; then
    print_error "JWT_SECRET is still using default value. Please generate a secure secret!"
    print_warning "Run: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    exit 1
fi

if [ -z "$CLOUDINARY_CLOUD_NAME" ]; then
    print_warning "Cloudinary not configured. File uploads will use local storage."
fi

print_success "Environment configuration validated"

# Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Build the application
print_status "Building application for production..."
NODE_ENV=production npm run build

# Create necessary directories
print_status "Creating required directories..."
mkdir -p logs
mkdir -p public/uploads/resumes
mkdir -p public/uploads/company-docs

# Set proper permissions
print_status "Setting file permissions..."
chmod -R 755 public/uploads/
chmod 600 .env.production

# Security check
print_status "Running security audit..."
npm audit --audit-level high

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Stop existing PM2 processes (if any)
print_status "Stopping existing PM2 processes..."
pm2 stop smart-placement 2>/dev/null || true
pm2 delete smart-placement 2>/dev/null || true

# Start the application with PM2
print_status "Starting application with PM2..."
cp .env.production .env
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

print_success "Deployment completed successfully!"

echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Next Steps:"
echo "1. Configure your reverse proxy (Nginx/Apache)"
echo "2. Set up SSL certificate"
echo "3. Configure domain DNS"
echo "4. Set up monitoring and backups"
echo ""
echo "🔗 Application should be running on: http://localhost:3000"
echo "📊 Monitor with: pm2 monit"
echo "📋 View logs with: pm2 logs smart-placement"
echo ""
print_success "Smart Placement System is now running in production mode! 🎉"