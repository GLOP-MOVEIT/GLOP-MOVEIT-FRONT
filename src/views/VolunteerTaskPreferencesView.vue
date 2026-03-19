<template>
  <v-container class="py-6">
    <div class="d-flex align-center mb-6">
      <v-icon icon="mdi-heart-outline" size="32" color="primary" class="mr-3" />
      <div>
        <h1 class="text-h5 font-weight-bold">{{ t('volunteerTasks.title') }}</h1>
        <p class="text-body-2 text-grey-darken-1 mb-0">{{ t('volunteerTasks.subtitle') }}</p>
      </div>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4" closable @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>

    <v-skeleton-loader v-if="isLoading" type="card@3" />

    <template v-else>
      <v-alert v-if="taskTypes.length === 0" type="info" variant="tonal">
        {{ t('volunteerTasks.noTaskTypes') }}
      </v-alert>

      <v-row v-else>
        <v-col
          v-for="taskType in taskTypes"
          :key="taskType.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            variant="outlined"
            :class="{ 'border-primary': isFavorite(taskType.id) }"
            class="pa-4 h-100"
          >
            <div class="d-flex align-center justify-space-between mb-3">
              <v-avatar color="primary" variant="tonal" size="48">
                <v-icon icon="mdi-tag" size="24" />
              </v-avatar>
              <v-btn
                :icon="isFavorite(taskType.id) ? 'mdi-heart' : 'mdi-heart-outline'"
                :color="isFavorite(taskType.id) ? 'error' : 'grey'"
                variant="text"
                :loading="loadingTaskTypeId === taskType.id"
                @click="toggleFavorite(taskType.id)"
              />
            </div>

            <h3 class="text-h6 font-weight-bold mb-2">{{ taskType.name }}</h3>
            <p class="text-body-2 text-grey-darken-1 mb-0">{{ taskType.description }}</p>

            <v-chip
              v-if="isFavorite(taskType.id)"
              size="small"
              color="error"
              variant="tonal"
              prepend-icon="mdi-heart"
              class="mt-3"
            >
              {{ t('volunteerTasks.favorite') }}
            </v-chip>
          </v-card>
        </v-col>
      </v-row>

      <v-card variant="outlined" class="pa-4 mt-6">
        <div class="d-flex align-center mb-3">
          <v-icon icon="mdi-information-outline" class="mr-2" color="primary" />
          <div class="text-subtitle-1 font-weight-medium">{{ t('volunteerTasks.infoTitle') }}</div>
        </div>
        <p class="text-body-2 text-grey-darken-1 mb-0">
          {{ t('volunteerTasks.infoText') }}
        </p>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import volunteerService, { type TaskType, type VolunteerPreference } from '@/services/volunteerService'

const { t } = useI18n()
const userStore = useUserStore()

const taskTypes = ref<TaskType[]>([])
const userPreferences = ref<VolunteerPreference[]>([])
const isLoading = ref(false)
const loadingTaskTypeId = ref<number | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

const favoriteTaskTypeIds = computed(() => userPreferences.value.map((p) => p.taskTypeId))

const isFavorite = (taskTypeId: number): boolean => {
  return favoriteTaskTypeIds.value.includes(taskTypeId)
}

const loadTaskTypes = async () => {
  try {
    taskTypes.value = await volunteerService.getTaskTypes()
  } catch (error) {
    console.error('Error loading task types:', error)
    errorMessage.value = t('volunteerTasks.loadTaskTypesError')
  }
}

const loadUserPreferences = async () => {
  const userId = userStore.user?.userId
  if (!userId) return

  try {
    userPreferences.value = await volunteerService.getUserPreferences(userId)
  } catch (error) {
    console.error('Error loading user preferences:', error)
    errorMessage.value = t('volunteerTasks.loadPreferencesError')
  }
}

const toggleFavorite = async (taskTypeId: number) => {
  const userId = userStore.user?.userId
  if (!userId) {
    errorMessage.value = t('volunteerTasks.authRequired')
    return
  }

  loadingTaskTypeId.value = taskTypeId
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (isFavorite(taskTypeId)) {
      // Retirer des favoris
      const preference = userPreferences.value.find((p) => p.taskTypeId === taskTypeId)
      if (preference) {
        await volunteerService.deletePreference(preference.id)
        userPreferences.value = userPreferences.value.filter((p) => p.id !== preference.id)
        successMessage.value = t('volunteerTasks.removeFavoriteSuccess')
      }
    } else {
      // Ajouter aux favoris
      const newPreference = await volunteerService.createPreference({
        userId,
        taskTypeId,
      })
      userPreferences.value.push(newPreference)
      successMessage.value = t('volunteerTasks.addFavoriteSuccess')
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    errorMessage.value = t('volunteerTasks.toggleFavoriteError')
  } finally {
    loadingTaskTypeId.value = null
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([loadTaskTypes(), loadUserPreferences()])
  } finally {
    isLoading.value = false
  }
})
</script>

