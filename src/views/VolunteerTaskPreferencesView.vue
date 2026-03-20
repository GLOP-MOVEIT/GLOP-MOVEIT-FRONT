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

      <v-card variant="outlined" class="pa-4 mt-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <v-icon icon="mdi-clipboard-list" class="mr-2" color="primary" />
            <div>
              <div class="text-subtitle-1 font-weight-medium">{{ t('volunteerTasks.myAssignments') }}</div>
              <div class="text-caption text-grey-darken-1">{{ t('volunteerTasks.myAssignmentsSubtitle') }}</div>
            </div>
          </div>
          <v-chip size="small" variant="tonal" color="primary" label>{{ assignments.length }}</v-chip>
        </div>

        <div v-if="assignmentsLoading" class="d-flex justify-center py-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-alert v-else-if="assignments.length === 0" type="info" variant="tonal">
          {{ t('volunteerTasks.noAssignments') }}
        </v-alert>

        <v-row v-else dense>
          <v-col
            v-for="assignment in assignments"
            :key="assignment.id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card variant="outlined" class="pa-3 h-100">
              <div class="d-flex justify-space-between align-start mb-2">
                <span class="text-subtitle-2 font-weight-bold">
                  {{ getTaskForAssignment(assignment.taskId)?.title ?? `#${assignment.taskId}` }}
                </span>
                <v-chip :color="assignmentStatusColor(assignment.status)" size="x-small" label>
                  {{ t(`volunteerTasks.status.${assignment.status}`) }}
                </v-chip>
              </div>

              <template v-if="getTaskForAssignment(assignment.taskId)">
                <div class="text-body-2 text-grey-darken-2">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="14" class="mr-1">mdi-tag</v-icon>
                    {{ getTaskTypeName(getTaskForAssignment(assignment.taskId)!.taskTypeId) }}
                  </div>
                  <div v-if="getTaskForAssignment(assignment.taskId)!.description" class="d-flex align-start mb-1">
                    <v-icon size="14" class="mr-1 mt-1">mdi-text</v-icon>
                    <span>{{ getTaskForAssignment(assignment.taskId)!.description }}</span>
                  </div>
                  <div class="d-flex align-start mb-1">
                    <v-icon size="14" class="mr-1 mt-1">mdi-calendar-clock</v-icon>
                    <div>
                      <div>{{ formatDateTime(getTaskForAssignment(assignment.taskId)!.startDate, locale) }}</div>
                      <div>→ {{ formatDateTime(getTaskForAssignment(assignment.taskId)!.endDate, locale) }}</div>
                    </div>
                  </div>
                  <div v-if="getLocationForTask(getTaskForAssignment(assignment.taskId)!)" class="d-flex align-start mb-1">
                    <v-icon size="14" class="mr-1 mt-1">mdi-map-marker</v-icon>
                    <div>
                      <div>{{ getLocationForTask(getTaskForAssignment(assignment.taskId)!)!.name }}</div>
                      <div v-if="getLocationForTask(getTaskForAssignment(assignment.taskId)!)!.athleteEntrance" class="text-caption">
                        <v-icon size="12" class="mr-1">mdi-door-open</v-icon>
                        {{ getLocationForTask(getTaskForAssignment(assignment.taskId)!)!.athleteEntrance }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <div v-if="assignment.status === 'PENDING'" class="d-flex gap-2 mt-3">
                <v-btn
                  color="success"
                  size="small"
                  variant="tonal"
                  prepend-icon="mdi-check"
                  :loading="respondingAssignmentId === assignment.id"
                  class="flex-grow-1"
                  @click="handleResponse(assignment, 'ACCEPTED')"
                >
                  {{ t('volunteerTasks.accept') }}
                </v-btn>
                <v-btn
                  color="error"
                  size="small"
                  variant="tonal"
                  prepend-icon="mdi-close"
                  :loading="respondingAssignmentId === assignment.id"
                  class="flex-grow-1"
                  @click="handleResponse(assignment, 'REFUSED')"
                >
                  {{ t('volunteerTasks.refuse') }}
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import volunteerService, { type TaskType, type VolunteerPreference, type VolunteerAssignment, type VolunteerTask } from '@/services/volunteerService'
import locationService from '@/services/locationService'
import type { Location } from '@/types/location'
import { formatDateTime } from '@/utils/date'

const { t, locale } = useI18n()
const userStore = useUserStore()

const taskTypes = ref<TaskType[]>([])
const userPreferences = ref<VolunteerPreference[]>([])
const assignments = ref<VolunteerAssignment[]>([])
const taskMap = ref<Map<number, VolunteerTask>>(new Map())
const locations = ref<Location[]>([])
const isLoading = ref(false)
const assignmentsLoading = ref(false)
const respondingAssignmentId = ref<number | null>(null)
const loadingTaskTypeId = ref<number | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

const favoriteTaskTypeIds = computed(() => userPreferences.value.map((p) => p.taskTypeId))

const isFavorite = (taskTypeId: number): boolean => {
  return favoriteTaskTypeIds.value.includes(taskTypeId)
}

const getTaskForAssignment = (taskId: number): VolunteerTask | null => {
  return taskMap.value.get(taskId) ?? null
}

const getTaskTypeName = (taskTypeId: number): string => {
  return taskTypes.value.find((t) => t.id === taskTypeId)?.name ?? `#${taskTypeId}`
}

const getLocationForTask = (task: VolunteerTask): Location | null => {
  if (!task.locationId) return null
  return locations.value.find((l) => l.locationId === task.locationId) ?? null
}

const assignmentStatusColor = (status: string) => {
  if (status === 'ACCEPTED') return 'success'
  if (status === 'REFUSED') return 'error'
  return 'warning'
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

const loadAssignments = async () => {
  const userId = userStore.user?.userId
  if (!userId) return
  assignmentsLoading.value = true
  try {
    const data = await volunteerService.getAssignmentsByVolunteer(userId)
    assignments.value = data
    const uniqueTaskIds = [...new Set(data.map((a) => a.taskId))]
    const taskResponses = await Promise.all(
      uniqueTaskIds.map((id) => volunteerService.getTask(id).catch(() => null))
    )
    const map = new Map<number, VolunteerTask>()
    taskResponses.forEach((task) => { if (task) map.set(task.id, task) })
    taskMap.value = map
  } catch {
    errorMessage.value = t('volunteerTasks.loadAssignmentsError')
  } finally {
    assignmentsLoading.value = false
  }
}

const handleResponse = async (assignment: VolunteerAssignment, status: 'ACCEPTED' | 'REFUSED') => {
  const userId = userStore.user?.userId
  if (!userId) return
  respondingAssignmentId.value = assignment.id
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const updated = await volunteerService.respondToAssignment(assignment.id, { volunteerId: userId, status })
    const idx = assignments.value.findIndex((a) => a.id === updated.id)
    if (idx !== -1) assignments.value[idx] = updated
    successMessage.value = status === 'ACCEPTED' ? t('volunteerTasks.acceptSuccess') : t('volunteerTasks.refuseSuccess')
  } catch {
    errorMessage.value = t('volunteerTasks.responseError')
  } finally {
    respondingAssignmentId.value = null
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
    await Promise.all([
      loadTaskTypes(),
      loadUserPreferences(),
      locationService.getAllLocations().then((data) => { locations.value = data }).catch(() => {}),
    ])
  } finally {
    isLoading.value = false
  }
  loadAssignments()
})
</script>

