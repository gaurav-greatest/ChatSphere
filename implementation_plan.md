# ChatSphere — Production-Ready Real-Time Chat Application

Build a **WhatsApp Web / Discord hybrid** chat platform with TypeScript everywhere, featuring real-time messaging, group chats, media sharing, presence, and a stunning responsive UI.

> [!IMPORTANT]
> This is a **massive project** (~200+ files, ~15,000+ lines of code). The plan is broken into **10 phases**, each building on the last. I will implement each phase fully, wait for your confirmation, then proceed.

---

## User Review Required

> [!WARNING]
> **Environment Variables & Third-Party Services**: The following services require you to set up accounts and provide credentials:
> - **MongoDB Atlas** (or local MongoDB) — database
> - **Redis Cloud** (or local Redis) — caching/pub-sub
> - **Cloudinary** — media storage
> - **SMTP Provider** (Gmail, SendGrid, etc.) — email verification & password reset
> - **Google OAuth** (optional) — social login
>
> I will create `.env.example` files with all required variables. You'll need to fill in your credentials.

> [!IMPORTANT]
> **Tailwind CSS v4** is the latest version. It has a radically different setup (CSS-first, no `tailwind.config.js`, uses `@theme` directive in CSS). Your prompt mentions Tailwind CSS — I will use **Tailwind CSS v4** with the `@tailwindcss/vite` plugin. Confirm if you prefer v3 instead.

> [!IMPORTANT]
> **Monorepo vs Polyrepo**: I will structure this as a **monorepo** with `client/`, `server/`, and `shared/` directories at the root, plus Docker/CI config at root level. This enables shared TypeScript types between frontend and backend.

---

## Open Questions

1. **MongoDB**: Do you want to use **MongoDB Atlas** (cloud) or a **local MongoDB** instance via Docker for development?
2. **Redis**: Same question — **Redis Cloud** or **local Redis** via Docker?
3. **Email Provider**: Which SMTP service do you prefer for email verification? (Gmail App Password, SendGrid, Mailgun, etc.)
4. **Deployment Target**: The prompt mentions Render or AWS EC2. Which do you prefer for the initial deployment config?
5. **Google OAuth**: Should I implement Google OAuth in Phase 2 (Auth), or defer it to a later phase?

---

## Proposed Architecture

```
chatsphere/
├── client/                    # React + Vite + TypeScript frontend
├── server/                    # Express + TypeScript backend
├── shared/                    # Shared types, constants, validation schemas
├── docker/                    # Dockerfiles and nginx config
├── .github/                   # GitHub Actions CI/CD
├── docker-compose.yml
├── docker-compose.dev.yml
├── package.json               # Root workspace config
├── turbo.json                 # Turborepo config (optional)
└── README.md
```

---

## Proposed Changes

### Phase 1 — Project Initialization & Folder Structure

Set up the entire monorepo scaffolding, tooling, and configuration.

---

#### Root Level

##### [NEW] `package.json`
Root workspace configuration using npm workspaces to link `client/`, `server/`, and `shared/`.

##### [NEW] `tsconfig.base.json`
Shared TypeScript configuration (strict mode, path aliases, modern target).

##### [NEW] `.gitignore`
Comprehensive gitignore for Node.js, TypeScript, environment files, Docker volumes.

##### [NEW] `.prettierrc`
Consistent code formatting config.

##### [NEW] `.eslintrc.json`
ESLint configuration with TypeScript plugin.

---

#### `server/` — Backend

##### [NEW] `server/package.json`
Dependencies: `express`, `socket.io`, `mongoose`, `ioredis`, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`, `hpp`, `compression`, `cookie-parser`, `multer`, `cloudinary`, `zod`, `winston`, `nodemailer`, `uuid`, `dotenv`.

##### [NEW] `server/tsconfig.json`
Extends base config, adds Node.js-specific settings, path aliases (`@/`).

##### [NEW] `server/src/app.ts`
Express app setup: middleware stack (helmet, cors, rate-limit, body-parser, cookie-parser, sanitization, compression, routes, error handler).

##### [NEW] `server/src/server.ts`
Entry point: HTTP server creation, Socket.IO attachment, DB connection, Redis connection, graceful shutdown.

##### [NEW] Directory structure:
```
server/src/
├── config/          # env.ts, database.ts, redis.ts, cloudinary.ts, socket.ts
├── constants/       # http-status.ts, socket-events.ts, error-messages.ts
├── controllers/     # auth.controller.ts, user.controller.ts, chat.controller.ts, message.controller.ts, group.controller.ts, notification.controller.ts, media.controller.ts
├── middlewares/     # auth.middleware.ts, error.middleware.ts, validate.middleware.ts, upload.middleware.ts, rate-limit.middleware.ts
├── models/          # user.model.ts, chat.model.ts, message.model.ts, notification.model.ts, refresh-token.model.ts, file.model.ts
├── repositories/    # user.repository.ts, chat.repository.ts, message.repository.ts, etc.
├── routes/          # auth.routes.ts, user.routes.ts, chat.routes.ts, message.routes.ts, group.routes.ts, notification.routes.ts, media.routes.ts, index.ts
├── services/        # auth.service.ts, user.service.ts, chat.service.ts, message.service.ts, group.service.ts, notification.service.ts, media.service.ts, email.service.ts, redis.service.ts
├── sockets/         # index.ts, handlers/ (chat.handler.ts, message.handler.ts, presence.handler.ts, typing.handler.ts)
├── types/           # express.d.ts, socket.d.ts, environment.d.ts
├── utils/           # async-handler.ts, api-error.ts, api-response.ts, logger.ts, token.ts, helpers.ts
└── validations/     # auth.validation.ts, user.validation.ts, chat.validation.ts, message.validation.ts, group.validation.ts
```

---

#### `client/` — Frontend

##### [NEW] `client/package.json`
Dependencies: `react`, `react-dom`, `react-router-dom`, `@reduxjs/toolkit`, `react-redux`, `axios`, `socket.io-client`, `tailwindcss`, `@tailwindcss/vite`, `react-hot-toast`, `emoji-picker-react`, `react-virtuoso` (virtualized lists), `date-fns`, `lucide-react` (icons).

##### [NEW] `client/vite.config.ts`
Vite config with React plugin, Tailwind v4 plugin, path aliases, proxy to backend.

##### [NEW] `client/tsconfig.json`
Extends base config, adds DOM/React-specific settings.

##### [NEW] Directory structure:
```
client/src/
├── app/             # store.ts, hooks.ts (typed Redux hooks)
├── assets/          # Static assets, fonts
├── components/      # Reusable UI components
│   ├── ui/          # Button, Input, Modal, Avatar, Badge, Skeleton, Toast
│   ├── chat/        # ChatList, ChatItem, ChatWindow, MessageBubble, MessageInput, TypingIndicator, EmojiPicker
│   ├── layout/      # Sidebar, Header, MobileNav, DesktopLayout, TabletLayout
│   └── common/      # LoadingScreen, ErrorBoundary, ProtectedRoute, SEOHead
├── features/        # Redux slices + related components
│   ├── auth/        # authSlice.ts, Login.tsx, Register.tsx, ForgotPassword.tsx
│   ├── chat/        # chatSlice.ts, ChatDashboard.tsx
│   ├── messages/    # messageSlice.ts
│   ├── users/       # userSlice.ts, Profile.tsx, Settings.tsx
│   ├── notifications/ # notificationSlice.ts
│   └── theme/       # themeSlice.ts
├── hooks/           # useSocket.ts, useAuth.ts, useMediaQuery.ts, useDebounce.ts, useInfiniteScroll.ts
├── lib/             # axios.ts (configured instance), socket.ts (Socket.IO client)
├── pages/           # Page-level components (Login, Register, Dashboard, etc.)
├── styles/          # index.css (Tailwind v4 imports + @theme customization)
├── types/           # Frontend-specific types
└── utils/           # formatDate.ts, cn.ts (classname merger), constants.ts
```

---

#### `shared/` — Shared Types

##### [NEW] `shared/package.json`
Minimal package for shared TypeScript types.

##### [NEW] Directory structure:
```
shared/
├── types/           # User, Chat, Message, Notification, SocketEvent interfaces
├── constants/       # Shared constants (socket event names, status codes)
└── validation/      # Shared Zod schemas usable on both client and server
```

---

### Phase 2 — Authentication Module

Full JWT authentication system with access/refresh tokens, email verification, password reset.

#### Server-side:
- **`user.model.ts`** — Mongoose schema with password hashing (bcrypt pre-save hook), email index, username index.
- **`refresh-token.model.ts`** — Stores hashed refresh tokens with expiry, device info, userId index.
- **`auth.service.ts`** — Registration, login, logout, token refresh, email verification, password reset, Google OAuth.
- **`auth.controller.ts`** — Thin controllers calling service methods.
- **`auth.routes.ts`** — `POST /register`, `POST /login`, `POST /logout`, `POST /refresh-token`, `POST /forgot-password`, `POST /reset-password/:token`, `GET /verify-email/:token`, `GET /google`, `GET /google/callback`.
- **`auth.middleware.ts`** — JWT verification, refresh token validation, role-based access.
- **`auth.validation.ts`** — Zod schemas for all auth endpoints.
- **`email.service.ts`** — Nodemailer transporter for verification & reset emails.
- **`token.ts`** — JWT sign/verify utilities, refresh token generation.

#### Client-side:
- **`authSlice.ts`** — Redux slice for user state, loading, errors.
- **`Login.tsx`** — Beautiful login page with form validation, dark mode, animations.
- **`Register.tsx`** — Registration with real-time validation feedback.
- **`ForgotPassword.tsx`** — Password reset request page.
- **`useAuth.ts`** — Hook for auth state and actions.
- **`axios.ts`** — Configured Axios instance with interceptors for automatic token refresh.

#### Security:
- Helmet headers
- CORS allowlist
- Rate limiting on auth endpoints (stricter: 5 req/15min on login)
- Input sanitization (express-mongo-sanitize)
- XSS protection
- HTTP-only secure cookies for refresh tokens
- CSRF protection via SameSite cookie attribute

---

### Phase 3 — Database Schemas

All MongoDB models with proper indexes, virtuals, and methods.

- **`user.model.ts`** — Full user schema: email, username, password, avatar, bio, status, lastSeen, isOnline, privacy settings, blocked users list. Indexes on email, username.
- **`chat.model.ts`** — Supports both direct and group chats. Fields: type (direct/group), members, admins, groupName, groupAvatar, lastMessage, pinnedMessages, archivedBy, mutedBy. Indexes on members, updatedAt.
- **`message.model.ts`** — Fields: chatId, sender, content, type (text/image/video/document/voice/system), attachments, replyTo, forwardedFrom, reactions, readBy, deliveredTo, editedAt, deletedAt (soft delete). Indexes on chatId+createdAt, senderId.
- **`notification.model.ts`** — Fields: userId, type, title, body, data, read, readAt. Indexes on userId+read.
- **`refresh-token.model.ts`** — Fields: userId, tokenHash, expiresAt, deviceInfo. Indexes on userId+tokenId, TTL index on expiresAt.
- **`file.model.ts`** — Fields: ownerId, url, publicId, type, size, mimeType, chatId, messageId. Indexes on ownerId+createdAt.

---

### Phase 4 — REST APIs

Complete CRUD APIs for all resources.

- **User APIs**: `GET /me`, `PATCH /me`, `GET /users/search`, `GET /users/:id`, `POST /users/block/:id`, `DELETE /users/block/:id`, `PATCH /users/privacy`.
- **Chat APIs**: `POST /chats` (create/find direct chat), `GET /chats` (list user's chats), `GET /chats/:id`, `DELETE /chats/:id/archive`, `PATCH /chats/:id/mute`.
- **Group APIs**: `POST /groups`, `PATCH /groups/:id`, `DELETE /groups/:id`, `POST /groups/:id/members`, `DELETE /groups/:id/members/:userId`, `PATCH /groups/:id/admins`.
- **Message APIs**: `GET /chats/:chatId/messages` (paginated), `POST /chats/:chatId/messages`, `PATCH /messages/:id`, `DELETE /messages/:id`, `POST /messages/:id/react`, `DELETE /messages/:id/react`, `POST /messages/:id/pin`, `POST /messages/forward`, `GET /messages/search`.
- **Notification APIs**: `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`.
- **Media APIs**: `POST /media/upload`, `DELETE /media/:id`.

All APIs use:
- Consistent `{ success, data, message, error }` response format via `ApiResponse` class.
- Zod validation middleware.
- Async error wrapper.
- Proper HTTP status codes.
- Pagination with cursor-based or offset-based approach.

---

### Phase 5 — Socket.IO Integration

Real-time event system with rooms, presence, typing, delivery/read receipts.

#### Socket Events:

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Server ← Client | Auth via JWT handshake |
| `disconnect` | Server ← Client | Update presence, notify contacts |
| `join:chat` | Server ← Client | Join a chat room |
| `leave:chat` | Server ← Client | Leave a chat room |
| `message:send` | Server ← Client | Send a message |
| `message:new` | Server → Client | Broadcast new message |
| `message:edit` | Bidirectional | Edit a message |
| `message:delete` | Bidirectional | Delete a message |
| `message:delivered` | Server ← Client | Mark delivered |
| `message:read` | Server ← Client | Mark read |
| `message:delivery-receipt` | Server → Client | Delivery confirmation |
| `message:read-receipt` | Server → Client | Read confirmation |
| `typing:start` | Bidirectional | Typing indicator on |
| `typing:stop` | Bidirectional | Typing indicator off |
| `reaction:add` | Bidirectional | Add emoji reaction |
| `reaction:remove` | Bidirectional | Remove reaction |
| `user:online` | Server → Client | User came online |
| `user:offline` | Server → Client | User went offline |
| `presence:update` | Server → Client | Presence change |
| `heartbeat` | Bidirectional | Keep-alive ping |

#### Architecture:
- **Socket middleware** for JWT authentication on every connection.
- **Room-based** messaging — each chat is a room.
- **Event handlers** organized by domain (chat, message, presence, typing).
- **Authorization** checked on every event (user must be member of chat).
- **Idempotent** message handling via message IDs.

---

### Phase 6 — Frontend UI

The crown jewel — a stunning, responsive chat interface.

#### Design System:
- **Dark mode by default** with light mode toggle.
- **Color palette**: Deep indigo/violet primary, slate backgrounds, emerald accents for online status.
- **Typography**: Inter font family via Google Fonts.
- **Glassmorphism** effects on panels and modals.
- **Micro-animations**: Fade-in messages, slide-in panels, pulse online indicators, smooth transitions.
- **Loading skeletons** for every data-loading state.

#### Responsive Layout Strategy:
| Screen | Layout |
|--------|--------|
| **Mobile** (< 640px) | Single panel with navigation drawer. Chat list OR chat window visible at a time. Swipe gestures. |
| **Tablet** (640px–1024px) | Split view: narrow chat list sidebar + chat window. |
| **Desktop** (> 1024px) | Three-panel: sidebar (chat list) + chat window + details panel (profile/members). |

#### Pages & Components:
- **Login/Register** — Split-screen layout with animated illustration on large screens, full-screen form on mobile.
- **Chat Dashboard** — Main chat interface with sidebar, chat list, active chat window.
- **Chat Window** — Header (avatar, name, status), virtualized message list (react-virtuoso), typing indicator, rich message input (emoji picker, attachment menu, voice recording button), auto-scroll.
- **Message Bubble** — Sent/received styling, timestamps, read receipts (✓✓), reply preview, reactions, image/video previews, document cards.
- **Profile Page** — Avatar upload, bio editor, status message, privacy toggles.
- **Settings Page** — Theme toggle, notification preferences, blocked users, account management.
- **Notifications Panel** — Slide-in panel with grouped notifications.

---

### Phase 7 — Redis Integration

- **Online users set** — `SADD/SREM` with user IDs for O(1) presence checks.
- **Typing state** — `SETEX` with 3s TTL per user-per-chat.
- **Socket session mapping** — `HSET` userId → socketId for direct messaging.
- **Unread count cache** — `HINCRBY` per user-per-chat, synced periodically with DB.
- **Rate limiting** — Redis-backed sliding window rate limiter.
- **Pub/Sub** — Cross-instance event propagation for horizontal scaling.
- **Socket.IO Redis adapter** — `@socket.io/redis-adapter` for multi-server socket sync.

---

### Phase 8 — Media Uploads

- **Cloudinary integration** — Upload via server-side SDK (not direct client upload for security).
- **Multer middleware** — File type validation (images, videos, documents, audio), size limits (10MB images, 50MB videos, 25MB documents).
- **Image optimization** — Cloudinary transformations for thumbnails (200x200), medium (800x800), original.
- **Avatar upload** — Crop to square, optimize, store URL in user profile.
- **Chat attachments** — Upload, create file record in DB, attach to message.
- **Cleanup** — Delete from Cloudinary when message/file is permanently deleted.

---

### Phase 9 — Testing

- **Backend unit tests** (Vitest) — Service layer tests with mocked repositories, validation tests, utility tests.
- **Backend integration tests** — API endpoint tests with supertest, in-memory MongoDB (mongodb-memory-server).
- **Socket tests** — Socket.IO client tests for connection, messaging, presence.
- **Frontend tests** (Vitest + React Testing Library) — Component rendering, Redux slice tests, hook tests.
- **Coverage targets** — Auth flows (90%+), Chat flows (80%+), Message flows (80%+), Validation (95%+).

---

### Phase 10 — Deployment & DevOps

#### Docker:
- **`docker/Dockerfile.server`** — Multi-stage build: install deps → build TS → production image with Node alpine.
- **`docker/Dockerfile.client`** — Multi-stage build: install deps → build Vite → serve with Nginx alpine.
- **`docker/nginx/nginx.conf`** — Reverse proxy: `/api` → backend, `/socket.io` → backend (WebSocket upgrade), `/` → frontend static files.
- **`docker-compose.yml`** — Production compose with all 5 services (frontend, backend, MongoDB, Redis, Nginx).
- **`docker-compose.dev.yml`** — Development compose with hot-reload, volume mounts, exposed ports.

#### GitHub Actions:
- **`.github/workflows/ci.yml`** — On PR: lint → type-check → test → build.
- **`.github/workflows/deploy.yml`** — On push to main: build Docker images → push to registry → deploy.

#### Documentation:
- **`README.md`** — Project overview, features, tech stack, setup guide, screenshots.
- **`docs/architecture.md`** — Architecture diagram (Mermaid), system design decisions.
- **`docs/api.md`** — Full API documentation with request/response examples.
- **`docs/socket-events.md`** — Socket event documentation.
- **`docs/deployment.md`** — Deployment guide for Docker, Render, AWS.

---

## Verification Plan

### Automated Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Lint + Type check
npm run lint
npm run typecheck
```

### Manual Verification
- Start with `docker-compose -f docker-compose.dev.yml up`
- Register two users in separate browser windows
- Send messages between them in real-time
- Create a group chat and verify multi-user messaging
- Test media upload (avatar + chat attachment)
- Test responsive layouts at mobile/tablet/desktop breakpoints
- Test dark/light mode toggle
- Verify typing indicators, read receipts, online status

---

## Estimated File Count & Scope

| Phase | Estimated Files | Estimated LOC |
|-------|----------------|---------------|
| Phase 1 | ~30 | ~800 |
| Phase 2 | ~25 | ~2,500 |
| Phase 3 | ~8 | ~800 |
| Phase 4 | ~30 | ~3,000 |
| Phase 5 | ~12 | ~1,500 |
| Phase 6 | ~45 | ~5,000 |
| Phase 7 | ~5 | ~500 |
| Phase 8 | ~8 | ~600 |
| Phase 9 | ~20 | ~2,000 |
| Phase 10 | ~15 | ~1,000 |
| **Total** | **~200** | **~17,700** |

> [!NOTE]
> I will implement **Phase 1** first, then wait for your confirmation before proceeding to Phase 2. Each phase will be fully functional and buildable on its own.
