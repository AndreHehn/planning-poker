#!/bin/sh
set -e

docker build --target production -t pp-prod .

docker rm -f pp-prod 2>/dev/null || true

ENV_ARG=""
if [ -f .env ]; then
  ENV_ARG="--env-file .env"
fi

docker run -d \
  --name pp-prod \
  -p 3000:3000 \
  -e NODE_ENV=production \
  $ENV_ARG \
  pp-prod

echo ""
echo "  Production: http://localhost:3000"
echo ""
echo "Zum Stoppen: docker rm -f pp-prod"
echo ""

docker logs -f pp-prod
