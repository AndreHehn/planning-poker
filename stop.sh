#!/bin/sh
docker rm -f pp-backend pp-frontend 2>/dev/null || true
echo "Container gestoppt."
