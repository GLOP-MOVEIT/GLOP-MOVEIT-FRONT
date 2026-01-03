<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3" class="pa-6">
          <v-row align="center" class="mb-6">
            <v-col cols="12" md="8">
              <h1 class="text-h4 font-weight-bold">{{ t('profile.title') }}</h1>
              <p class="text-subtitle-1 text-grey-darken-1">
                {{ t('profile.subtitle') }}
              </p>
            </v-col>
            <v-col cols="12" md="4" class="text-md-right">
              <v-chip color="primary" variant="elevated" class="ma-1">
                {{ t('profile.primaryRole') }} {{ formatRoleLabel(primaryRole) }}
              </v-chip>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12" md="6">
              <div class="text-overline mb-2">{{ t('profile.identitySection') }}</div>
              <div class="text-body-1 font-weight-medium">
                {{ displayName }}
              </div>
              <div class="text-body-2 text-grey-darken-1 mt-2">
                <strong>{{ t('profile.emailLabel') }}</strong>
                {{ user?.email || '-' }}
              </div>
              <div class="text-body-2 text-grey-darken-1">
                <strong>{{ t('profile.phoneLabel') }}</strong>
                {{ user?.phoneNumber || '-' }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-overline mb-2">{{ t('profile.accountSection') }}</div>
              <div class="text-body-2 text-grey-darken-1">
                <strong>{{ t('profile.joinedLabel') }}</strong>
                {{ formatDate(user?.createdAt) }}
              </div>
              <div class="text-body-2 text-grey-darken-1">
                <strong>{{ t('profile.notificationsLabel') }}</strong>
                {{ user?.acceptsNotifications ? t('profile.yes') : t('profile.no') }}
              </div>
              <div class="text-body-2 text-grey-darken-1">
                <strong>{{ t('profile.locationLabel') }}</strong>
                {{ user?.acceptsLocation ? t('profile.yes') : t('profile.no') }}
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="text-overline mb-3">{{ t('profile.rolesSection') }}</div>
          <div class="d-flex flex-wrap">
            <v-chip
              v-for="role in roles"
              :key="role"
              class="ma-1"
              :color="role === primaryRole ? 'primary' : 'secondary'"
              :variant="role === primaryRole ? 'elevated' : 'outlined'"
            >
              {{ formatRoleLabel(role) }}
            </v-chip>
          </div>

          <template v-if="showRoleRequests">
            <v-divider class="my-6" />

            <div class="text-overline mb-3">{{ t('profile.roleRequestSection') }}</div>
            <p class="text-body-2 text-grey-darken-1 mb-4">
              {{ t('profile.roleRequestInfo') }}
            </p>
            <div class="d-flex flex-wrap">
              <v-btn
                color="primary"
                variant="outlined"
                class="mr-3 mb-2"
                to="/demande-role/sportif"
              >
                {{ t('profile.requestSportif') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="outlined"
                class="mb-2"
                to="/demande-role/volontaire"
              >
                {{ t('profile.requestVolontaire') }}
              </v-btn>
            </div>
          </template>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-6"
            closable
            @click:close="userStore.clearError"
          >
            {{ error }}
          </v-alert>

          <div v-if="isLoading" class="d-flex justify-center py-6">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/user'

const userStore = useUserStore()
const { t, locale } = useI18n()

const user = computed(() => userStore.user)
const isLoading = computed(() => userStore.isLoading)
const error = computed(() => userStore.error)

const displayName = computed(() => {
  if (!user.value) return '-'
  return `${user.value.firstName} ${user.value.surname}`.trim() || '-'
})

const roles = computed(() => userStore.roles)

const primaryRole = computed(() => {
  return user.value?.role?.name || roles.value[0]
})

const normalizeRoleKey = (role: string) => {
  const normalized = role.replace(/^ROLE_/, '').trim().toUpperCase()
  if (normalized === 'VOLUNTEER') return 'VOLONTAIRE'
  if (normalized === 'COMMISSIONER') return 'COMMISSAIRE'
  return normalized
}

const formatRoleValue = (role?: string) => {
  if (!role) return ''
  return normalizeRoleKey(role)
}

const formatRoleLabel = (role?: string) => {
  const normalized = formatRoleValue(role)
  if (!normalized) return '-'
  const key = `roles.${normalized}`
  const translated = t(key)
  return translated === key ? normalized : translated
}

const showRoleRequests = computed(() => {
  return !userStore.hasRole(UserRole.ADMIN) && !userStore.hasRole(UserRole.COMMISSAIRE)
})

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(locale.value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

onMounted(() => {
  userStore.fetchCurrentUser()
})
</script>
