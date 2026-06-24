# Alben Backend (NestJS Modular Monolith)

This is the backend API for the Alben project, built as a **Modular Monolith** using the **NestJS** framework.

## 📚 Essential Guidelines

Before contributing or creating new features, you **MUST** read the following guidelines:

1.  **[Project Rules](guidelines/PROJECT_RULES.md)**
    *   Technology Stack (NestJS, TypeScript).
    *   Authentication & Security standards.
    *   Coding Standards & Workflow.
2.  **[Module Rules](guidelines/MODULE_RULES.md)**
    *   **CRITICAL:** Explains the `libs/` directory structure.
    *   Defines the **Dependency Rule** and **Standard 3-Phase Workflow**.
3.  **[Change-Proof Rulebook](guidelines/CHANGE_PROOF_RULEBOOK.md)**
    *   The Master Logic Rules for decision-making.
    *   Defines **Freeze vs Flex**.
4.  **[AI Interaction Guide](guidelines/AI_INTERACTION_GUIDE.md)**
    *   Standard prompts for AI-assisted development.

## 🏗️ Architecture Overview

This project follows a **Domain-Centric Modular Monolith** architecture.

*   **`libs/{domain-name}`**: Where all business logic resides. Each module is self-contained.
*   **`src/`**: The application entry point (bootstrapping).
*   **`dist/`**: Compiled output.

### Key Rules
*   **Dependency Rule**: Domain Logic depends on NOTHING. Infrastructure depends on Domain. UI depends on Application.
*   **Barrels**: Only import from a module's root `index.ts`. Deep imports are forbidden.

## 🚀 Setup & Running

### Prerequisites

- Node.js 20.x
- pnpm (package manager)
- Docker & Docker Compose (for database)

### Local Development (Recommended)

Run the application on your machine with the database in Docker:

```bash
# 1. Start MySQL database
$ docker-compose -f docker/docker-compose.local.yml up -d
# OR
$ docker-compose -f docker/docker-compose.local.yml up --build

# 2. Copy environment file and configure
$ cp .env.example .env
# Edit .env: Ensure DB_HOST=localhost

# 3. Install dependencies
$ pnpm install

# 4. Start the application in watch mode
$ pnpm run start:dev
```

The application will be available at `http://localhost:3000`.
Database UI (Adminer) available at `http://localhost:8080`.

### Containerized Development

Run the application in Docker (connects to external MySQL):

```bash
# 1. Copy environment file and configure
$ cp .env.example .env
# Edit .env: Set DB_HOST to your external MySQL host

# 2. Start development container
$ docker-compose -f docker/docker-compose.dev.yml up

# Stop container
$ docker-compose -f docker/docker-compose.dev.yml down
```

### Testing

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## 🐳 Docker Setup

All Docker configuration files are located in the `docker/` directory:

- `docker-compose.local.yml` - Local development (database only)
- `docker-compose.dev.yml` - Containerized development
- `docker-compose.yml` - Production deployment
- `Dockerfile` - Multi-stage production build
- `Dockerfile.dev` - Development build

For detailed Docker usage, see [docker/README.md](docker/README.md).

### Quick Commands

```bash
# Start local database
$ docker-compose -f docker/docker-compose.local.yml up -d

# View database logs
$ docker-compose -f docker/docker-compose.local.yml logs -f db

# Stop and remove containers
$ docker-compose -f docker/docker-compose.local.yml down

# Remove volumes (WARNING: deletes data)
$ docker-compose -f docker/docker-compose.local.yml down -v
```

## 📦 Deployment

This application is designed to be containerized (Docker).

### Production Deployment

```bash
# 1. Copy and configure environment for production
$ cp .env.example .env
# Edit .env: Set DB_HOST to your production MySQL, use strong passwords, configure SMTP/SMS

# 2. Build and start production container
$ docker-compose -f docker/docker-compose.yml up -d

# View logs
$ docker-compose -f docker/docker-compose.yml logs -f app

# Stop container
$ docker-compose -f docker/docker-compose.yml down
```

Refer to `guidelines/PROJECT_RULES.md` for specific deployment constraints.
