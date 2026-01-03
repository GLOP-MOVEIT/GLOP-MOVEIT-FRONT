<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-account-group" size="32" color="primary" class="mr-2" />
        <h2 class="text-h5 font-weight-bold">{{ t('admin.usersSection') }}</h2>
      </div>
      <v-btn variant="text" to="/admin" class="text-none">
        <v-icon icon="mdi-arrow-left" class="mr-1" />
        {{ t('admin.backToDashboard') }}
      </v-btn>
    </div>

    <v-alert type="info" variant="tonal" class="mb-4">
      {{ t('admin.usersInfo') }}
    </v-alert>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          :label="t('admin.searchUsers')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          density="comfortable"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedRole"
          :items="roleOptions"
          :label="t('admin.filterRole')"
          variant="outlined"
          clearable
          density="comfortable"
        ></v-select>
      </v-col>
    </v-row>

    <v-table>
      <thead>
        <tr>
          <th class="text-left">{{ t('admin.userName') }}</th>
          <th class="text-left">{{ t('admin.userEmail') }}</th>
          <th class="text-left">{{ t('admin.userRole') }}</th>
          <th class="text-left">{{ t('admin.userActions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading">
          <td colspan="4" class="text-center text-grey-darken-1 py-6">
            {{ t('admin.loading') }}
          </td>
        </tr>
        <tr v-else-if="filteredUsers.length === 0">
          <td colspan="4" class="text-center text-grey-darken-1 py-6">
            {{ t('admin.noUsers') }}
          </td>
        </tr>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ formatName(user) }}</td>
          <td>{{ user.email }}</td>
          <td>{{ formatRoleLabel(user) }}</td>
          <td>
            <v-btn size="small" color="primary" variant="outlined" disabled>
              {{ t('admin.promoteCommissaire') }}
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-6">
      {{ errorMessage }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import userService from '@/services/userService'
import type { User } from '@/types/user'
import { UserRole } from '@/types/user'

const { t } = useI18n()

const users = ref<User[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedRole = ref<string | null>(null)

const formatName = (user: User) => {
  return `${user.firstName ?? ''} ${user.surname ?? ''}`.trim() || '-'
}

const normalizeRoleKey = (role: string) => {
  const normalized = role.replace(/^ROLE_/, '').trim().toUpperCase()
  if (normalized === 'VOLUNTEER') return 'VOLONTAIRE'
  if (normalized === 'COMMISSIONER') return 'COMMISSAIRE'
  return normalized
}

const formatRoleValue = (user: User) => {
  const raw = user.role?.name || user.authorities?.[0]?.authority || ''
  return raw ? normalizeRoleKey(raw) : ''
}

const formatRoleLabel = (user: User) => {
  const role = formatRoleValue(user)
  if (!role) return '-'
  const key = `roles.${role}`
  const translated = t(key)
  return translated === key ? role : translated
}

const fetchUsers = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    users.value = await userService.getUsers()
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || t('admin.usersError')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

const roleOptions = computed(() => [
  { title: t('roles.SPECTATOR'), value: UserRole.SPECTATOR },
  { title: t('roles.SPORTIF'), value: UserRole.SPORTIF },
  { title: t('roles.VOLONTAIRE'), value: UserRole.VOLONTAIRE },
  { title: t('roles.COMMISSAIRE'), value: UserRole.COMMISSAIRE },
  { title: t('roles.ADMIN'), value: UserRole.ADMIN },
])

const filteredUsers = computed(() => {
  const query = (searchQuery.value || '').trim().toLowerCase()
  return users.value.filter((user) => {
    const role = formatRoleValue(user)
    const matchesQuery =
      !query ||
      user.email?.toLowerCase().includes(query) ||
      formatName(user).toLowerCase().includes(query) ||
      role.toLowerCase().includes(query)

    const matchesRole = !selectedRole.value || role === selectedRole.value

    return matchesQuery && matchesRole
  })
})
</script>
