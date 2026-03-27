import apiClient from '@/services/api'
import type {
  PagedRoleRequestResponse,
  RoleRequestApiModel,
  RoleRequestViewModel,
} from '@/types/request'

const normalizeRole = (value?: string | null) => {
  const normalized = value?.replace(/^ROLE_/, '').trim().toUpperCase()

  if (normalized === 'ATHLETE') {
    return 'SPORTIF'
  }

  if (normalized === 'VOLUNTEER') {
    return 'VOLONTAIRE'
  }

  return normalized || 'UNKNOWN'
}

const mapRequest = (request: RoleRequestApiModel): RoleRequestViewModel => ({
  id: request.requestId,
  reference: `#${request.requestId}`,
  role: normalizeRole(request.role?.name),
  status: request.requestStatus,
  user: {
    id: request.user?.userId ?? null,
    firstName: request.user?.firstName ?? null,
    surname: request.user?.surname ?? null,
    email: request.user?.email ?? null,
    phoneNumber: request.user?.phoneNumber ?? null,
  },
  rejectionReason: request.requestRejectionReason ?? null,
  coverLetter: request.coverLetter ?? null,
})

export const getPromotionRequests = async (): Promise<RoleRequestViewModel[]> => {
  const { data } = await apiClient.get<PagedRoleRequestResponse>('/requests', {
    params: {
      size: 100,
      sort: 'requestId,desc',
    },
  })

  return data.content.map(mapRequest)
}

export const acceptPromotionRequest = async (requestId: number): Promise<void> => {
  await apiClient.get(`/requests/accept/${requestId}`)
}

export const rejectPromotionRequest = async (
  requestId: number,
  requestRejectionReason: string
): Promise<void> => {
  await apiClient.post(`/requests/reject/${requestId}`, {
    requestRejectionReason,
  })
}
