# Nginx Reverse Proxy

Nginx reverse proxy configuration for the delivery service.

## Routes

- `http://ds.localhost/` → Frontend (Nuxt app)
- `http://ds.localhost/api` → Backend (NestJS API)

## Setup

1. Add to `/etc/hosts`:
   ```
   127.0.0.1 ds.localhost
   ```

2. Start services:
   ```bash
   docker compose up -d
   ```

3. Access:
   - Frontend: http://ds.localhost
   - API: http://ds.localhost/api
   - Health: http://ds.localhost/health

## Configuration

- `nginx.conf` - Main configuration file
- Mounted to container at `/etc/nginx/conf.d/default.conf`
- Automatically includes CORS headers for API requests

## Troubleshooting

View logs:
```bash
docker compose logs nginx
```

Reload config after changes:
```bash
docker compose restart nginx
```
