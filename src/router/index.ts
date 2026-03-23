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
        path: 'championnats/:id',
        name: 'championship-details',
        component: () => import('@/views/ChampionshipDetailsView.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'competitions/:id',
        name: 'competition-details',
        component: () => import('@/views/CompetitionDetailsView.vue'),
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
          disallowRoles: [UserRole.ADMIN, UserRole.REFEREE],
        },
      },
      {path: 'mes-convocations',
        name: 'athlete-convocations',
        component: () => import('@/views/AthleteConvocationsView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: UserRole.ATHLETE,
        },
      },
      {
        path: 'mes-taches',
        name: 'volunteer-tasks',
        component: () => import('@/views/VolunteerTaskPreferencesView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: UserRole.VOLUNTEER,
        },
      },
      {
        path: 'admin',
        component: () => import('@/views/AdminShellView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: UserRole.ADMIN,
        },
        children: [
          {
            path: '',
            name: 'admin-overview',
            component: () => import('@/views/AdminOverviewView.vue'),
          },
          {
            path: 'users',
            name: 'admin-users',
            component: () => import('@/views/AdminUsersView.vue'),
          },
          {
            path: 'championships',
            name: 'admin-championships',
            component: () => import('@/views/AdminChampionshipsView.vue'),
          },
          {
            path: 'competitions',
            name: 'admin-competitions',
            component: () => import('@/views/AdminCompetitionsView.vue'),
          },
          {
            path: 'lieux',
            name: 'admin-locations',
            component: () => import('@/views/AdminLocationsView.vue'),
          },
        ],
      },
      {
        path: 'referee',
        component: () => import('@/views/CommissionerShellView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: UserRole.REFEREE,
        },
        children: [
          {
            path: '',
            name: 'commissioner-overview',
            component: () => import('@/views/CommissionerOverviewView.vue'),
          },
          {
            path: 'competitions/:id/gestion',
            name: 'commissioner-competition-management',
            component: () => import('@/views/CommissionerCompetitionManagementView.vue'),
          },
          {
            path: 'demandes',
            name: 'commissioner-requests',
            component: () => import('@/views/CommissionerRequestsView.vue'),
          },
          {
            path: 'taches',
            name: 'commissioner-tasks',
            component: () => import('@/views/CommissionerTaskManagementView.vue'),
          },
          {
            path: 'epreuves/:id/taches',
            name: 'trial-tasks',
            component: () => import('@/views/TrialTaskManagementView.vue'),
          },
          {
            path: 'resultats',
            name: 'commissioner-results',
            component: () => import('@/views/CommissionerResultsView.vue'),
          },
        ],
      },
      {
        path: 'commissaire',
        redirect: '/referee',
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

const ensureUserProfile = async (userStore: ReturnType<typeof useUserStore>) => {
  if (userStore.isAuthenticated && !userStore.user?.role && !userStore.isLoading) {
    try {
      await userStore.fetchCurrentUser()
    } catch (error) {
      console.warn('Impossible de récupérer le profil utilisateur:', error)
    }
  }
}

const handleDisallowedRoles = (
  to: { meta: { disallowRoles?: UserRole[] } },
  userStore: ReturnType<typeof useUserStore>,
): { name: string } | null => {
  const disallowed = to.meta.disallowRoles as UserRole[]
  const hasDisallowedRole = disallowed.some((role) => userStore.hasRole(role))
  return hasDisallowedRole ? { name: 'profile' } : null
}

const handleRequiredRole = (
  to: { meta: { requiresRole?: UserRole } },
  userStore: ReturnType<typeof useUserStore>,
): { name: string } | null => {
  const requiredRole = to.meta.requiresRole as UserRole

  if (requiredRole === UserRole.REFEREE && userStore.hasRole(UserRole.ADMIN)) {
    return null
  }

  return userStore.hasRole(requiredRole) ? null : { name: 'home' }
}

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  await ensureUserProfile(userStore)

  const isAuthenticated = userStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }

  if (to.meta.disallowRoles) {
    const redirect = handleDisallowedRoles(to, userStore)
    return redirect ? next(redirect) : next()
  }

  if (to.meta.requiresRole) {
    const redirect = handleRequiredRole(to, userStore)
    return redirect ? next(redirect) : next()
  }

  if (to.name === 'login' && isAuthenticated) {
    return next({ name: 'home' })
  }

  next()
})

export default router
