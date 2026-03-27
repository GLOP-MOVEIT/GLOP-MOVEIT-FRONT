export interface RoleRequestApiModel {
  requestId: number
  requestStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestRejectionReason?: string | null
  user?: {
    userId: number
    firstName?: string | null
    surname?: string | null
    email?: string | null
    phoneNumber?: string | null
    language?: string | null
    acceptsNotifications?: boolean
    acceptsLocationSharing?: boolean
  } | null
  role?: {
    name?: string | null
  } | null
  coverLetter?: string | null
}

export interface PagedRoleRequestResponse {
  content: RoleRequestApiModel[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface RoleRequestViewModel {
  id: number
  reference: string
  role: 'SPORTIF' | 'VOLONTAIRE' | string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  user: {
    id: number | null
    firstName: string | null
    surname: string | null
    email: string | null
    phoneNumber: string | null
  }
  rejectionReason?: string | null
  coverLetter?: string | null
}
