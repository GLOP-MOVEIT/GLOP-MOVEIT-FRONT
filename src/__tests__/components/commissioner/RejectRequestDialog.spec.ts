import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import RejectRequestDialog from '@/components/commissioner/RejectRequestDialog.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const VTextareaStub = defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
})

const stubs = {
  'v-dialog': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-card-actions': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i></i>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-textarea': VTextareaStub,
  'v-alert': { template: '<div><slot /></div>' },
  'v-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
}

describe('RejectRequestDialog', () => {
  it('shows validation message when reason is empty', async () => {
    const wrapper = mount(RejectRequestDialog, {
      props: {
        modelValue: true,
        request: { id: 1, user: 'John', role: 'ADMIN' },
      },
      global: { stubs },
    })

    const confirmButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('commissioner.rejectConfirm'))
    await confirmButton?.trigger('click')

    expect(wrapper.text()).toContain('commissioner.rejectRequired')
  })

  it('emits confirm with trimmed reason and closes', async () => {
    const wrapper = mount(RejectRequestDialog, {
      props: {
        modelValue: true,
        request: { id: 1, user: 'John', role: 'ADMIN' },
      },
      global: { stubs },
    })

    await wrapper.find('textarea').setValue('  Not valid ')
    const confirmButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('commissioner.rejectConfirm'))
    await confirmButton?.trigger('click')

    expect(wrapper.emitted('confirm')?.[0]).toEqual(['Not valid'])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })
})
