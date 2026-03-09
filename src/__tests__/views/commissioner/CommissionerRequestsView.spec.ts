import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CommissionerRequestsView from '@/views/CommissionerRequestsView.vue'

const commissionerRequests = vi.hoisted(() => [
  {
    id: 1,
    user: 'Alice',
    role: 'SPORTIF',
    documents: [{ filename: 'passport.pdf', key: 'passport', status: 'pending' }],
  },
])

vi.mock('@/data/commissionerRequests', () => ({
  commissionerRequests,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const stubs = {
  'v-icon': { template: '<i></i>' },
  'v-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
  'v-alert': { template: '<div><slot /></div>' },
  'v-table': { template: '<table><slot /></table>' },
  UserFilterBar: { template: '<div></div>' },
  DocumentPreviewDialog: { template: '<div></div>' },
  RejectRequestDialog: { template: '<div></div>' },
}

describe('CommissionerRequestsView', () => {
  it('opens document preview and sets selected document', () => {
    const wrapper = mount(CommissionerRequestsView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      selectedDocument: unknown
      showDocument: boolean
      openDocument: (doc: unknown, req: unknown) => void
    }

    const doc = commissionerRequests[0].documents[0]
    vm.openDocument(doc, commissionerRequests[0])

    expect(vm.selectedDocument).toStrictEqual(doc)
    expect(vm.showDocument).toBe(true)
  })

  it('validates document by changing its status', () => {
    const wrapper = mount(CommissionerRequestsView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      validateDocument: (doc: { status: string }) => void
    }

    const doc = { status: 'pending' }
    vm.validateDocument(doc)

    expect(doc.status).toBe('validated')
  })

  it('filters requests by query and role', () => {
    const wrapper = mount(CommissionerRequestsView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      searchQuery: string
      selectedRole: string | null
      filteredRequests: unknown[]
    }

    vm.searchQuery = 'alice'
    vm.selectedRole = 'SPORTIF'

    expect(vm.filteredRequests).toHaveLength(1)
  })
})
