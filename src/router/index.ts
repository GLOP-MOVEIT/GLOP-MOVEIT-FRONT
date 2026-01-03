import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import LoginView from '@/views/LoginView.vue'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      hideLayout: true,
    },
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'profil',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'parametres',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'demande-role/:role',
        name: 'role-request',
        component: () => import('@/views/RoleRequestView.vue'),
        meta: {
          requiresAuth: true,
          disallowRoles: [UserRole.ADMIN, UserRole.COMMISSAIRE],
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard pour l'authentification
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.disallowRoles) {
    const disallowed = to.meta.disallowRoles as UserRole[]
    const hasDisallowedRole = disallowed.some((role) => userStore.hasRole(role))

    if (hasDisallowedRole) {
      next({ name: 'profile' })
    } else {
      next()
    }
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
