# watch-together

Synchronized video watching with real-time chat.

## Features
- [x] YouTube video support
- [x] Real-time chat
- [x] Video synchronization
- [x] Username and avatar management
- [ ] Room settings
- [ ] Admin actions
- [ ] Queue videos
- [ ] Support for other video sharing platforms

## Run

Make sure you have Docker installed and Docker Compose installed.

No editing of `.env` or `docker-compose.yml` is required.

### Running in development mode

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Running in production

```bash
docker compose -f docker-compose.yml up --build
```
