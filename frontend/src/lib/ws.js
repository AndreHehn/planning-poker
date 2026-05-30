import { writable } from 'svelte/store'

export const roomState = writable(null)

let socket = null

export function connect(roomId, name, role) {
  if (socket) {
    socket.onclose = null
    socket.close()
  }

  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  socket = new WebSocket(`${protocol}://${location.host}/ws?roomId=${roomId}`)

  socket.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (msg.type === 'stateUpdate') roomState.set(msg)
  }

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'join', name, role }))
  }

  socket.onclose = (e) => {
    if (e.code === 4410) roomState.set({ expired: true })
    else if (e.code === 4004) roomState.set({ notFound: true })
    else if (e.code === 4429) roomState.set({ full: true })
  }
}

export function send(msg) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg))
  }
}

export function disconnect() {
  if (socket) {
    socket.onclose = null
    socket.close()
    socket = null
  }
  roomState.set(null)
}
