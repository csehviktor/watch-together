# watch-together

Synchronized video watching with real-time chat.

## Prerequisites

Create a `ui/.env` file containing the websocket endpoint. See `ui/.env.example` for details.

## Run

```bash
# Backend
cd backend && go run main.go

# Frontend
cd ui && bun install && bun dev
```
