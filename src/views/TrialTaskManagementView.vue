<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">{{ t('trialTasks.title') }}</h1>
        <p class="text-body-2 text-grey-darken-1">{{ t('trialTasks.subtitle', { trialName: trialInfo?.name || '' }) }}</p>
      </div>
      <v-btn variant="text" color="primary" @click="goBack">
        <v-icon icon="mdi-arrow-left" class="mr-1" />
        {{ t('trialTasks.back') }}
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4" closable @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>

    <v-card variant="outlined" class="pa-4 mb-6">
      <div class="text-h6 font-weight-medium mb-4">{{ t('trialTasks.createTask') }}</div>

      <v-alert v-if="!trial?.locationId" type="warning" variant="tonal">
        {{ t('trialTasks.noTrialLocation') }}
      </v-alert>

      <template v-else>
      <v-form ref="taskFormRef" @submit.prevent="handleCreateTask">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="taskForm.title"
              :label="t('trialTasks.taskTitle')"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="taskForm.taskTypeId"
              :label="t('trialTasks.taskType')"
              :items="taskTypeOptions"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="taskForm.maxVolunteers"
              :label="t('trialTasks.maxVolunteers')"
              type="number"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12">
            <v-text-field
              v-model="taskForm.description"
              :label="t('trialTasks.description')"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="taskForm.startDate"
              type="date"
              :label="t('trialTasks.taskStartDate')"
              variant="outlined"
              density="comfortable"
              disabled
              required
              :hint="t('trialTasks.dateLocked')"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="taskForm.startTime"
              type="time"
              label="Heure de début"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="taskForm.endDate"
              type="date"
              :label="t('trialTasks.taskEndDate')"
              variant="outlined"
              density="comfortable"
              disabled
              required
              :hint="t('trialTasks.dateLocked')"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="taskForm.endTime"
              type="time"
              label="Heure de fin"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>
        </v-row>

        <v-row dense class="justify-end">
          <v-col cols="12" md="2">
            <v-btn color="success" type="submit" :loading="isSubmitting" block prepend-icon="mdi-plus" height="48">
              {{ t('trialTasks.create') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
      </template>
    </v-card>

    <v-card variant="outlined" class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-h6 font-weight-medium">{{ t('trialTasks.existingTasks') }}</div>
        <v-chip color="primary" variant="tonal" size="small">{{ tasks.length }}</v-chip>
      </div>

      <v-skeleton-loader v-if="isLoading" type="list-item@3" />

      <v-alert v-else-if="tasks.length === 0" type="info" variant="tonal">
        {{ t('trialTasks.noTasks') }}
      </v-alert>

      <v-list v-else lines="three">
        <v-list-item
          v-for="task in tasks"
          :key="task.id"
          class="rounded-lg mb-2"
          variant="tonal"
        >
          <template #title>
            <span class="font-weight-medium">{{ task.title }}</span>
          </template>

          <template #subtitle>
            <div class="d-flex flex-wrap gap-2 mt-1">
              <v-chip size="small" variant="outlined">
                {{ getTaskTypeName(task.taskTypeId) }}
              </v-chip>
              <v-chip size="small" variant="outlined">
                {{ task.description }}
              </v-chip>
            </div>
          </template>

          <template #append>
            <div class="d-flex flex-column flex-shrink-0" style="min-width: 200px; gap: 8px;">
              <v-btn
                size="small"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-calendar-clock"
                block
                @click="openDateDialog(task)"
              >
                {{ t('trialTasks.editDateTitle') }}
              </v-btn>
              <v-btn
                size="small"
                variant="outlined"
                color="success"
                prepend-icon="mdi-plus-circle-outline"
                block
                @click="openVolunteerDialog(task)"
              >
                {{ t('trialTasks.assignVolunteers') }}
              </v-btn>
              <v-btn
                size="small"
                variant="outlined"
                color="error"
                prepend-icon="mdi-delete"
                block
                @click="deleteTask(task.id)"
              >
                {{ t('trialTasks.delete') }}
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Dialog : Modifier la date -->
    <v-dialog v-model="isDateDialogOpen" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-calendar-clock" class="mr-2" />
          {{ t('trialTasks.editDateTitle') }}
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">{{ t('trialTasks.taskStartDate') }}</div>
            <v-row dense>
              <v-col cols="7">
                <v-text-field
                  v-model="editDateForm.startDate"
                  type="date"
                  label="Date"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="editDateForm.startTime"
                  type="time"
                  label="Heure"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
            </v-row>
          </div>
          <div>
            <div class="text-subtitle-2 mb-2">{{ t('trialTasks.taskEndDate') }}</div>
            <v-row dense>
              <v-col cols="7">
                <v-text-field
                  v-model="editDateForm.endDate"
                  type="date"
                  label="Date"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="editDateForm.endTime"
                  type="time"
                  label="Heure"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isDateDialogOpen = false">{{ t('trialTasks.cancel') }}</v-btn>
          <v-btn color="primary" :loading="isSavingTask" @click="saveDateDialog">
            {{ t('trialTasks.saveDate') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import volunteerService, { type VolunteerTask, type TaskType } from '@/services/volunteerService'
import userService from '@/services/userService'
import championshipService from '@/services/championshipService'
import { UserRole } from '@/types/user'
import type { User } from '@/types/user'
import type { Trial } from '@/types/competition'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const taskFormRef = ref()
const trialId = computed(() => Number(route.params.id))
const isLoading = ref(false)
const isSubmitting = ref(false)
const isAssigning = ref(false)
const isSavingTask = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const tasks = ref<VolunteerTask[]>([])
const taskTypes = ref<TaskType[]>([])
const volunteers = ref<User[]>([])
const trial = ref<Trial | null>(null)

const trialInfo = ref<{ name: string } | null>(null)
const isVolunteerDialogOpen = ref(false)
const isDateDialogOpen = ref(false)
const selectedTask = ref<VolunteerTask | null>(null)
const selectedVolunteerIds = ref<number[]>([])

const taskForm = ref({
  title: '',
  description: '',
  taskTypeId: 0,
  maxVolunteers: 1,
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
})

const editDateForm = ref({
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
})

const taskTypeOptions = computed(() => taskTypes.value)

const availableVolunteers = computed(() =>
  volunteers.value.map((v) => ({
    id: v.userId,
    label: `${v.firstName} ${v.surname}`,
  }))
)

const getTaskTypeName = (taskTypeId: number): string => {
  return taskTypes.value.find((t) => t.id === taskTypeId)?.name || `#${taskTypeId}`
}

const loadTasks = async () => {
  try {
    tasks.value = await volunteerService.getTasksByTarget('TRIAL', trialId.value)
  } catch (error) {
    console.error('Error loading tasks:', error)
    errorMessage.value = t('trialTasks.loadTasksError')
  }
}

const loadTaskTypes = async () => {
  try {
    taskTypes.value = await volunteerService.getTaskTypes()
  } catch (error) {
    console.error('Error loading task types:', error)
    errorMessage.value = t('trialTasks.loadTaskTypesError')
  }
}

const loadVolunteers = async () => {
  try {
    const allUsers = await userService.getUsers()
    volunteers.value = allUsers.filter((u) => u.role.name === UserRole.VOLUNTEER)
  } catch (error) {
    console.error('Error loading volunteers:', error)
    errorMessage.value = t('trialTasks.loadVolunteersError')
  }
}

const loadTrialData = async () => {
  try {
    const loaded = await championshipService.getTrialById(trialId.value)
    trial.value = loaded
    trialInfo.value = { name: loaded.trialName }
    const startDate = loaded.trialStartDate?.split('T')[0] || ''
    const endDate = loaded.trialEndDate?.split('T')[0] || ''
    taskForm.value.startDate = startDate
    taskForm.value.endDate = endDate
    taskForm.value.startTime = '09:00'
    taskForm.value.endTime = '17:00'
  } catch (error) {
    console.error('Error loading trial data:', error)
    trialInfo.value = { name: `Trial #${trialId.value}` }
  }
}

const handleCreateTask = async () => {
  if (!taskForm.value.title.trim() || !taskForm.value.taskTypeId || !taskForm.value.startDate || !taskForm.value.endDate) {
    errorMessage.value = t('validation.requiredField')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const newTask = await volunteerService.createTask({
      targetType: 'TRIAL',
      targetId: trialId.value,
      title: taskForm.value.title.trim(),
      description: taskForm.value.description.trim(),
      taskTypeId: taskForm.value.taskTypeId,
      startDate: `${taskForm.value.startDate}T${taskForm.value.startTime}:00`,
      endDate: `${taskForm.value.endDate}T${taskForm.value.endTime}:00`,
      maxVolunteers: taskForm.value.maxVolunteers,
      locationId: trial.value?.locationId ?? 0,
    })

    tasks.value.unshift(newTask)
    successMessage.value = t('trialTasks.createSuccess')
    taskForm.value = {
      title: '',
      description: '',
      taskTypeId: 0,
      maxVolunteers: 1,
      startDate: trial.value?.trialStartDate?.split('T')[0] || '',
      startTime: '09:00',
      endDate: trial.value?.trialEndDate?.split('T')[0] || '',
      endTime: '17:00',
    }
    taskFormRef.value?.resetValidation()
  } catch (error) {
    console.error('Error creating task:', error)
    errorMessage.value = t('trialTasks.createError')
  } finally {
    isSubmitting.value = false
  }
}

const openVolunteerDialog = (task: VolunteerTask) => {
  selectedTask.value = task
  selectedVolunteerIds.value = []
  isVolunteerDialogOpen.value = true
}

const openDateDialog = (task: VolunteerTask) => {
  selectedTask.value = task
  editDateForm.value = {
    startDate: task.startDate?.split('T')[0] || '',
    startTime: task.startDate?.split('T')[1]?.substring(0, 5) || '',
    endDate: task.endDate?.split('T')[0] || '',
    endTime: task.endDate?.split('T')[1]?.substring(0, 5) || '',
  }
  isDateDialogOpen.value = true
}

const openLocationDialog = (task: VolunteerTask) => {
  selectedTask.value = task
  editLocationForm.value = { locationId: task.locationId || 0 }
  isLocationDialogOpen.value = true
}

const handleAssignVolunteers = async () => {
  if (!selectedTask.value || selectedVolunteerIds.value.length === 0) {
    errorMessage.value = t('trialTasks.selectVolunteersError')
    return
  }

  isAssigning.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    for (const volunteerId of selectedVolunteerIds.value) {
      await volunteerService.createAssignment({
        volunteerId,
        taskId: selectedTask.value.id,
      })
    }

    successMessage.value = t('trialTasks.assignSuccess', { count: selectedVolunteerIds.value.length })
    isVolunteerDialogOpen.value = false
    selectedTask.value = null
    selectedVolunteerIds.value = []
  } catch (error) {
    console.error('Error assigning volunteers:', error)
    errorMessage.value = t('trialTasks.assignError')
  } finally {
    isAssigning.value = false
  }
}

const saveDateDialog = async () => {
  if (!selectedTask.value) return

  isSavingTask.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const updatedTask = await volunteerService.updateTask(selectedTask.value.id, {
      ...selectedTask.value,
      startDate: `${editDateForm.value.startDate}T${editDateForm.value.startTime}:00`,
      endDate: `${editDateForm.value.endDate}T${editDateForm.value.endTime}:00`,
    })

    const index = tasks.value.findIndex((t) => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }

    successMessage.value = t('trialTasks.dateUpdateSuccess')
    isDateDialogOpen.value = false
  } catch (error) {
    console.error('Error updating task date:', error)
    errorMessage.value = t('trialTasks.dateUpdateError')
  } finally {
    isSavingTask.value = false
  }
}

const deleteTask = async (taskId: number) => {
  if (!confirm(t('trialTasks.deleteConfirm'))) return

  try {
    await volunteerService.deleteTask(taskId)
    tasks.value = tasks.value.filter((t) => t.id !== taskId)
    successMessage.value = t('trialTasks.deleteSuccess')
  } catch (error) {
    console.error('Error deleting task:', error)
    errorMessage.value = t('trialTasks.deleteError')
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([loadTasks(), loadTaskTypes(), loadVolunteers(), loadTrialData()])
  } finally {
    isLoading.value = false
  }
})
</script> {
    isSavingTask.value = false
  }
}
