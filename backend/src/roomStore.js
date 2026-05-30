import { nanoid } from 'nanoid'
import { ROOM_TTL_MS, MAX_ROOMS } from './config.js'

const rooms = new Map()

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
    expiryTimer: null,
    emptyTimer: null
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
  clearTimeout(room.emptyTimer)
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
  room.expiryTimer = setTimeout(() => deleteRoom(id), ROOM_TTL_MS)
  room.expiryTimer.unref()
}
