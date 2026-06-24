#!/bin/sh
set -e

echo "Running database migrations..."
pnpm run migration:run

echo "Starting application..."
exec node dist/src/main
