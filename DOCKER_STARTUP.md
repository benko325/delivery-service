# Docker Compose Startup Guide

## Prerequisites

- Docker & Docker Compose

## Quick Start

Start all services with a single command:

```bash
docker-compose up -d
```

This starts the entire stack including the application, database, message queue, and monitoring tools. Migrations run automatically on startup.

## Services

| Service | Container Name | Port | Purpose |
|---------|---------------|------|---------|
| **Delivery Service** | delivery-service-api | 3000 | NestJS application |
| **Frontend** | delivery-service-frontend | 2999 | Nuxt SSR application |
| **Nginx** | delivery-service-nginx | 80 | Reverse proxy |
| **PostgreSQL** | delivery-service-postgres | 5433 | Primary database |
| **RabbitMQ** | delivery-service-rabbitmq | 5672 / 15672 | Message queue / Management UI |
| **Prometheus** | delivery-service-prometheus | 9095 | Metrics collection |
| **Grafana** | delivery-service-grafana | 3001 | Metrics visualization |

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | - |
| Frontend | http://localhost:2999 | - |
| Unified (via Nginx) | http://ds.localhost | - |
| Swagger Docs | http://localhost:3000/api/docs | - |
| Metrics | http://localhost:3000/api/metrics | - |
| Health Check | http://localhost:3000/api/health | - |
| RabbitMQ Management | http://localhost:15672 | admin / admin |
| Prometheus | http://localhost:9095 | - |
| Grafana | http://localhost:3001 | admin / admin |

## Useful Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f delivery-service

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Database Connection

For external tools (e.g., DBeaver, pgAdmin):

| Parameter | Value |
|-----------|-------|
| Host | localhost |
| Port | 5433 |
| Database | delivery_service |
| User | admin |
| Password | admin |
