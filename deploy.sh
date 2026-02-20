#!/bin/bash

# FinanceOS Deployment Script for VPS
# Usage: ./deploy.sh [your-domain-or-ip]

set -e

DOMAIN=${1:-localhost}
echo "🚀 Deploying FinanceOS to: $DOMAIN"

# Set backend URL
if [ "$DOMAIN" = "localhost" ]; then
    export REACT_APP_BACKEND_URL="http://localhost:8001"
else
    export REACT_APP_BACKEND_URL="https://$DOMAIN"
fi

echo "📦 Backend URL: $REACT_APP_BACKEND_URL"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🏥 Running health check..."
if curl -s http://localhost:8001/api/ | grep -q "FinanceOS"; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️ Backend health check failed. Check logs with: docker-compose logs backend"
fi

if curl -s http://localhost:3000 | grep -q "html"; then
    echo "✅ Frontend is healthy!"
else
    echo "⚠️ Frontend health check failed. Check logs with: docker-compose logs frontend"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📍 Access your app:"
echo "   - Frontend: http://$DOMAIN:3000"
echo "   - Backend API: http://$DOMAIN:8001/api/"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop: docker-compose down"
echo "   - Restart: docker-compose restart"
