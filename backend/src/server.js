import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { createRoom, getRoom } from './roomStore.js'
import { handleConnection } from './wsHandler.js'

const app = Fastify({ logger: true })
const PORT = process.env.PORT || 3000
const isDev = process.env.NODE_ENV === 'development'
const __dirname = dirname(fileURLToPath(import.meta.url))

if (isDev) {
  await app.register(fastifyCors, { origin: '*' })
}

await app.register(fastifyWebsocket)

const publicPath = join(__dirname, '../public')
if (!isDev && existsSync(publicPath)) {
  await app.register(fastifyStatic, { root: publicPath })
  app.setNotFoundHandler((_, reply) => {
    reply.sendFile('index.html')
  })
}

app.post('/api/rooms', async (req, reply) => {
  const { scaleName, scale } = req.body
  if (!scaleName || !Array.isArray(scale) || scale.length === 0) {
    return reply.code(400).send({ error: 'scaleName and scale required' })
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
