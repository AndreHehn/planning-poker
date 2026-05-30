# Stage: Dev backend
FROM node:22-alpine AS dev-backend
WORKDIR /app
COPY backend/package.json .
RUN npm install
COPY backend/src ./src
CMD ["npm", "run", "dev"]

# Stage: Dev frontend
FROM node:22-alpine AS dev-frontend
WORKDIR /app
COPY frontend/package.json .
RUN npm install
COPY frontend/index.html .
COPY frontend/vite.config.js .
COPY frontend/src ./src
CMD ["npm", "run", "dev"]

# Stage: Build frontend
FROM node:22-alpine AS build-frontend
WORKDIR /app
COPY frontend/package.json .
RUN npm install
COPY frontend/index.html .
COPY frontend/vite.config.js .
COPY frontend/src ./src
RUN npm run build

# Stage: Production (Fastify serves static files)
FROM node:22-alpine AS production
WORKDIR /app
COPY backend/package.json .
RUN npm install --omit=dev
COPY backend/src ./src
COPY --from=build-frontend /app/dist ./public
EXPOSE 3000
CMD ["npm", "start"]
