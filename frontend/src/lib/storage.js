const key = (roomId) => {
  const today = new Date().toISOString().slice(0, 10)
  return `pp_session_${roomId}_${today}`
}

function pruneStaleSessionKeys(roomId) {
  const current = key(roomId)
  Object.keys(localStorage)
    .filter(k => k.startsWith(`pp_session_${roomId}_`) && k !== current)
    .forEach(k => localStorage.removeItem(k))
}

export function saveSession(roomId, session) {
  localStorage.setItem(key(roomId), JSON.stringify(session))
}

export function loadSession(roomId) {
  pruneStaleSessionKeys(roomId)
  const raw = localStorage.getItem(key(roomId))
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

export function clearSession(roomId) {
  localStorage.removeItem(key(roomId))
}
