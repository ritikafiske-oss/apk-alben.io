# Docker Configuration

This directory contains all Docker-related configuration files for the Alben Backend application.

## Files

- `Dockerfile` - Multi-stage production build
- `Dockerfile.dev` - Development build with hot reload
- `docker-compose.yml` - Production deployment (app only, uses external MySQL)
- `docker-compose.dev.yml` - Development environment (app only, uses external MySQL)
- `docker-compose.local.yml` - Local development (MySQL + Adminer only)

**Note:** 
- `.dockerignore` is located in the project root directory
- `.env.example` is located in the project root directory
- Dev and Production setups expect external MySQL databases

## Quick Start

### Local Development with External MySQL (XAMPP/MySQL)

Run the app in Docker while using your local MySQL (e.g., XAMPP, standalone MySQL):

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Configure .env for your local MySQL:
#    - DB_HOST=host.docker.internal  (required for Docker to reach host MySQL)
#    - DB_PORT=3306
#    - DB_USERNAME=root
#    - DB_PASSWORD=         (your MySQL password, empty for XAMPP default)
#    - DB_NAME=salescaller   (create this database in phpMyAdmin first)

# 3. Start the application
docker-compose -f docker/docker-compose.local.yml up --build
```

The app will be available at `http://localhost:3000` with hot reload.

**Important Notes:**
- `host.docker.internal` is required on Windows/Mac to connect from Docker to host MySQL
- Make sure your MySQL service is running (XAMPP Control Panel → Start MySQL)
- Create the database manually in phpMyAdmin before starting the app

### Local Development (Without Docker)

Run the app directly on your machine:

```bash
# Copy environment template
cp .env.example .env
# Edit .env: Set DB_HOST=127.0.0.1

# Install dependencies
pnpm install

# Start the application
pnpm run start:dev
```

The app will be available at `http://localhost:3000` with hot reload.

### Containerized Development

Run the app in Docker (connects to your external MySQL database):

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env: Set DB_HOST to your external MySQL host

# Start development container
docker-compose -f docker/docker-compose.dev.yml up
```

The app will be available at `http://localhost:3000` with hot reload enabled.

### Production

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env: Set DB_HOST to your production MySQL host, use strong passwords

# Build and start production container
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f app
```

## Commands

### Build

```bash
# Build production image
docker build -f docker/Dockerfile -t alben-backend:latest .

# Build development image
docker build -f docker/Dockerfile.dev -t alben-backend:dev .
```

### Run

```bash
# Start local development (database only)
docker-compose -f docker/docker-compose.local.yml up -d

# Start containerized development stack
docker-compose -f docker/docker-compose.dev.yml up

# Start production stack
docker-compose -f docker/docker-compose.yml up -d

# Stop containers
docker-compose -f docker/docker-compose.local.yml down
docker-compose -f docker/docker-compose.dev.yml down
docker-compose -f docker/docker-compose.yml down
```

### Maintenance

```bash
# View application logs
docker-compose -f docker/docker-compose.yml logs -f app

# Execute commands in container
docker-compose -f docker/docker-compose.yml exec app sh

# Access local database (for local setup only)
docker-compose -f docker/docker-compose.local.yml exec db mysql -u alben -palben123 alben_local

# Database backup (local setup only)
docker-compose -f docker/docker-compose.local.yml exec db mysqldump -u root -proot123 alben_local > backup.sql

# Database restore (local setup only)
docker-compose -f docker/docker-compose.local.yml exec -T db mysql -u root -proot123 alben_local < backup.sql

# Remove local database volume (WARNING: deletes data)
docker-compose -f docker/docker-compose.local.yml down -v
```

## Architecture

### Multi-Stage Dockerfile

The production Dockerfile uses multi-stage builds:

1. **deps** - Installs dependencies
2. **builder** - Compiles TypeScript
3. **production** - Minimal runtime image with compiled code

This approach minimizes the final image size and improves security.

### Database Strategy

- **Local Development**: MySQL runs in Docker (`docker-compose.local.yml`)
- **Dev/Production**: Application connects to external MySQL databases
- Use `extra_hosts` with `host.docker.internal` to connect to databases on the host machine

## Health Checks

The application container includes a health check:
- HTTP GET to `/health` endpoint
- Checks every 30 seconds
- 40 second startup grace period

## Security

- Non-root user (`nestjs:nodejs`) runs the application
- Production dependencies only in final image
- Environment variables for sensitive data
- Health checks for container monitoring
