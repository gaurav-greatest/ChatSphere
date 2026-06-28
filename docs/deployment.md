# ChatSphere Production Deployment Guide

## Docker Compose Production Deployment

1. **Configure Environment Variables**:
   Copy `.env.example` in both `server/` and `client/` to `.env` and fill in your MongoDB connection URI, Redis Cloud credentials, and JWT secrets.

2. **Launch Services**:
   Run the production Docker Compose command:
   ```bash
   docker compose up -d --build
   ```

3. **Verify Health**:
   Ensure Nginx reverse proxy, backend Node server, and Redis instances are running smoothly:
   ```bash
   docker compose ps
   ```
