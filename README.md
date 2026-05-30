# Planning Poker

A lightweight, real-time Planning Poker app for agile estimation sessions. No database required — all state lives in server memory. Rooms expire automatically after 24 hours.

## Features

- Create a room and share the URL with your team
- Fibonacci, T-Shirt, or powers-of-two estimation scales
- Cards stay hidden until someone reveals them
- Observers can watch, reveal, and reset — without voting
- Session persistence: reopening a tab rejoins the room automatically
- Role switching between participant and observer at any time
- Rooms expire after 24 hours and clean themselves up

## Quick Start (Docker)

```sh
# 1. Clone the repo
git clone https://github.com/your-username/planning-poker.git
cd planning-poker

# 2. Optional: configure the app
cp .env.example .env
# edit .env as needed

# 3. Build and run
sh prod.sh
```

The app is now available at `http://localhost:3000` (or whichever port you set in `.env`).

To stop the container:

```sh
docker rm -f pp-prod
```

## Configuration

Copy `.env.example` to `.env` and adjust the values. All settings are optional — the defaults work out of the box.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `ROOM_TTL_HOURS` | `24` | Hours until a room is automatically deleted |
| `MAX_ROOMS` | `0` | Max concurrent rooms in memory (`0` = unlimited) |
| `MAX_USERS_PER_ROOM` | `0` | Max users per room (`0` = unlimited) |

## Development

Requirements: Docker

```sh
# Start backend + frontend with hot reload
sh dev.sh

# Backend:  http://localhost:3000
# Frontend: http://localhost:5173

# Stop containers
sh stop.sh
```

## Tech Stack

- **Backend:** Node.js + Fastify + WebSockets
- **Frontend:** Svelte 5 + Vite
- **Deployment:** Docker (single container, no external dependencies)

## License

MIT — free to use, modify, and self-host. See [LICENSE](LICENSE) for details.
