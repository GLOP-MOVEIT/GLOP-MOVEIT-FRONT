import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentPreviewDialog from '@/components/commissioner/DocumentPreviewDialog.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const stubs = {
  'v-dialog': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-card-actions': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i></i>' },
  'v-text-field': { template: '<input />' },
  'v-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
}

describe('DocumentPreviewDialog', () => {
  it('emits validate with the document and closes', async () => {
    const wrapper = mount(DocumentPreviewDialog, {
      props: {
        modelValue: true,
        document: { id: 1, filename: 'file.pdf' },
      },
      global: { stubs },
    })

    const validateButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('commissioner.documentValidate'))
    await validateButton?.trigger('click')

    expect(wrapper.emitted('validate')?.[0]).toEqual([{ id: 1, filename: 'file.pdf' }])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('closes without validating when no document is provided', async () => {
    const wrapper = mount(DocumentPreviewDialog, {
      props: {
        modelValue: true,
        document: null,
      },
      global: { stubs },
    })

    const validateButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('commissioner.documentValidate'))
    await validateButton?.trigger('click')

    expect(wrapper.emitted('validate')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })
})
