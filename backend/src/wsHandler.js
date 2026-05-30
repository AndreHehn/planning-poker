import { nanoid } from 'nanoid'

const MAX_USERS = Number(process.env.MAX_USERS_PER_ROOM) || 0

export function handleConnection(socket, room) {
  const userId = nanoid(6)
  let user = null

  socket.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }

    switch (msg.type) {
      case 'join': {
        const name = String(msg.name || '').trim().slice(0, 32)
        const role = msg.role === 'observer' ? 'observer' : 'participant'
        if (!name) return

        const existing = [...room.users.values()].find(
          u => u.name.toLowerCase() === name.toLowerCase()
        )
        if (!existing && MAX_USERS > 0 && room.users.size >= MAX_USERS) {
          socket.close(4429, 'room full')
          return
        }
        if (existing) {
          existing.socket = socket
          existing.connected = true
          user = existing
        } else {
          user = { id: userId, name, role, vote: null, connected: true, socket: socket }
          room.users.set(userId, user)
        }
        broadcast(room)
        break
      }
      case 'vote': {
        if (!user || user.role === 'observer') return
        if (room.revealed) return
        const value = room.scale.includes(String(msg.value)) ? String(msg.value) : null
        if (!value) return
        user.vote = value
        broadcast(room)
        break
      }
      case 'reveal': {
        if (!user) return
        room.revealed = true
        broadcast(room)
        break
      }
      case 'reset': {
        if (!user) return
        room.revealed = false
        for (const u of room.users.values()) u.vote = null
        broadcast(room)
        break
      }
      case 'changeRole': {
        if (!user) return
        user.role = msg.role === 'observer' ? 'observer' : 'participant'
        if (user.role === 'observer') user.vote = null
        broadcast(room)
        break
      }
    }
  })

  socket.on('close', () => {
    if (user) {
      user.connected = false
      user.socket = null
      broadcast(room)
    }
  })
}

export function broadcast(room) {
  const payload = JSON.stringify({
    type: 'stateUpdate',
    roomId: room.id,
    scaleName: room.scaleName,
    scale: room.scale,
    revealed: room.revealed,
    users: [...room.users.values()].map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      voted: u.vote !== null,
      vote: room.revealed ? u.vote : null,
      connected: u.connected
    }))
  })

  for (const u of room.users.values()) {
    if (u.socket?.readyState === 1) {
      u.socket.send(payload)
    }
  }
}
