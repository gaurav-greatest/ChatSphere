# ChatSphere REST API Reference

All REST endpoints return a unified response JSON structure:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

## Authentication Endpoints (`/api/v1/auth`)
- `POST /register` — Register a new user account.
- `POST /login` — Authenticate user and receive JWT access token.
- `POST /logout` — Invalidate user session and clear refresh cookie.
- `POST /refresh-token` — Request new access token via HTTP-only refresh token cookie.

## User Endpoints (`/api/v1/users`)
- `GET /me` — Get current user profile details.
- `PATCH /me` — Update display name, bio, or status.
- `GET /search?q=` — Search for users by username or email.

## Chat Endpoints (`/api/v1/chats`)
- `GET /` — List all direct and group chats for active user.
- `POST /` — Create or fetch direct chat with target recipient.

## Message Endpoints (`/api/v1/chats/:chatId/messages`)
- `GET /` — Fetch paginated message history.
- `POST /` — Send text, image, or document message to chat room.
