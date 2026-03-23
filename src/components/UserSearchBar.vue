<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getUserDisplayName, type User } from '@/types/user'
import userService from '@/services/userService'

const router = useRouter()
const { t } = useI18n()

const userSearch = ref('')
const users = ref<User[]>([])
const isLoadingUsers = ref(false)

const normalizedUserSearch = computed(() => userSearch.value.trim().toLowerCase())
const filteredUsers = computed(() => {
  if (!normalizedUserSearch.value) {
    return []
  }

  return users.value
    .filter((user) => {
      const displayName = getUserDisplayName(user).toLowerCase()
      const email = user.email?.toLowerCase() ?? ''
      const role = user.role?.name?.toLowerCase() ?? ''

      return displayName.includes(normalizedUserSearch.value) ||
        email.includes(normalizedUserSearch.value) ||
        role.includes(normalizedUserSearch.value)
    })
    .slice(0, 6)
})
const showUserResults = computed(() => normalizedUserSearch.value.length > 0)

const formatRoleLabel = (role?: string) => {
  if (!role) return '-'

  const key = `roles.${role.replace(/^ROLE_/, '').trim().toUpperCase()}`
  const translated = t(key)
  return translated === key ? role : translated
}

const goToUserProfile = (userId: number) => {
  userSearch.value = ''
  router.push({ name: 'public-profile', params: { id: userId } })
}

const loadUsers = async () => {
  isLoadingUsers.value = true

  try {
    users.value = await userService.getUsers()
  } catch {
    users.value = []
  } finally {
    isLoadingUsers.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="user-search-shell">
    <v-menu
      :model-value="showUserResults"
      :close-on-content-click="false"
      location="bottom center"
      offset="10"
    >
      <template #activator="{ props }">
        <div class="user-search-anchor" v-bind="props">
          <v-text-field
            v-model="userSearch"
            :label="t('nav.searchUsers')"
            prepend-inner-icon="mdi-account-search"
            variant="solo-filled"
            density="comfortable"
            flat
            hide-details
            clearable
            class="user-search-field"
          />
        </div>
      </template>

      <v-card class="user-search-panel" rounded="xl" elevation="10">
        <v-list v-if="filteredUsers.length" class="py-2">
          <v-list-item
            v-for="user in filteredUsers"
            :key="user.userId"
            class="user-search-item"
            @click="goToUserProfile(user.userId)"
          >
            <template #prepend>
              <div class="user-avatar mr-4">
                {{ getUserDisplayName(user).charAt(0).toUpperCase() }}
              </div>
            </template>
            <v-list-item-title>{{ getUserDisplayName(user) }}</v-list-item-title>
            <v-list-item-subtitle>{{ formatRoleLabel(user.role?.name) }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <div v-else-if="isLoadingUsers" class="user-search-empty">
          {{ t('nav.searchLoading') }}
        </div>

        <div v-else class="user-search-empty">
          {{ t('nav.noUsersFound') }}
        </div>
      </v-card>
    </v-menu>
  </div>
</template>

<style scoped>
.user-search-shell {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 420px;
  margin: 0 8px;
}

.user-search-anchor {
  width: 100%;
}

:deep(.user-search-field .v-field) {
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
}

:deep(.user-search-field .v-field__input) {
  color: white;
}

:deep(.user-search-field .v-label),
:deep(.user-search-field .v-icon) {
  color: rgba(255, 255, 255, 0.82);
}

.user-search-panel {
  min-width: 320px;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.user-search-item {
  border-radius: 16px;
  margin: 0 8px;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
  font-weight: 700;
}

.user-search-empty {
  padding: 18px 20px;
  color: rgb(75, 85, 99);
}

@media (max-width: 959px) {
  .user-search-shell {
    max-width: none;
    margin-left: 0;
  }
}
</style>
