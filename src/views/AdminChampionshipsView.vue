<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-trophy" size="32" color="primary" class="mr-2" />
        <h2 class="text-h5 font-weight-bold">{{ t('admin.championshipsSection') }}</h2>
      </div>
    </div>

    <v-alert type="info" variant="tonal" class="mb-4">
      {{ t('admin.championshipsFormInfo') }}
    </v-alert>

    <v-row align="stretch" dense>
      <v-col cols="12" md="7">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="text-overline mb-1">{{ t('admin.championshipsCreateTitle') }}</div>
          <div class="text-body-2 text-grey-darken-1 mb-4">
            {{ t('admin.championshipsCreateSubtitle') }}
          </div>

          <v-form ref="championshipFormRef" validate-on="submit" @submit.prevent="handleChampionshipSubmit">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="championshipForm.name"
                  :label="t('admin.championshipNameLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="championshipForm.startDate"
                  type="date"
                  :label="t('admin.championshipStartDateLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.startRecentEnough]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="championshipForm.endDate"
                  type="date"
                  :label="t('admin.championshipEndDateLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.dateOrder]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="championshipForm.status"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.championshipStatusLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                  chips
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="championshipForm.description"
                  :label="t('admin.championshipDescriptionLabel')"
                  variant="outlined"
                  rows="3"
                  density="comfortable"
                  auto-grow
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-2">
              <v-btn color="primary" type="submit" :loading="isChampionshipSubmitting" class="mr-2">
                <v-icon icon="mdi-content-save-outline" class="mr-1" />
                {{ editingChampionshipId ? t('admin.championshipUpdate') : t('admin.championshipSubmit') }}
              </v-btn>
              <v-btn color="secondary" variant="tonal" @click="resetChampionshipForm" :disabled="isChampionshipSubmitting">
                <v-icon icon="mdi-backup-restore" class="mr-1" />
                {{ t('admin.championshipReset') }}
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between mb-2">
            <div>
              <div class="text-overline mb-1">{{ t('admin.championshipPreviewTitle') }}</div>
              <div class="text-caption text-grey-darken-1">
                {{ t('admin.championshipsInfo') }}
              </div>
            </div>
            <v-chip variant="tonal" color="primary" size="small" label>{{ championships.length }}</v-chip>
          </div>

          <div v-if="championships.length === 0" class="text-body-2 text-grey-darken-1">
            {{ t('admin.championshipNoData') }}
          </div>

          <v-list v-else density="compact" lines="two">
            <v-list-item
              v-for="championship in championships"
              :key="championship.id"
              class="rounded-lg mb-1"
              :title="championship.name"
            >
              <template #append>
                <div class="d-flex align-center gap-1">
                  <v-btn icon size="small" variant="text" color="primary" @click="startChampionshipEdit(championship)" class="ma-0">
                    <v-icon icon="mdi-pencil" size="18" />
                  </v-btn>
                  <v-btn icon size="small" variant="text" color="error" @click="confirmDeleteChampionship(championship)" class="ma-0">
                    <v-icon icon="mdi-delete-outline" size="18" />
                  </v-btn>
                  <v-chip :color="statusColor(championship.status)" variant="tonal" size="small" label class="ml-1">
                    {{ t(`admin.competitionStatus.${championship.status}`) }}
                  </v-chip>
                </div>
              </template>
              <template #subtitle>
                <span class="text-caption text-grey-darken-2">
                  {{ formatDateRange(championship.startDate, championship.endDate) }}
                </span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" color="success" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Status } from '@/types/competition'
import championshipService from '@/services/championshipService'

type LocalChampionship = {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: Status
}

const { t } = useI18n()

const championshipFormRef = ref()
const editingChampionshipId = ref<number | null>(null)
const isChampionshipSubmitting = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const isLoading = ref(false)

const championships = ref<LocalChampionship[]>([])

const championshipForm = reactive({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: Status.PLANNED,
})

const statusOptions = computed(() =>
  Object.values(Status).map((status) => ({
    title: t(`admin.competitionStatus.${status}`),
    value: status,
  })),
)

const rules = {
  required: (value: unknown) => {
    if (value === null || value === undefined) return t('validation.requiredField')
    if (typeof value === 'string' && value.trim().length === 0) return t('validation.requiredField')
    return true
  },
  startRecentEnough: () => {
    if (!championshipForm.startDate) return true
    const start = new Date(championshipForm.startDate)
    const limit = new Date()
    limit.setHours(0, 0, 0, 0)
    limit.setMonth(limit.getMonth() - 6)
    return start >= limit || t('admin.championshipStartTooOld')
  },
  dateOrder: () => {
    if (!championshipForm.startDate || !championshipForm.endDate) return true
    const start = new Date(championshipForm.startDate)
    const end = new Date(championshipForm.endDate)
    return start <= end || t('admin.championshipDateOrderError')
  },
}

const statusColor = (status: Status) => {
  if (status === Status.PLANNED) return 'grey'
  if (status === Status.ONGOING) return 'primary'
  if (status === Status.COMPLETED) return 'success'
  if (status === Status.CANCELLED) return 'error'
  return 'primary'
}

const formatDateRange = (startDate: string, endDate: string) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }
  return `${formatDate(startDate)} → ${formatDate(endDate)}`
}

// Load championships on mount
onMounted(async () => {
  console.log('AdminChampionshipsView mounted')
  isLoading.value = true
  try {
    const data = await championshipService.getAllChampionships()
    console.log('Championships loaded:', data)
    championships.value = data
  } catch (error) {
    console.error('Error loading championships:', error)
    snackbarMessage.value = 'Erreur lors du chargement des championnats'
    snackbar.value = true
  } finally {
    isLoading.value = false
  }
})

const resetChampionshipForm = () => {
  championshipForm.name = ''
  championshipForm.description = ''
  championshipForm.startDate = ''
  championshipForm.endDate = ''
  championshipForm.status = Status.PLANNED
  editingChampionshipId.value = null
  nextTick(() => championshipFormRef.value?.resetValidation())
}

const handleChampionshipSubmit = async () => {
  console.log('handleChampionshipSubmit called')
  const result = await championshipFormRef.value?.validate()
  console.log('Validation result:', result)
  if (!result?.valid) {
    console.log('Validation failed')
    return
  }

  isChampionshipSubmitting.value = true
  console.log('Form data:', championshipForm)

  try {
    if (editingChampionshipId.value) {
      console.log('Updating championship:', editingChampionshipId.value)
      await championshipService.updateChampionship(editingChampionshipId.value, {
        name: championshipForm.name.trim(),
        description: championshipForm.description?.trim() || '',
        startDate: championshipForm.startDate,
        endDate: championshipForm.endDate,
        status: championshipForm.status,
      } as any)
      snackbarMessage.value = t('admin.championshipUpdateSuccess')
    } else {
      console.log('Creating championship')
      await championshipService.createChampionship({
        name: championshipForm.name.trim(),
        description: championshipForm.description?.trim() || '',
        startDate: championshipForm.startDate,
        endDate: championshipForm.endDate,
        status: championshipForm.status,
      } as any)
      snackbarMessage.value = t('admin.championshipSuccess')
    }

    // Reload championships
    console.log('Reloading championships')
    const data = await championshipService.getAllChampionships()
    championships.value = data
    snackbar.value = true
    resetChampionshipForm()
  } catch (error) {
    console.error('Error saving championship:', error)
    snackbarMessage.value = 'Erreur lors de l\'enregistrement'
    snackbar.value = true
  } finally {
    isChampionshipSubmitting.value = false
  }
}

const startChampionshipEdit = (championship: LocalChampionship) => {
  editingChampionshipId.value = championship.id
  championshipForm.name = championship.name
  championshipForm.description = championship.description
  championshipForm.startDate = championship.startDate
  championshipForm.endDate = championship.endDate
  championshipForm.status = championship.status
  nextTick(() => championshipFormRef.value?.resetValidation())
}

const confirmDeleteChampionship = (championship: LocalChampionship) => {
  const confirmed = window.confirm(t('admin.championshipDeleteConfirm', { name: championship.name }))
  if (!confirmed) return
  championships.value = championships.value.filter((c) => c.id !== championship.id)
  if (editingChampionshipId.value === championship.id) {
    resetChampionshipForm()
  }
}
</script>
