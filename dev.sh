#!/bin/sh
set -e

NETWORK=pp-dev

docker network create $NETWORK 2>/dev/null || true

docker build --target dev-backend -t pp-backend-dev .
docker build --target dev-frontend -t pp-frontend-dev .

docker rm -f pp-backend pp-frontend 2>/dev/null || true

docker run -d \
  --name pp-backend \
  --network $NETWORK \
  -p 3000:3000 \
  -v "$(pwd)/backend/src:/app/src" \
  -e NODE_ENV=development \
  -e PORT=3000 \
  pp-backend-dev

docker run -d \
  --name pp-frontend \
  --network $NETWORK \
  -p 5173:5173 \
  -v "$(pwd)/frontend/src:/app/src" \
  -v "$(pwd)/frontend/index.html:/app/index.html" \
  -e BACKEND_HOST=pp-backend \
  pp-frontend-dev

echo ""
echo "  Backend:  http://localhost:3000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Ctrl+C stoppt die Logs, Container laufen weiter."
echo "Zum Stoppen: sh stop.sh"
echo ""

docker logs -f pp-backend &
docker logs -f pp-frontend
