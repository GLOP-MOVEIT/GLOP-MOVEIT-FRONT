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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import volunteerService, { type TaskType } from '@/services/volunteerService'

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

onMounted(loadTaskTypes)
</script>

