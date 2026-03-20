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

      <v-row v-else dense>
        <v-col v-for="task in tasks" :key="task.id" cols="12">
          <v-card variant="elevated" elevation="2" rounded="lg" class="mb-3">
            <v-card-item>
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="42" class="mr-2">
                  <v-icon icon="mdi-clipboard-text" />
                </v-avatar>
              </template>
              <v-card-title class="text-subtitle-1 font-weight-bold">{{ task.title }}</v-card-title>
              <v-card-subtitle v-if="task.description" class="mt-1">{{ task.description }}</v-card-subtitle>
            </v-card-item>

            <v-card-text class="pt-0">
              <div class="d-flex align-center flex-wrap gap-2 mb-3">
                <v-chip size="small" color="primary" variant="flat" prepend-icon="mdi-tag">
                  {{ getTaskTypeName(task.taskTypeId) }}
                </v-chip>
                <v-chip size="small" color="grey" variant="tonal" prepend-icon="mdi-account-group">
                  {{ task.maxVolunteers }} max
                </v-chip>
                <v-chip
                  v-if="getAssignmentsForTask(task.id).filter(a => a.status === 'ACCEPTED').length"
                  size="small"
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-check-circle"
                >
                  {{ getAssignmentsForTask(task.id).filter(a => a.status === 'ACCEPTED').length }} {{ t('trialTasks.statusAccepted') }}
                </v-chip>
                <v-chip
                  v-if="getAssignmentsForTask(task.id).filter(a => a.status === 'PENDING').length"
                  size="small"
                  color="warning"
                  variant="flat"
                  prepend-icon="mdi-clock-outline"
                >
                  {{ getAssignmentsForTask(task.id).filter(a => a.status === 'PENDING').length }} {{ t('trialTasks.statusPending') }}
                </v-chip>
                <v-chip
                  v-if="getAssignmentsForTask(task.id).filter(a => a.status === 'REFUSED').length"
                  size="small"
                  color="error"
                  variant="flat"
                  prepend-icon="mdi-close-circle"
                >
                  {{ getAssignmentsForTask(task.id).filter(a => a.status === 'REFUSED').length }} {{ t('trialTasks.statusRefused') }}
                </v-chip>
              </div>
              <v-progress-linear
                :model-value="(getAssignmentsForTask(task.id).filter(a => a.status === 'ACCEPTED').length / task.maxVolunteers) * 100"
                color="success"
                rounded
                height="6"
                bg-color="grey-lighten-3"
              />
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-3 gap-2">
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="mdi-calendar-clock"
                @click="openDateDialog(task)"
              >
                {{ t('trialTasks.editDateTitle') }}
              </v-btn>
              <v-btn
                color="success"
                variant="tonal"
                size="small"
                prepend-icon="mdi-account-plus"
                @click="openVolunteerDialog(task)"
              >
                {{ t('trialTasks.assignVolunteers') }}
              </v-btn>
              <v-btn
                color="info"
                variant="text"
                size="small"
                prepend-icon="mdi-account-group"
                @click="openVolunteerListDialog(task)"
              >
                {{ t('trialTasks.viewVolunteers') }}
                <v-badge
                  v-if="getAssignmentsForTask(task.id).length"
                  :content="getAssignmentsForTask(task.id).length"
                  color="info"
                  inline
                />
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
    <v-dialog v-model="isVolunteerDialogOpen" max-width="600" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-account-plus" class="mr-2" />
          {{ t('trialTasks.assignVolunteers', { taskTitle: selectedTask?.title }) }}
        </v-card-title>
        <v-card-text style="max-height: 60vh">
          <div v-if="isLoadingVolunteerPreferences" class="d-flex justify-center py-4">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div v-else-if="volunteers.length === 0" class="text-grey text-center py-4">
            {{ t('trialTasks.noVolunteers') }}
          </div>
          <template v-else>
            <v-alert
              :type="canSelectMore ? 'info' : 'warning'"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              {{ t('trialTasks.slotsRemaining', { n: remainingSlots }) }}
            </v-alert>

            <div v-if="currentTaskAssignments.length" class="mb-4">
              <div class="text-caption font-weight-bold text-grey text-uppercase mb-2">
                {{ t('trialTasks.alreadyAssigned') }}
              </div>
              <v-card
                v-for="a in currentTaskAssignments"
                :key="a.id"
                variant="tonal"
                :color="a.status === 'ACCEPTED' ? 'success' : a.status === 'REFUSED' ? 'error' : 'warning'"
                class="mb-1"
              >
                <div class="d-flex align-center justify-space-between px-3 py-2">
                  <span class="text-body-2">{{ getVolunteerName(a.volunteerId) }}</span>
                  <v-chip
                    :color="a.status === 'ACCEPTED' ? 'success' : a.status === 'REFUSED' ? 'error' : 'warning'"
                    size="x-small"
                    label
                  >
                    {{ t(`trialTasks.status${a.status.charAt(0) + a.status.slice(1).toLowerCase()}`) }}
                  </v-chip>
                </div>
              </v-card>
            </div>

            <div v-if="volunteersWithPreference.length" class="mb-4">
              <div class="d-flex align-center mb-2">
                <v-icon size="16" color="success" class="mr-1">mdi-star</v-icon>
                <span class="text-caption font-weight-bold text-success text-uppercase">
                  {{ t('trialTasks.preferredVolunteers') }}
                </span>
              </div>
              <v-card
                v-for="v in volunteersWithPreference"
                :key="v.userId"
                variant="tonal"
                color="success"
                class="mb-1"
                :class="{ 'opacity-40': !canSelectMore && !selectedVolunteerIds.includes(v.userId) }"
                @click="toggleSelectVolunteer(v.userId)"
              >
                <div class="d-flex align-center px-3 py-1">
                  <v-checkbox
                    :model-value="selectedVolunteerIds.includes(v.userId)"
                    :disabled="!canSelectMore && !selectedVolunteerIds.includes(v.userId)"
                    hide-details
                    density="compact"
                    color="success"
                    @click.stop
                    @update:model-value="toggleSelectVolunteer(v.userId)"
                  />
                  <v-icon size="14" color="success" class="mr-1">mdi-star</v-icon>
                  <span class="text-body-2 font-weight-medium">{{ v.firstName }} {{ v.surname }}</span>
                </div>
              </v-card>
            </div>

            <div>
              <div v-if="volunteersWithPreference.length" class="d-flex align-center mb-2">
                <span class="text-caption font-weight-bold text-grey text-uppercase">
                  {{ t('trialTasks.otherVolunteers') }}
                </span>
              </div>
              <v-card
                v-for="v in volunteersWithoutPreference"
                :key="v.userId"
                variant="outlined"
                class="mb-1"
                :class="{ 'opacity-40': !canSelectMore && !selectedVolunteerIds.includes(v.userId) }"
                @click="toggleSelectVolunteer(v.userId)"
              >
                <div class="d-flex align-center px-3 py-1">
                  <v-checkbox
                    :model-value="selectedVolunteerIds.includes(v.userId)"
                    :disabled="!canSelectMore && !selectedVolunteerIds.includes(v.userId)"
                    hide-details
                    density="compact"
                    @click.stop
                    @update:model-value="toggleSelectVolunteer(v.userId)"
                  />
                  <span class="text-body-2">{{ v.firstName }} {{ v.surname }}</span>
                </div>
              </v-card>
            </div>
          </template>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isVolunteerDialogOpen = false">{{ t('trialTasks.cancel') }}</v-btn>
          <v-btn
            color="success"
            :loading="isAssigning"
            :disabled="selectedVolunteerIds.length === 0"
            @click="handleAssignVolunteers"
          >
            {{ t('trialTasks.assign') }} ({{ selectedVolunteerIds.length }})
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

    <v-dialog v-model="isVolunteerListDialogOpen" max-width="500" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-account-group" class="mr-2" />
          {{ t('trialTasks.viewVolunteers') }} — {{ volunteerListTask?.title }}
        </v-card-title>
        <v-card-text style="max-height: 60vh">
          <v-alert
            v-if="!getAssignmentsForTask(volunteerListTask?.id ?? 0).length"
            type="info"
            variant="tonal"
          >
            {{ t('trialTasks.noAssignmentsYet') }}
          </v-alert>
          <template v-else>
            <div
              v-if="getAssignmentsForTask(volunteerListTask?.id ?? 0).filter(a => a.status === 'ACCEPTED').length"
              class="mb-4"
            >
              <div class="d-flex align-center gap-1 mb-2">
                <v-icon size="16" color="success">mdi-check-circle</v-icon>
                <span class="text-caption font-weight-bold text-success text-uppercase">{{ t('trialTasks.volunteersAccepted') }}</span>
              </div>
              <v-chip
                v-for="a in getAssignmentsForTask(volunteerListTask?.id ?? 0).filter(a => a.status === 'ACCEPTED')"
                :key="a.id"
                color="success"
                variant="tonal"
                size="small"
                class="mr-1 mb-1"
                prepend-icon="mdi-account"
              >
                {{ getVolunteerName(a.volunteerId) }}
              </v-chip>
            </div>
            <div
              v-if="getAssignmentsForTask(volunteerListTask?.id ?? 0).filter(a => a.status === 'PENDING').length"
              class="mb-4"
            >
              <div class="d-flex align-center gap-1 mb-2">
                <v-icon size="16" color="warning">mdi-clock-outline</v-icon>
                <span class="text-caption font-weight-bold text-warning text-uppercase">{{ t('trialTasks.volunteersPending') }}</span>
              </div>
              <v-chip
                v-for="a in getAssignmentsForTask(volunteerListTask?.id ?? 0).filter(a => a.status === 'PENDING')"
                :key="a.id"
                color="warning"
                variant="tonal"
                size="small"
                class="mr-1 mb-1"
                prepend-icon="mdi-account"
              >
                {{ getVolunteerName(a.volunteerId) }}
              </v-chip>
            </div>
            <div
              v-if="getAssignmentsForTask(volunteerListTask?.id ?? 0).filter(a => a.status === 'REFUSED').length"
              class="mb-4"
            >
              <div class="d-flex align-center gap-1 mb-2">
                <v-icon size="16" color="error">mdi-close-circle</v-icon>
                <span class="text-caption font-weight-bold text-error text-uppercase">{{ t('trialTasks.volunteersRefused') }}</span>
              </div>
              <v-chip
                v-for="a in getAssignmentsForTask(volunteerListTask?.id ?? 0).filter(a => a.status === 'REFUSED')"
                :key="a.id"
                color="error"
                variant="tonal"
                size="small"
                class="mr-1 mb-1"
                prepend-icon="mdi-account"
              >
                {{ getVolunteerName(a.volunteerId) }}
              </v-chip>
            </div>
          </template>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isVolunteerListDialogOpen = false">{{ t('trialTasks.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import volunteerService, { type VolunteerTask, type TaskType, type VolunteerAssignmentResponse, type VolunteerAssignment } from '@/services/volunteerService'
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
const isVolunteerListDialogOpen = ref(false)
const isLoadingVolunteerPreferences = ref(false)
const selectedTask = ref<VolunteerTask | null>(null)
const selectedVolunteerIds = ref<number[]>([])
const volunteerWithPreferences = ref<VolunteerAssignmentResponse[]>([])
const volunteerListTask = ref<VolunteerTask | null>(null)
const taskAssignmentsMap = ref<Map<number, VolunteerAssignment[]>>(new Map())

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

const getAssignmentsForTask = (taskId: number): VolunteerAssignment[] =>
  taskAssignmentsMap.value.get(taskId) ?? []

const getVolunteerName = (volunteerId: number): string => {
  const v = volunteers.value.find((u) => u.userId === volunteerId)
  return v ? `${v.firstName} ${v.surname}` : `#${volunteerId}`
}

const currentTaskAssignments = computed(() => {
  if (!selectedTask.value) return []
  return getAssignmentsForTask(selectedTask.value.id)
})

const activeAssignedVolunteerIds = computed(() =>
  new Set(currentTaskAssignments.value.filter((a) => a.status !== 'REFUSED').map((a) => a.volunteerId))
)

const usedSlots = computed(() => {
  if (!selectedTask.value) return 0
  return currentTaskAssignments.value.filter((a) => a.status !== 'REFUSED').length
})

const remainingSlots = computed(() =>
  selectedTask.value
    ? Math.max(0, selectedTask.value.maxVolunteers - usedSlots.value - selectedVolunteerIds.value.length)
    : 0
)

const canSelectMore = computed(() => remainingSlots.value > 0)

const volunteersWithPreference = computed(() => {
  const prefIds = new Set(
    volunteerWithPreferences.value.filter((p) => p.hasPreference).map((p) => p.volunteerId)
  )
  return volunteers.value.filter((v) => prefIds.has(v.userId) && !activeAssignedVolunteerIds.value.has(v.userId))
})

const volunteersWithoutPreference = computed(() => {
  const availableIds = new Set(volunteerWithPreferences.value.map((p) => p.volunteerId))
  const prefIds = new Set(
    volunteerWithPreferences.value.filter((p) => p.hasPreference).map((p) => p.volunteerId)
  )
  return volunteers.value.filter(
    (v) => availableIds.has(v.userId) && !prefIds.has(v.userId) && !activeAssignedVolunteerIds.value.has(v.userId)
  )
})

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
    taskForm.value.startTime = loaded.trialStartDate?.split('T')[1]?.substring(0, 5) || '09:00'
    taskForm.value.endTime = loaded.trialEndDate?.split('T')[1]?.substring(0, 5) || '17:00'
  } catch (error) {
    console.error('Error loading trial data:', error)
    trialInfo.value = { name: `Trial #${trialId.value}` }
  }
}

const loadAssignmentsForTask = async (taskId: number) => {
  try {
    const data = await volunteerService.getAssignmentsByTask(taskId)
    const newMap = new Map(taskAssignmentsMap.value)
    newMap.set(taskId, data)
    taskAssignmentsMap.value = newMap
  } catch { /* silent */ }
}

const loadAllTaskAssignments = async () => {
  await Promise.all(tasks.value.map((task) => loadAssignmentsForTask(task.id)))
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
      startTime: trial.value?.trialStartDate?.split('T')[1]?.substring(0, 5) || '09:00',
      endDate: trial.value?.trialEndDate?.split('T')[0] || '',
      endTime: trial.value?.trialEndDate?.split('T')[1]?.substring(0, 5) || '17:00',
    }
    taskFormRef.value?.resetValidation()
  } catch (error) {
    console.error('Error creating task:', error)
    errorMessage.value = t('trialTasks.createError')
  } finally {
    isSubmitting.value = false
  }
}

const openVolunteerListDialog = (task: VolunteerTask) => {
  volunteerListTask.value = task
  isVolunteerListDialogOpen.value = true
}

const openVolunteerDialog = async (task: VolunteerTask) => {
  selectedTask.value = task
  selectedVolunteerIds.value = []
  volunteerWithPreferences.value = []
  isVolunteerDialogOpen.value = true

  if (volunteers.value.length === 0) return
  isLoadingVolunteerPreferences.value = true
  try {
    const ids = volunteers.value.map((v) => v.userId)
    const [prefData] = await Promise.all([
      volunteerService.getAvailableVolunteersWithPreference(task.id, ids),
      loadAssignmentsForTask(task.id),
    ])
    volunteerWithPreferences.value = prefData
  } catch {
    // non-bloquant
  } finally {
    isLoadingVolunteerPreferences.value = false
  }
}

const toggleSelectVolunteer = (userId: number) => {
  if (activeAssignedVolunteerIds.value.has(userId)) return
  const idx = selectedVolunteerIds.value.indexOf(userId)
  if (idx === -1) {
    if (!canSelectMore.value) return
    selectedVolunteerIds.value.push(userId)
  } else {
    selectedVolunteerIds.value.splice(idx, 1)
  }
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

const handleAssignVolunteers = async () => {
  if (!selectedTask.value || selectedVolunteerIds.value.length === 0) {
    errorMessage.value = t('trialTasks.selectVolunteersError')
    return
  }

  isAssigning.value = true
  errorMessage.value = ''
  successMessage.value = ''

  let successCount = 0
  const errors: string[] = []
  const idsToProcess = [...selectedVolunteerIds.value]

  for (const volunteerId of idsToProcess) {
    try {
      await volunteerService.createAssignment({ volunteerId, taskId: selectedTask.value.id })
      successCount++
    } catch (error: unknown) {
      const body = (error as { response?: { data?: unknown } })?.response?.data
      const bodyObj = body as Record<string, unknown> | null | undefined
      const msg = typeof body === 'string' ? body : (typeof bodyObj?.message === 'string' ? bodyObj.message : '')
      const name = getVolunteerName(volunteerId)
      if (msg.includes('already has another task')) {
        errors.push(`${name} : ${t('trialTasks.errorTimeslotConflict')}`)
      } else if (msg.includes('Assignment already exists')) {
        errors.push(`${name} : ${t('trialTasks.errorAlreadyAssigned')}`)
      } else {
        errors.push(`${name} : ${t('trialTasks.assignError')}`)
      }
    }
  }

  if (successCount > 0) {
    await loadAssignmentsForTask(selectedTask.value.id)
    successMessage.value = t('trialTasks.partialAssignSuccess', { success: successCount, total: idsToProcess.length })
  }
  if (errors.length) {
    errorMessage.value = errors.join('\n')
  }
  selectedVolunteerIds.value = []
  isAssigning.value = false
  if (!errors.length) {
    isVolunteerDialogOpen.value = false
    selectedTask.value = null
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

const goBack = () => {
  router.back()
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([loadTasks(), loadTaskTypes(), loadVolunteers(), loadTrialData()])
    await loadAllTaskAssignments()
  } finally {
    isLoading.value = false
  }
})
</script> {
    isSavingTask.value = false
  }
}
