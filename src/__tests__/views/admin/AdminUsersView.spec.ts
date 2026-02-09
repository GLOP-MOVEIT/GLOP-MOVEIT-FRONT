import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AdminUsersView from '@/views/AdminUsersView.vue'

const getUsersMock = vi.hoisted(() => vi.fn())
const isAxiosErrorMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/userService', () => ({
  default: {
    getUsers: getUsersMock,
  },
}))

vi.mock('axios', () => ({
  isAxiosError: isAxiosErrorMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const stubs = {
  'v-icon': { template: '<i></i>' },
  'v-btn': { template: '<button><slot /></button>' },
  'v-alert': { template: '<div><slot /></div>' },
  'v-table': { template: '<table><slot /></table>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  UserFilterBar: { template: '<div></div>' },
}

describe('AdminUsersView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches users on mount', async () => {
    getUsersMock.mockResolvedValue([{ id: 1, email: 'a@example.com' }])
    const wrapper = mount(AdminUsersView, { global: { stubs } })

    await flushPromises()

    expect(getUsersMock).toHaveBeenCalled()
    expect((wrapper.vm as { users: unknown[] }).users.length).toBe(1)
  })

  it('sets error message from axios error payload', async () => {
    isAxiosErrorMock.mockReturnValue(true)
    getUsersMock.mockRejectedValue({ response: { data: { message: 'Boom' } } })
    const wrapper = mount(AdminUsersView, { global: { stubs } })

    await flushPromises()

    expect((wrapper.vm as { errorMessage: string }).errorMessage).toBe('Boom')
  })

  it('filters users by query and role', async () => {
    getUsersMock.mockResolvedValue([])
    const wrapper = mount(AdminUsersView, { global: { stubs } })

    ;(wrapper.vm as { users: unknown[] }).users = [
      {
        id: 1,
        email: 'john@example.com',
        firstName: 'John',
        surname: 'Doe',
        role: { name: 'ADMIN' },
      },
      {
        id: 2,
        email: 'jane@example.com',
        firstName: 'Jane',
        surname: 'Smith',
        role: { name: 'SPECTATOR' },
      },
    ]

    ;(wrapper.vm as { searchQuery: string }).searchQuery = 'john'
    ;(wrapper.vm as { selectedRole: string | null }).selectedRole = 'ADMIN'

    const filtered = (wrapper.vm as { filteredUsers: unknown[] }).filteredUsers
    expect(filtered).toHaveLength(1)
  })
})
