#!/bin/bash

echo "Project Bridge MVP - Supabase Setup"
echo "=================================="

# Wait for Docker to be ready
echo "Checking Docker status..."
until docker info >/dev/null 2>&1; do
    echo "Waiting for Docker to start..."
    sleep 2
done

echo "✓ Docker is ready!"

# Start Supabase services
echo "Starting Supabase services..."
cd "$(dirname "$0")"
docker-compose up -d

echo "✓ Services started!"

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker exec $(docker-compose ps -q db) pg_isready -U postgres >/dev/null 2>&1; do
    sleep 2
done

echo "✓ Database is ready!"

# Test connectivity
echo "Testing database connectivity..."
docker exec $(docker-compose ps -q db) psql -U postgres -d postgres -c "SELECT version();" >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Database connectivity successful!"
else
    echo "✗ Database connectivity failed!"
    exit 1
fi

# Show service URLs
echo ""
echo "🚀 Supabase is running!"
echo "Database: localhost:54322"
echo "Kong API Gateway: localhost:54321"
echo ""
echo "To connect to database:"
echo "psql -h localhost -p 54322 -U postgres -d postgres"