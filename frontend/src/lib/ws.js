import { writable } from 'svelte/store'
import { loadSession, saveSession } from './storage.js'

export const roomState = writable(null)
export const reconnecting = writable(false)

let socket = null
let reconnectTimer = null
let reconnectAttempts = 0
let activeRoomId = null
let activeName = null
let activeRole = null

export function connect(roomId, name, role) {
  activeRoomId = roomId
  activeName = name
  activeRole = role
  reconnectAttempts = 0
  _open()
}

function _open() {
  clearTimeout(reconnectTimer)
  if (socket) {
    socket.onclose = null
    socket.close()
    socket = null
  }

  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  socket = new WebSocket(`${protocol}://${location.host}/ws?roomId=${activeRoomId}`)

  socket.onmessage = (e) => {
    let msg
    try { msg = JSON.parse(e.data) } catch { return }
    if (msg.type === 'stateUpdate') {
      reconnecting.set(false)
      roomState.set(msg)
    } else if (msg.type === 'joined') {
      const session = loadSession(activeRoomId)
      if (session) saveSession(activeRoomId, { ...session, rejoinToken: msg.rejoinToken })
    }
  }

  socket.onopen = () => {
    reconnectAttempts = 0
    const session = loadSession(activeRoomId)
    socket.send(JSON.stringify({
      type: 'join',
      name: activeName,
      role: activeRole,
      rejoinToken: session?.rejoinToken
    }))
  }

  socket.onclose = (e) => {
    socket = null
    if (e.code === 4410) { roomState.set({ expired: true }); _cleanup() }
    else if (e.code === 4004) { roomState.set({ notFound: true }); _cleanup() }
    else if (e.code === 4429) { roomState.set({ full: true }); _cleanup() }
    else if (e.code === 4403) { roomState.set({ nameTaken: true }); _cleanup() }
    else if (activeRoomId) {
      reconnecting.set(true)
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30_000)
      reconnectAttempts++
      reconnectTimer = setTimeout(_open, delay)
    }
  }
}

function _cleanup() {
  activeRoomId = null
  activeName = null
  activeRole = null
}

export function send(msg) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg))
  }
}

export function disconnect() {
  _cleanup()
  clearTimeout(reconnectTimer)
  reconnectTimer = null
  reconnectAttempts = 0
  reconnecting.set(false)
  if (socket) {
    socket.onclose = null
    socket.close()
    socket = null
  }
  roomState.set(null)
}
