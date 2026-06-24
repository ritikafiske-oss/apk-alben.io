#!/bin/sh
set -e

echo "Running database migrations..."
pnpm run migration:run

echo "Starting application in development mode..."
exec pnpm run start:dev
