const STORAGE_KEY = 'roleRequestState'

export type RequestedRole = 'SPORTIF' | 'VOLONTAIRE'

export interface StoredRoleRequestState {
  requestedAt: string
  status: 'submitted'
}

type RoleRequestStateMap = Record<string, StoredRoleRequestState>

const buildStorageKey = (userId: number, role: RequestedRole) => `${userId}:${role}`

const readState = (): RoleRequestStateMap => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed ? parsed as RoleRequestStateMap : {}
  } catch {
    return {}
  }
}

const writeState = (state: RoleRequestStateMap) => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const getRoleRequestState = (
  userId: number,
  role: RequestedRole
): StoredRoleRequestState | null => {
  const state = readState()
  return state[buildStorageKey(userId, role)] ?? null
}

export const getSubmittedRoleRequest = (
  userId: number
): { role: RequestedRole; request: StoredRoleRequestState } | null => {
  const sportifRequest = getRoleRequestState(userId, 'SPORTIF')
  const volontaireRequest = getRoleRequestState(userId, 'VOLONTAIRE')

  if (!sportifRequest && !volontaireRequest) {
    return null
  }

  if (sportifRequest && !volontaireRequest) {
    return { role: 'SPORTIF', request: sportifRequest }
  }

  if (!sportifRequest && volontaireRequest) {
    return { role: 'VOLONTAIRE', request: volontaireRequest }
  }

  return new Date(sportifRequest!.requestedAt) >= new Date(volontaireRequest!.requestedAt)
    ? { role: 'SPORTIF', request: sportifRequest! }
    : { role: 'VOLONTAIRE', request: volontaireRequest! }
}

export const markRoleRequestSubmitted = (userId: number, role: RequestedRole) => {
  const state = readState()
  state[buildStorageKey(userId, role)] = {
    status: 'submitted',
    requestedAt: new Date().toISOString(),
  }
  writeState(state)
}
