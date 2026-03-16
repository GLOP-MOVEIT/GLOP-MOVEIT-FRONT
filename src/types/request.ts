export interface RoleRequestApiModel {
  requestId: number
  requestStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestRejectionReason?: string | null
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
  rejectionReason?: string | null
  coverLetter?: string | null
}
