# Activity 8: Chatroom REST API + UI

A full-stack chatroom application built with NestJS (Backend) and React (Frontend).

## Features

- **Real-time Chat**: Messages are delivered instantly using WebSockets (Socket.IO).
- **Room Management**: Create, list, and delete chatrooms.
- **Persistent Storage**: All rooms and messages are stored in a SQLite database via Prisma.
- **REST API**: Fully documented API using Swagger.
- **Responsive UI**: Modern chat interface built with Tailwind CSS.

## Project Structure

```
Activity8/
├── backend/          # NestJS + Prisma + SQLite
│   ├── src/
│   │   ├── modules/  # Rooms, Messages, Realtime
│   │   └── prisma/   # Database service
│   └── prisma/       # Schema and migrations
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── api/      # Axios client
        ├── modules/  # Chat and Room components
        └── realtime/ # Socket.IO service
```

## Setup & Running

### 1. Backend

```bash
cd backend
npm install
# Initialize database and generate client
npx prisma migrate dev
# Start server
npm run start:dev
```

- REST API: [http://localhost:3000/api](http://localhost:3000/api)
- Swagger Docs: [http://localhost:3000/api](http://localhost:3000/api)
- WebSocket: [http://localhost:3000/chat](http://localhost:3000/chat)

### 2. Frontend

```bash
cd frontend
npm install
# Start dev server
npm run dev
```

- UI: [http://localhost:5174](http://localhost:5174)

## API Endpoints Summary

### Rooms
- `POST /api/rooms`: Create a new room
- `GET /api/rooms`: List all rooms
- `GET /api/rooms/:id`: Get room details
- `PATCH /api/rooms/:id`: Update room name
- `DELETE /api/rooms/:id`: Delete room and messages

### Messages
- `POST /api/rooms/:roomId/messages`: Send a message
- `GET /api/rooms/:roomId/messages`: Get messages in a room
- `DELETE /api/messages/:id`: Delete a specific message

## WebSocket Events (Namespace: `/chat`)

### Client Emits
- `join_room { roomId }`: Join a specific chatroom
- `send_message { roomId, senderName, content }`: Send a message via WebSocket

### Server Emits
- `joined_room { roomId }`: Confirms room join
- `new_message { id, roomId, senderName, content, createdAt }`: Broadcasts new message to all clients in the room

## Security & Best Practices

- **Validation**: Global `ValidationPipe` for all DTOs.
- **Error Handling**: Centralized exception filters.
- **Rate Limiting**: Throttler enabled for REST endpoints.
- **CORS**: Configured for frontend access.
- **Environment**: Sensitive info managed via `.env` (see `.env.example`).
