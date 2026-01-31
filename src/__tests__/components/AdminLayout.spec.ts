import {describe, expect, it} from 'vitest'
import {mount} from '@vue/test-utils'
import AdminLayout from '@/components/AdminLayout.vue'

const stubs = {
    'v-navigation-drawer': {template: '<aside><slot /></aside>'},
    'v-list': {template: '<div><slot /></div>'},
    'v-list-item': {
        props: ['title'],
        template: '<div @click="$emit(\'click\')"><slot />{{ title }}</div>',
    },
    'v-divider': {template: '<hr />'},
}

describe('AdminLayout', () => {
    it('renders title, subtitle, and items', () => {
        const wrapper = mount(AdminLayout, {
            props: {
                title: 'Admin',
                subtitle: 'Manage settings',
                items: [
                    {title: 'Users', icon: 'mdi-account', to: '/admin/users'},
                    {title: 'Stats', icon: 'mdi-chart-bar', to: '/admin/stats'},
                ],
            },
            global: {stubs},
        })

        expect(wrapper.text()).toContain('Admin')
        expect(wrapper.text()).toContain('Manage settings')
        expect(wrapper.text()).toContain('Users')
        expect(wrapper.text()).toContain('Stats')
    })
})
