const key = (roomId) => {
  const today = new Date().toISOString().slice(0, 10)
  return `pp_session_${roomId}_${today}`
}

export function saveSession(roomId, session) {
  localStorage.setItem(key(roomId), JSON.stringify(session))
}

export function loadSession(roomId) {
  const current = key(roomId)
  // Prune stale keys for this room
  Object.keys(localStorage)
    .filter(k => k.startsWith(`pp_session_${roomId}_`) && k !== current)
    .forEach(k => localStorage.removeItem(k))

  const raw = localStorage.getItem(current)
  return raw ? JSON.parse(raw) : null
}

export function clearSession(roomId) {
  localStorage.removeItem(key(roomId))
}
