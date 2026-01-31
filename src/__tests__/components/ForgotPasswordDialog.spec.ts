import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const VTextFieldStub = defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})

const stubs = {
  'v-dialog': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-card-actions': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i></i>' },
  'v-text-field': VTextFieldStub,
  'v-alert': { template: '<div><slot /></div>' },
  'v-btn': { template: '<button @click=\"$emit(\'click\')\"><slot /></button>' },
}

describe('ForgotPasswordDialog', () => {
  it('pre-fills email when opened', async () => {
    const wrapper = mount(ForgotPasswordDialog, {
      props: { modelValue: false, initialEmail: 'john@example.com' },
      global: { stubs },
    })

    await wrapper.setProps({ modelValue: true })

    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('john@example.com')
  })

  it('shows required message when submitting empty email', async () => {
    const wrapper = mount(ForgotPasswordDialog, {
      props: { modelValue: true },
      global: { stubs },
    })

    const submitButton = wrapper.findAll('button').find((button) =>
      button.text().includes('forgotPassword.submit'),
    )
    await submitButton?.trigger('click')

    expect(wrapper.text()).toContain('forgotPassword.required')
  })

  it('shows invalid message when email is invalid', async () => {
    const wrapper = mount(ForgotPasswordDialog, {
      props: { modelValue: true },
      global: { stubs },
    })

    await wrapper.find('input').setValue('invalid')
    const submitButton = wrapper.findAll('button').find((button) =>
      button.text().includes('forgotPassword.submit'),
    )
    await submitButton?.trigger('click')

    expect(wrapper.text()).toContain('forgotPassword.invalid')
  })
})
