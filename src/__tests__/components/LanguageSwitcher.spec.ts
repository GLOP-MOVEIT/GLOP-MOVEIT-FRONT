import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const localeRef = ref('fr')

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: localeRef,
  }),
}))

const stubs = {
  'v-menu': {
    template: '<div><slot name="activator" :props="{}"></slot><slot /></div>',
  },
  'v-btn': { template: '<button><slot /></button>' },
  'v-icon': { template: '<i></i>' },
  'v-list': { template: '<div><slot /></div>' },
  'v-list-item': {
    template: '<div @click=\"$emit(\'click\')\"><slot /></div>',
  },
  'v-list-item-title': { template: '<div><slot /></div>' },
}

describe('LanguageSwitcher', () => {
  it('updates locale and localStorage on selection', async () => {
    localeRef.value = 'fr'
    localStorage.clear()
    const wrapper = mount(LanguageSwitcher, { global: { stubs } })

    const option = wrapper.findAll('div').find((node) => node.text() === 'locales.en')
    await option?.trigger('click')

    expect(localeRef.value).toBe('en')
    expect(localStorage.getItem('locale')).toBe('en')
  })
})
