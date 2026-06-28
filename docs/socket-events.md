# ChatSphere Socket.IO Event Reference

## Client-to-Server Events
- `chat:join` — `{ chatId: string }` — Join real-time room for a chat.
- `chat:leave` — `{ chatId: string }` — Leave real-time room for a chat.
- `typing:start` — `{ chatId: string }` — Emit typing indicator on.
- `typing:stop` — `{ chatId: string }` — Emit typing indicator off.
- `message:delivered` — `{ messageId: string, chatId: string }` — Confirm message delivery receipt.
- `message:read` — `{ messageId: string, chatId: string }` — Confirm message read receipt.

## Server-to-Client Events
- `message:new` — Broadcast newly posted message object to room.
- `user:typing` — `{ chatId: string, userId: string }` — Broadcast typing activity.
- `user:online` — `{ userId: string, isOnline: true }` — User availability status update.
- `user:offline` — `{ userId: string, isOnline: false }` — User disconnection event.
