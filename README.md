# watch-together

Synchronized video watching with real-time chat.

[Demo page](https://wt.albert.lol)


## Features
- [x] YouTube video support
- [x] Real-time chat
- [x] Video synchronization
- [x] Username and avatar management
- [x] Room settings
    - [x] Admin restriction for playing
    - [x] Set maximum number of clients
- [x] Admin actions
    - [x] Kick
- [x] Queue videos
- [ ] Support for other video sharing platforms

## Run

Make sure you have Docker and Docker Compose installed.

No editing of `.env` or `docker-compose.yml` is required.

### Running in development mode

```bash
docker compose -f docker-compose.dev.yml up --build
```
