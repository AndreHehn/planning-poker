import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { createRoom, getRoom } from './roomStore.js'
import { handleConnection } from './wsHandler.js'
import { PORT, IS_DEV } from './config.js'

const RATE_WINDOW_MS = 60_000
const RATE_LIMIT = 10
const MAX_SCALE_VALUES = 20
const MAX_SCALE_VALUE_LEN = 16
const MAX_SCALE_NAME_LEN = 64

const roomCreationsByIp = new Map()

setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS
  for (const [ip, timestamps] of roomCreationsByIp) {
    const fresh = timestamps.filter(t => t > cutoff)
    if (fresh.length === 0) roomCreationsByIp.delete(ip)
    else roomCreationsByIp.set(ip, fresh)
  }
}, RATE_WINDOW_MS).unref()

function isRateLimited(ip) {
  const now = Date.now()
  const timestamps = (roomCreationsByIp.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  if (timestamps.length >= RATE_LIMIT) {
    roomCreationsByIp.set(ip, timestamps)
    return true
  }
  timestamps.push(now)
  roomCreationsByIp.set(ip, timestamps)
  return false
}

const app = Fastify({ logger: true, trustProxy: true })
const __dirname = dirname(fileURLToPath(import.meta.url))

app.addHook('onRequest', async (req, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff')
  reply.header('X-Frame-Options', 'DENY')
})

if (IS_DEV) {
  await app.register(fastifyCors, { origin: '*' })
}

await app.register(fastifyWebsocket)

const publicPath = join(__dirname, '../public')
if (!IS_DEV && existsSync(publicPath)) {
  await app.register(fastifyStatic, { root: publicPath })
  app.setNotFoundHandler((_, reply) => {
    reply.sendFile('index.html')
  })
}

app.post('/api/rooms', async (req, reply) => {
  if (isRateLimited(req.ip)) {
    return reply.code(429).send({ error: 'Too many rooms created. Try again later.' })
  }

  const { scaleName, scale } = req.body
  if (!scaleName || typeof scaleName !== 'string' || scaleName.length > MAX_SCALE_NAME_LEN) {
    return reply.code(400).send({ error: 'scaleName required (max 64 chars)' })
  }
  if (!Array.isArray(scale) || scale.length === 0 || scale.length > MAX_SCALE_VALUES) {
    return reply.code(400).send({ error: `scale must be an array of 1–${MAX_SCALE_VALUES} values` })
  }
  if (scale.some(v => typeof v !== 'string' || v.length === 0 || v.length > MAX_SCALE_VALUE_LEN)) {
    return reply.code(400).send({ error: `each scale value must be a non-empty string (max ${MAX_SCALE_VALUE_LEN} chars)` })
  }

  const room = createRoom(scaleName, scale)
  if (!room) return reply.code(503).send({ error: 'Room limit reached. Try again later.' })
  return reply.code(201).send({ id: room.id, scaleName: room.scaleName, scale: room.scale })
})

app.get('/ws', { websocket: true }, (socket, req) => {
  const roomId = req.query.roomId
  const room = getRoom(roomId)
  if (!room) {
    socket.close(4004, 'room not found')
    return
  }
  handleConnection(socket, room)
})

app.get('/health', async () => ({ status: 'ok' }))

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1) }
})
