import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CommissionerOverviewView from '@/views/CommissionerOverviewView.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const stubs = {
  'v-alert': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
}

describe('CommissionerOverviewView', () => {
  it('mounts and renders overview copy', () => {
    const wrapper = mount(CommissionerOverviewView, { global: { stubs } })

    expect(wrapper.text()).toContain('commissioner.overviewInfo')
  })
})
