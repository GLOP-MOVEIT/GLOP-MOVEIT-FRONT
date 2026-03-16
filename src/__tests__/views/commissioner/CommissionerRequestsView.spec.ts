import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import CommissionerRequestsView from '@/views/CommissionerRequestsView.vue'

const requestServiceMocks = vi.hoisted(() => ({
  getPromotionRequests: vi.fn(),
  acceptPromotionRequest: vi.fn(),
  rejectPromotionRequest: vi.fn(),
}))

const requests = [
  {
    id: 1,
    reference: '#1',
    role: 'SPORTIF',
    status: 'PENDING',
    coverLetter: 'Motivation sportive',
    rejectionReason: null,
  },
  {
    id: 2,
    reference: '#2',
    role: 'VOLONTAIRE',
    status: 'REJECTED',
    coverLetter: 'Motivation benevole',
    rejectionReason: 'Pieces manquantes',
  },
]

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/services/requestService', () => ({
  getPromotionRequests: requestServiceMocks.getPromotionRequests,
  acceptPromotionRequest: requestServiceMocks.acceptPromotionRequest,
  rejectPromotionRequest: requestServiceMocks.rejectPromotionRequest,
}))

const stubs = {
  'v-icon': { template: '<i></i>' },
  'v-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
  'v-alert': { template: '<div><slot /></div>' },
  'v-table': { template: '<table><slot /></table>' },
  'v-chip': { template: '<span><slot /></span>' },
  'v-dialog': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-card-actions': { template: '<div><slot /></div>' },
  UserFilterBar: { template: '<div></div>' },
  RejectRequestDialog: { template: '<div></div>' },
}

describe('CommissionerRequestsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requestServiceMocks.getPromotionRequests.mockResolvedValue(requests)
  })

  it('loads requests and opens cover letter dialog', async () => {
    const wrapper = mount(CommissionerRequestsView, { global: { stubs } })
    await flushPromises()

    const vm = wrapper.vm as unknown as {
      requests: typeof requests
      selectedCoverLetterRequest: (typeof requests)[number] | null
      showCoverLetterDialog: boolean
      openCoverLetter: (request: (typeof requests)[number]) => void
    }

    vm.openCoverLetter(requests[0])

    expect(vm.requests).toHaveLength(2)
    expect(vm.selectedCoverLetterRequest).toStrictEqual(requests[0])
    expect(vm.showCoverLetterDialog).toBe(true)
  })

  it('approves a pending request', async () => {
    const wrapper = mount(CommissionerRequestsView, { global: { stubs } })
    await flushPromises()

    const vm = wrapper.vm as unknown as {
      approveRequest: (requestId: number) => Promise<void>
      successMessage: string
    }

    await vm.approveRequest(1)

    expect(requestServiceMocks.acceptPromotionRequest).toHaveBeenCalledWith(1)
    expect(vm.successMessage).toBe('commissioner.approveSuccess')
  })

  it('filters requests by query and role', async () => {
    const wrapper = mount(CommissionerRequestsView, { global: { stubs } })
    await flushPromises()

    const vm = wrapper.vm as unknown as {
      searchQuery: string
      selectedRole: string | null
      filteredRequests: typeof requests
    }

    vm.searchQuery = '#1'
    vm.selectedRole = 'SPORTIF'
    await wrapper.vm.$nextTick()

    expect(vm.filteredRequests).toHaveLength(1)
    expect(vm.filteredRequests[0].reference).toBe('#1')
  })
})
