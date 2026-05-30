import { nanoid } from 'nanoid'

const rooms = new Map()
const TTL = (Number(process.env.ROOM_TTL_HOURS) || 24) * 60 * 60 * 1000
const MAX_ROOMS = Number(process.env.MAX_ROOMS) || 0

export function createRoom(scaleName, scale) {
  if (MAX_ROOMS > 0 && rooms.size >= MAX_ROOMS) return null
  const id = nanoid(8)
  const room = {
    id,
    scaleName,
    scale,
    users: new Map(),
    revealed: false,
    createdAt: Date.now(),
    expiryTimer: null
  }
  rooms.set(id, room)
  scheduleExpiry(id)
  return room
}

export function getRoom(id) {
  return rooms.get(id)
}

export function deleteRoom(id) {
  const room = rooms.get(id)
  if (!room) return
  clearTimeout(room.expiryTimer)
  for (const user of room.users.values()) {
    if (user.socket?.readyState === 1) {
      user.socket.close(4410, 'room expired')
    }
  }
  rooms.delete(id)
}

function scheduleExpiry(id) {
  const room = rooms.get(id)
  if (!room) return
  room.expiryTimer = setTimeout(() => deleteRoom(id), TTL)
  room.expiryTimer.unref()
}
