FROM oven/bun:1 AS ui
WORKDIR /app
COPY ui/ ./ui
WORKDIR /app/ui
RUN bun install
RUN bun run build


FROM golang:1.24 AS backend
WORKDIR /app
COPY backend/ ./backend
COPY --from=ui /app/ui/dist ./backend/ui/dist
WORKDIR /app/backend

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server .

FROM gcr.io/distroless/static-debian12
WORKDIR /app
COPY --from=backend /app/backend/server .
COPY --from=backend /app/backend/ui/dist ./ui/dist

ENTRYPOINT ["/app/server"]
