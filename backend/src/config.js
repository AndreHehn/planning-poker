const env = process.env

export const PORT = Number(env.PORT) || 3000
export const IS_DEV = env.NODE_ENV === 'development'
export const ROOM_TTL_MS = (Number(env.ROOM_TTL_HOURS) || 24) * 60 * 60 * 1000
export const MAX_ROOMS = Number(env.MAX_ROOMS) || 0
export const MAX_USERS_PER_ROOM = Number(env.MAX_USERS_PER_ROOM) || 0
export const EMPTY_ROOM_TTL_MS = (Number(env.EMPTY_ROOM_TTL_SECONDS) || 30) * 1000
