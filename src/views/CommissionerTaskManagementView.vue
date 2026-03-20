<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold">{{ t('commissionerTasks.title') }}</h2>
        <p class="text-body-2 text-grey-darken-1">{{ t('commissionerTasks.subtitle') }}</p>
      </div>
      <v-btn variant="text" to="/referee">
        <v-icon icon="mdi-arrow-left" class="mr-1" />
        {{ t('commissioner.backToDashboard') }}
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4" closable @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>

    <v-card variant="outlined" class="pa-4 mb-6">
      <div class="d-flex align-center mb-4">
        <v-icon icon="mdi-plus-circle-outline" class="mr-2" color="primary" />
        <div class="text-h6 font-weight-medium">{{ t('commissionerTasks.createTaskType') }}</div>
      </div>

      <v-form ref="taskTypeFormRef" @submit.prevent="handleCreateTaskType">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="taskTypeForm.name"
              :label="t('commissionerTasks.taskTypeName')"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="taskTypeForm.description"
              :label="t('commissionerTasks.taskTypeDescription')"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              color="success"
              type="submit"
              :loading="isSubmitting"
              block
              prepend-icon="mdi-plus"
              height="48"
            >
              {{ t('commissionerTasks.create') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>

    <v-card variant="outlined" class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-h6 font-weight-medium">
          <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
          {{ t('commissionerTasks.existingTaskTypes') }}
        </div>
        <v-chip color="primary" variant="tonal" size="small">{{ taskTypes.length }}</v-chip>
      </div>

      <v-skeleton-loader v-if="isLoading" type="list-item@3" />

      <v-alert v-else-if="taskTypes.length === 0" type="info" variant="tonal">
        {{ t('commissionerTasks.noTaskTypes') }}
      </v-alert>

      <v-list v-else lines="two" density="comfortable">
        <v-list-item
          v-for="taskType in taskTypes"
          :key="taskType.id"
          class="rounded-lg mb-2"
          variant="tonal"
        >
          <template #prepend>
            <v-avatar color="primary" variant="tonal">
              <v-icon icon="mdi-tag" />
            </v-avatar>
          </template>

          <template #title>
            <span class="font-weight-medium">{{ taskType.name }}</span>
          </template>

          <template #subtitle>
            <span class="text-grey-darken-2">{{ taskType.description }}</span>
          </template>

          <template #append>
            <div class="d-flex align-center gap-2">
              <v-chip size="small" variant="outlined" prepend-icon="mdi-identifier">
                ID: {{ taskType.id }}
              </v-chip>
              <v-btn
                size="small"
                icon="mdi-pencil"
                variant="text"
                color="primary"
                @click="openEditDialog(taskType)"
              />
              <v-btn
                size="small"
                icon="mdi-delete"
                variant="text"
                color="error"
                @click="openDeleteDialog(taskType)"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
    <v-dialog v-model="isEditDialogOpen" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-pencil" class="mr-2" />
          {{ t('commissionerTasks.editTaskType') }}
        </v-card-title>
        <v-card-text>
          <v-form ref="editFormRef">
            <v-text-field
              v-model="editForm.name"
              :label="t('commissionerTasks.taskTypeName')"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              required
            />
            <v-text-field
              v-model="editForm.description"
              :label="t('commissionerTasks.taskTypeDescription')"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isEditDialogOpen = false">
            {{ t('commissionerTasks.cancel') }}
          </v-btn>
          <v-btn color="primary" :loading="isUpdating" @click="handleUpdateTaskType">
            {{ t('commissionerTasks.updateTaskType') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="isDeleteDialogOpen" max-width="500">
      <v-card>
        <v-card-title class="text-error">
          <v-icon icon="mdi-alert-circle" class="mr-2" />
          {{ t('commissionerTasks.deleteConfirm') }}
        </v-card-title>
        <v-card-text>
          <p>{{ t('commissionerTasks.deleteConfirmText', { name: taskTypeToDelete?.name || '' }) }}</p>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isDeleteDialogOpen = false">
            {{ t('commissionerTasks.cancel') }}
          </v-btn>
          <v-btn color="error" :loading="isDeleting" @click="handleDeleteTaskType">
            {{ t('commissionerTasks.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card variant="outlined" class="pa-4 mt-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-h6 font-weight-medium">{{ t('commissionerTasks.boardTitle') }}</div>
          <div class="text-body-2 text-grey-darken-1">{{ t('commissionerTasks.boardSubtitle') }}</div>
        </div>
        <v-btn size="small" variant="tonal" prepend-icon="mdi-refresh" @click="loadBoard">{{ t('commissionerTasks.boardRefresh') }}</v-btn>
      </div>

      <v-alert v-if="boardError" type="error" variant="tonal" density="compact" class="mb-3">
        {{ boardError }}
      </v-alert>

      <div v-if="boardLoading" class="d-flex justify-center py-6">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <v-row v-else dense>
        <v-col cols="12" md="4">
          <div class="d-flex align-center gap-1 mb-2">
            <v-icon size="16" color="grey-darken-1">mdi-account-question</v-icon>
            <span class="text-caption font-weight-bold text-uppercase text-grey-darken-2">{{ t('commissionerTasks.boardColumnIncomplete') }}</span>
            <v-chip size="x-small" color="grey" label class="ml-1">{{ columnIncomplete.length }}</v-chip>
          </div>
          <v-alert v-if="!columnIncomplete.length" type="info" variant="tonal" density="compact">{{ t('commissionerTasks.boardNoTasks') }}</v-alert>
          <v-card
            v-for="bt in columnIncomplete"
            :key="bt.task.id"
            variant="outlined"
            rounded="lg"
            class="mb-2 pa-3"
            border="grey-lighten-2"
          >
            <div class="d-flex align-start justify-space-between mb-1">
              <div class="text-caption text-grey-darken-1">
                <v-icon size="12" class="mr-1">mdi-flag-checkered</v-icon>{{ getTrialName(bt.task.targetId) }}
              </div>
              <v-btn size="x-small" variant="text" color="info" icon="mdi-format-list-bulleted" @click="openBoardListDialog(bt)" />
            </div>
            <div class="text-subtitle-2 font-weight-bold mb-1">{{ bt.task.title }}</div>
            <v-chip size="x-small" color="primary" variant="tonal" class="mb-2">{{ getTaskTypeName(bt.task.taskTypeId) }}</v-chip>
            <div class="d-flex gap-2 text-caption text-grey-darken-2 mb-2">
              <span><v-icon size="12" color="success">mdi-check-circle</v-icon> {{ bt.accepted }}/{{ bt.task.maxVolunteers }}</span>
              <span v-if="bt.refused"><v-icon size="12" color="error">mdi-close-circle</v-icon> {{ bt.refused }}</span>
            </div>
            <v-btn size="x-small" variant="tonal" color="primary" prepend-icon="mdi-arrow-right" :to="{ name: 'trial-tasks', params: { id: bt.task.targetId } }">
              {{ t('commissionerTasks.boardManageTrial') }}
            </v-btn>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <div class="d-flex align-center gap-1 mb-2">
            <v-icon size="16" color="warning">mdi-clock-outline</v-icon>
            <span class="text-caption font-weight-bold text-uppercase text-warning">{{ t('commissionerTasks.boardColumnPending') }}</span>
            <v-chip size="x-small" color="warning" label class="ml-1">{{ columnPending.length }}</v-chip>
          </div>
          <v-alert v-if="!columnPending.length" type="info" variant="tonal" density="compact">{{ t('commissionerTasks.boardNoTasks') }}</v-alert>
          <v-card
            v-for="bt in columnPending"
            :key="bt.task.id"
            variant="outlined"
            rounded="lg"
            class="mb-2 pa-3"
            border="warning"
          >
            <div class="d-flex align-start justify-space-between mb-1">
              <div class="text-caption text-grey-darken-1">
                <v-icon size="12" class="mr-1">mdi-flag-checkered</v-icon>{{ getTrialName(bt.task.targetId) }}
              </div>
              <v-btn size="x-small" variant="text" color="info" icon="mdi-format-list-bulleted" @click="openBoardListDialog(bt)" />
            </div>
            <div class="text-subtitle-2 font-weight-bold mb-1">{{ bt.task.title }}</div>
            <v-chip size="x-small" color="primary" variant="tonal" class="mb-2">{{ getTaskTypeName(bt.task.taskTypeId) }}</v-chip>
            <div class="d-flex gap-2 text-caption text-grey-darken-2 mb-2">
              <span><v-icon size="12" color="warning">mdi-clock-outline</v-icon> {{ bt.pending }} en attente</span>
              <span><v-icon size="12" color="success">mdi-check-circle</v-icon> {{ bt.accepted }}/{{ bt.task.maxVolunteers }}</span>
            </div>
            <v-btn size="x-small" variant="tonal" color="primary" prepend-icon="mdi-arrow-right" :to="{ name: 'trial-tasks', params: { id: bt.task.targetId } }">
              {{ t('commissionerTasks.boardManageTrial') }}
            </v-btn>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <div class="d-flex align-center gap-1 mb-2">
            <v-icon size="16" color="success">mdi-check-all</v-icon>
            <span class="text-caption font-weight-bold text-uppercase text-success">{{ t('commissionerTasks.boardColumnComplete') }}</span>
            <v-chip size="x-small" color="success" label class="ml-1">{{ columnComplete.length }}</v-chip>
          </div>
          <v-alert v-if="!columnComplete.length" type="info" variant="tonal" density="compact">{{ t('commissionerTasks.boardNoTasks') }}</v-alert>
          <v-card
            v-for="bt in columnComplete"
            :key="bt.task.id"
            variant="outlined"
            rounded="lg"
            class="mb-2 pa-3"
            border="success"
          >
            <div class="d-flex align-start justify-space-between mb-1">
              <div class="text-caption text-grey-darken-1">
                <v-icon size="12" class="mr-1">mdi-flag-checkered</v-icon>{{ getTrialName(bt.task.targetId) }}
              </div>
              <v-btn size="x-small" variant="text" color="info" icon="mdi-format-list-bulleted" @click="openBoardListDialog(bt)" />
            </div>
            <div class="text-subtitle-2 font-weight-bold mb-1">{{ bt.task.title }}</div>
            <v-chip size="x-small" color="primary" variant="tonal" class="mb-2">{{ getTaskTypeName(bt.task.taskTypeId) }}</v-chip>
            <div class="d-flex gap-2 text-caption mb-2">
              <span class="text-success"><v-icon size="12">mdi-check-circle</v-icon> {{ bt.accepted }}/{{ bt.task.maxVolunteers }} confirmés</span>
            </div>
            <v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-arrow-right" :to="{ name: 'trial-tasks', params: { id: bt.task.targetId } }">
              {{ t('commissionerTasks.boardManageTrial') }}
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-dialog v-model="isBoardListDialogOpen" max-width="500" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-account-group" class="mr-2" />
          {{ t('trialTasks.viewVolunteers') }} — {{ boardListTask?.task.title }}
        </v-card-title>
        <v-card-text style="max-height: 60vh">
          <v-alert
            v-if="!getBoardAssignments(boardListTask?.task.id ?? 0).length"
            type="info"
            variant="tonal"
          >
            {{ t('trialTasks.noAssignmentsYet') }}
          </v-alert>
          <template v-else>
            <div
              v-if="getBoardAssignments(boardListTask?.task.id ?? 0).filter(a => a.status === 'ACCEPTED').length"
              class="mb-4"
            >
              <div class="d-flex align-center gap-1 mb-2">
                <v-icon size="16" color="success">mdi-check-circle</v-icon>
                <span class="text-caption font-weight-bold text-success text-uppercase">{{ t('trialTasks.volunteersAccepted') }}</span>
              </div>
              <v-chip
                v-for="a in getBoardAssignments(boardListTask?.task.id ?? 0).filter(a => a.status === 'ACCEPTED')"
                :key="a.id"
                color="success"
                variant="tonal"
                size="small"
                class="mr-1 mb-1"
                prepend-icon="mdi-account"
              >
                {{ getBoardVolunteerName(a.volunteerId) }}
              </v-chip>
            </div>
            <div
              v-if="getBoardAssignments(boardListTask?.task.id ?? 0).filter(a => a.status === 'PENDING').length"
              class="mb-4"
            >
              <div class="d-flex align-center gap-1 mb-2">
                <v-icon size="16" color="warning">mdi-clock-outline</v-icon>
                <span class="text-caption font-weight-bold text-warning text-uppercase">{{ t('trialTasks.volunteersPending') }}</span>
              </div>
              <v-chip
                v-for="a in getBoardAssignments(boardListTask?.task.id ?? 0).filter(a => a.status === 'PENDING')"
                :key="a.id"
                color="warning"
                variant="tonal"
                size="small"
                class="mr-1 mb-1"
                prepend-icon="mdi-account"
              >
                {{ getBoardVolunteerName(a.volunteerId) }}
              </v-chip>
            </div>
            <div
              v-if="getBoardAssignments(boardListTask?.task.id ?? 0).filter(a => a.status === 'REFUSED').length"
              class="mb-4"
            >
              <div class="d-flex align-center gap-1 mb-2">
                <v-icon size="16" color="error">mdi-close-circle</v-icon>
                <span class="text-caption font-weight-bold text-error text-uppercase">{{ t('trialTasks.volunteersRefused') }}</span>
              </div>
              <v-chip
                v-for="a in getBoardAssignments(boardListTask?.task.id ?? 0).filter(a => a.status === 'REFUSED')"
                :key="a.id"
                color="error"
                variant="tonal"
                size="small"
                class="mr-1 mb-1"
                prepend-icon="mdi-account"
              >
                {{ getBoardVolunteerName(a.volunteerId) }}
              </v-chip>
            </div>
          </template>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isBoardListDialogOpen = false">{{ t('commissionerTasks.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import volunteerService, { type TaskType, type VolunteerTask, type VolunteerAssignment } from '@/services/volunteerService'
import championshipService from '@/services/championshipService'
import userService from '@/services/userService'
import { UserRole } from '@/types/user'
import type { User } from '@/types/user'

const { t } = useI18n()

const taskTypeFormRef = ref()
const editFormRef = ref()
const taskTypes = ref<TaskType[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const taskTypeForm = ref({
  name: '',
  description: '',
})

const isEditDialogOpen = ref(false)
const editForm = ref({
  id: 0,
  name: '',
  description: '',
})

const isDeleteDialogOpen = ref(false)
const taskTypeToDelete = ref<TaskType | null>(null)

interface BoardTask {
  task: VolunteerTask
  accepted: number
  pending: number
  refused: number
}
const boardLoading = ref(false)
const boardTasks = ref<BoardTask[]>([])
const boardError = ref('')
const trialNamesMap = ref<Map<number, string>>(new Map())
const competitionNamesMap = ref<Map<number, string>>(new Map())
const isBoardListDialogOpen = ref(false)
const boardListTask = ref<BoardTask | null>(null)
const boardVolunteers = ref<User[]>([])
const boardAssignmentsMap = ref<Map<number, VolunteerAssignment[]>>(new Map())

const getBoardAssignments = (taskId: number) => boardAssignmentsMap.value.get(taskId) ?? []
const getBoardVolunteerName = (volunteerId: number): string => {
  const v = boardVolunteers.value.find((u) => u.userId === volunteerId)
  return v ? `${v.firstName} ${v.surname}` : `#${volunteerId}`
}
const openBoardListDialog = (bt: BoardTask) => {
  boardListTask.value = bt
  isBoardListDialogOpen.value = true
}

const getTrialName = (trialId: number) => {
  const trialName = trialNamesMap.value.get(trialId) ?? `#${trialId}`
  const compName = competitionNamesMap.value.get(trialId)
  return compName ? `${compName} : ${trialName}` : trialName
}

const columnIncomplete = computed(() =>
  boardTasks.value.filter((bt) => bt.accepted === 0 && bt.pending === 0)
)
const columnPending = computed(() =>
  boardTasks.value.filter((bt) => bt.pending > 0 && bt.accepted === 0)
)
const columnComplete = computed(() =>
  boardTasks.value.filter((bt) => bt.accepted > 0)
)

const getTaskTypeName = (id: number) => taskTypes.value.find((t) => t.id === id)?.name ?? `#${id}`

const loadBoard = async () => {
  boardLoading.value = true
  boardError.value = ''
  try {
    const [allTasks, pendingAssigns, acceptedAssigns, refusedAssigns] = await Promise.all([
      volunteerService.getAllTasks(),
      volunteerService.getAssignmentsByStatus('PENDING'),
      volunteerService.getAssignmentsByStatus('ACCEPTED'),
      volunteerService.getAssignmentsByStatus('REFUSED'),
    ])
    const trialTasks = allTasks.filter((t) => t.targetType === 'TRIAL')
    const statusMap = new Map<number, { pending: number; accepted: number; refused: number }>()
    trialTasks.forEach((t) => statusMap.set(t.id, { pending: 0, accepted: 0, refused: 0 }))
    for (const a of pendingAssigns) { const s = statusMap.get(a.taskId); if (s) s.pending++ }
    for (const a of acceptedAssigns) { const s = statusMap.get(a.taskId); if (s) s.accepted++ }
    for (const a of refusedAssigns) { const s = statusMap.get(a.taskId); if (s) s.refused++ }
    boardTasks.value = trialTasks.map((task) => ({
      task,
      ...(statusMap.get(task.id) ?? { pending: 0, accepted: 0, refused: 0 }),
    }))
    // Charger les attributions
    const allAssigns = [...pendingAssigns, ...acceptedAssigns, ...refusedAssigns]
    const aMap = new Map<number, VolunteerAssignment[]>()
    for (const a of allAssigns) {
      if (!aMap.has(a.taskId)) aMap.set(a.taskId, [])
      aMap.get(a.taskId)!.push(a)
    }
    boardAssignmentsMap.value = aMap
    // Charger les volontaires pour afficher les noms
    try {
      const allUsers = await userService.getUsers()
      boardVolunteers.value = allUsers.filter((u) => u.role.name === UserRole.VOLUNTEER)
    } catch { /* noms non disponibles */ }
    // Charger les noms des épreuves
    const uniqueTrialIds = [...new Set(trialTasks.map((t) => t.targetId))]
    const trialResults = await Promise.all(
      uniqueTrialIds.map((id) => championshipService.getTrialById(id).catch(() => null))
    )
    const namesMap = new Map<number, string>()
    trialResults.forEach((trial) => { if (trial) namesMap.set(trial.trialId, trial.trialName) })
    trialNamesMap.value = namesMap
    // Charger les noms des compétitions
    const uniqueCompIds = [...new Set(trialResults.filter(Boolean).map((t) => t!.competitionId))]
    const compResults = await Promise.all(
      uniqueCompIds.map((id) => championshipService.getCompetitionById(id).catch(() => null))
    )
    const compNamesMap = new Map<number, string>()
    trialResults.forEach((trial) => {
      if (!trial) return
      const comp = compResults.find((c) => c?.competitionId === trial.competitionId)
      if (comp) compNamesMap.set(trial.trialId, comp.competitionName)
    })
    competitionNamesMap.value = compNamesMap
  } catch {
    boardError.value = t('commissionerTasks.boardLoadError')
  } finally {
    boardLoading.value = false
  }
}

const loadTaskTypes = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    taskTypes.value = await volunteerService.getTaskTypes()
  } catch (error) {
    console.error('Error loading task types:', error)
    errorMessage.value = t('commissionerTasks.loadError')
  } finally {
    isLoading.value = false
  }
}

const handleCreateTaskType = async () => {
  if (!taskTypeForm.value.name.trim() || !taskTypeForm.value.description.trim()) {
    errorMessage.value = t('validation.requiredField')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const newTaskType = await volunteerService.createTaskType({
      name: taskTypeForm.value.name.trim(),
      description: taskTypeForm.value.description.trim(),
    })

    taskTypes.value.unshift(newTaskType)
    successMessage.value = t('commissionerTasks.createSuccess')

    // Reset form
    taskTypeForm.value = { name: '', description: '' }
    taskTypeFormRef.value?.resetValidation()
  } catch (error) {
    console.error('Error creating task type:', error)
    errorMessage.value = t('commissionerTasks.createError')
  } finally {
    isSubmitting.value = false
  }
}

const openEditDialog = (taskType: TaskType) => {
  editForm.value = {
    id: taskType.id,
    name: taskType.name,
    description: taskType.description,
  }
  isEditDialogOpen.value = true
}

const handleUpdateTaskType = async () => {
  if (!editForm.value.name.trim() || !editForm.value.description.trim()) {
    errorMessage.value = t('validation.requiredField')
    return
  }

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const updatedTaskType = await volunteerService.updateTaskType(editForm.value.id, {
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim(),
    })

    const index = taskTypes.value.findIndex((t) => t.id === editForm.value.id)
    if (index !== -1) {
      taskTypes.value[index] = updatedTaskType
    }

    successMessage.value = t('commissionerTasks.updateSuccess')
    isEditDialogOpen.value = false
  } catch (error) {
    console.error('Error updating task type:', error)
    errorMessage.value = t('commissionerTasks.updateError')
  } finally {
    isUpdating.value = false
  }
}

const openDeleteDialog = (taskType: TaskType) => {
  taskTypeToDelete.value = taskType
  isDeleteDialogOpen.value = true
}

const handleDeleteTaskType = async () => {
  if (!taskTypeToDelete.value) return

  isDeleting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await volunteerService.deleteTaskType(taskTypeToDelete.value.id)

    taskTypes.value = taskTypes.value.filter((t) => t.id !== taskTypeToDelete.value?.id)
    successMessage.value = t('commissionerTasks.deleteSuccess')
    isDeleteDialogOpen.value = false
    taskTypeToDelete.value = null
  } catch (error) {
    console.error('Error deleting task type:', error)
    errorMessage.value = t('commissionerTasks.deleteError')
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  loadTaskTypes()
  loadBoard()
})
</script>

