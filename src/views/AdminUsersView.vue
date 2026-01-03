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
        <tr v-else-if="users.length === 0">
          <td colspan="4" class="text-center text-grey-darken-1 py-6">
            {{ t('admin.noUsers') }}
          </td>
        </tr>
        <tr v-for="user in users" :key="user.id">
          <td>{{ formatName(user) }}</td>
          <td>{{ user.email }}</td>
          <td>{{ formatRole(user) }}</td>
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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import userService from '@/services/userService'
import type { User } from '@/types/user'

const { t } = useI18n()

const users = ref<User[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const formatName = (user: User) => {
  return `${user.firstName ?? ''} ${user.surname ?? ''}`.trim() || '-'
}

const formatRole = (user: User) => {
  return user.role?.name || user.authorities?.[0]?.authority?.replace(/^ROLE_/, '') || '-'
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
</script>
