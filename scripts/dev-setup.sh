#!/bin/bash
# Development Setup Script for Sahakar Setu

set -e

echo "🚀 Setting up Sahakar Setu development environment..."

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
    echo "✅ $1 found"
}

echo "Checking prerequisites..."
check_command docker
check_command docker-compose
check_command node
check_command npm
check_command python3
check_command flutter

# Create .env from example if not exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your API keys (OPENAI_API_KEY, BHASHINI_API_KEY, etc.)"
fi

# Start infrastructure services
echo "Starting infrastructure services (MongoDB, Redis, MinIO, Keycloak)..."
docker-compose up -d mongodb redis minio keycloak keycloak-db

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 10

# Check service health
check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo "Checking $service..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $service is healthy"
            return 0
        fi
        echo "  Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    echo "❌ $service failed to start"
    return 1
}

check_service "MongoDB" "http://localhost:27017" || true
check_service "Redis" "http://localhost:6379" || true
check_service "MinIO" "http://localhost:9000/minio/health/live" || true
check_service "Keycloak" "http://localhost:8080/health/ready" || true

# Install API Gateway dependencies
echo "Installing API Gateway dependencies..."
cd services/api-gateway
npm install
cd ../..

# Install Web Admin dependencies
echo "Installing Web Admin dependencies..."
cd clients/web-admin
npm install
cd ../..

# Install Python dependencies for services
echo "Installing Python service dependencies..."
for service in erp-service lms-service attendance-service employment-service analytics-service ai-service; do
    if [ -f "services/$service/requirements.txt" ]; then
        echo "  Installing $service..."
        cd "services/$service"
        pip install -r requirements.txt
        cd ../..
    fi
done

# Get Flutter dependencies
echo "Getting Flutter dependencies..."
cd clients/mobile
flutter pub get
cd ../..

# Generate code for Flutter (freezed, json_serializable)
echo "Generating Flutter code..."
cd clients/mobile
flutter packages pub run build_runner build --delete-conflicting-outputs
cd ../..

# Generate TypeScript types from Pydantic models
echo "Generating TypeScript types..."
cd packages/shared
# pydantic2ts --input ../../services/erp-service/app/models --output types 2>/dev/null || echo "  pydantic2ts not available, skipping"
cd ../..

# Seed demo data
echo "Seeding demo data..."
docker-compose up -d erp-service
sleep 5
docker-compose exec erp-service python scripts/seed_demo.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Edit .env with your API keys"
echo "  2. Start all services: docker-compose up -d"
echo "  3. Access Keycloak: http://localhost:8080 (admin/admin)"
echo "  4. Start Web Admin: cd clients/web-admin && npm run dev"
echo "  4. Start Mobile: cd clients/mobile && flutter run"
echo ""
echo "🔗 Service URLs:"
echo "  - API Gateway: http://localhost:3000"
echo "  - ERP Service: http://localhost:8001/docs"
echo "  - LMS Service: http://localhost:8002/docs"
echo "  - Attendance: http://localhost:8003/docs"
echo "  - Employment: http://localhost:8004/docs"
echo "  - Analytics: http://localhost:8005/docs"
echo "  - AI Service: http://localhost:8006/docs"
echo "  - MinIO Console: http://localhost:9001"
echo "  - Keycloak: http://localhost:8080"