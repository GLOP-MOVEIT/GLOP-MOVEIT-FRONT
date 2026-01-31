import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import UserFilterBar from '@/components/filters/UserFilterBar.vue'

const VTextFieldStub = defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})

const VSelectStub = defineComponent({
  props: ['modelValue', 'items'],
  emits: ['update:modelValue'],
  template:
    '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)">' +
    '<option v-for="item in items" :key="item.value" :value="item.value">{{ item.title }}</option>' +
    '</select>',
})

const stubs = {
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-text-field': VTextFieldStub,
  'v-select': VSelectStub,
}

describe('UserFilterBar', () => {
  it('binds search and role models', async () => {
    const wrapper = mount(UserFilterBar, {
      props: {
        searchLabel: 'Search',
        roleLabel: 'Role',
        roleOptions: [
          { title: 'Admin', value: 'ADMIN' },
          { title: 'Spectator', value: 'SPECTATOR' },
        ],
        search: null,
        role: null,
      },
      global: { stubs },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('john')
    await wrapper.find('select').setValue('ADMIN')

    expect(wrapper.emitted('update:search')?.[0]).toEqual(['john'])
    expect(wrapper.emitted('update:role')?.[0]).toEqual(['ADMIN'])
  })
})
