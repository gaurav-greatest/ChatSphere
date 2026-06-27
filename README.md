# 🌌 ChatSphere

ChatSphere is a production-ready, real-time messaging application designed with a clean monorepo architecture, secure session management, horizontal scaling, and a stunning responsive client interface.

It combines a **Discord / WhatsApp Web hybrid design layout** built with React, Tailwind CSS v4, Node.js (Express), Socket.IO, MongoDB, Redis, and Cloudinary.

## 🚀 Key Features

- **Real-Time Communication**: Multi-channel Socket.IO message dispatching, online/offline presence tracking, live typings indicators, and delivery/read receipt audits.
- **Robust Authentication**: Access token rotation, token reuse/tampering detection, password resets, and account activation email templates.
- **Horizontal Scalability**: Distributed socket signaling powered by the Socket.IO Redis Adapter.
- **Media uploads**: Multer-based multipart stream uploads storing media and profile avatars directly to Cloudinary.
- **Design system**: Premium responsive layout built on Tailwind CSS v4 with glassmorphism components, dark theme support, and fluid animations.

---

## 🛠️ Architecture & Tech Stack

### Monorepo Setup (npm Workspaces)
- **`@chatsphere/shared`**: Common types, interfaces, validation payloads, and socket events definitions.
- **`@chatsphere/server`**: TypeScript + Express API backend and Socket.IO engine.
- **`@chatsphere/client`**: React 19 + Redux Toolkit + Vite 6 + Tailwind CSS v4.

---

## 📦 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v20 or higher.
- [Docker](https://www.docker.com/) for spinning up local MongoDB & Redis instances.

### 2. Environment Setup

Create `.env` files in both the client and server packages.

#### Server Environment (`server/.env`)
```env
PORT=5000
NODE_ENV=development

# Database & Cache
MONGODB_URI=mongodb://localhost:27017/chatsphere
REDIS_URL=redis://localhost:6379

# Tokens
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# SMTP Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@chatsphere.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Client Url
CLIENT_URL=http://localhost:5173
```

#### Client Environment (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=ChatSphere
```

### 3. Installation
Install all dependencies for all workspaces from the monorepo root:
```bash
npm install
```

### 4. Running Services

#### Spin up MongoDB & Redis via Docker
```bash
# Spins up database & cache servers in development mode
docker-compose -f docker-compose.dev.yml up -d
```

#### Start in Development Mode (With Hot Reloading)
```bash
npm run dev
```
- Client runs on `http://localhost:5173`
- Server runs on `http://localhost:5000`

---

## 🧪 Testing

The test suite runs self-contained API checks using an in-memory Mongo server:
```bash
# Run backend integration tests
npm test -w server
```

---

## 🐋 Production Deployment (Docker Compose)

To build and run all packages in production format (served behind an Nginx reverse-proxy supporting HTTP/WS requests):
```bash
docker-compose up --build
```
The application will be served at `http://localhost:80`.
