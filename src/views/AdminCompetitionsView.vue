<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-medal" size="32" color="success" class="mr-2" />
        <h2 class="text-h5 font-weight-bold">{{ t('admin.competitionsSection') }}</h2>
      </div>
    </div>

    <v-row align="stretch" dense>
      <v-col cols="12" md="7">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="text-overline mb-1">{{ t('admin.competitionCreateTitle') }}</div>
          <div class="text-body-2 text-grey-darken-1 mb-4">
            {{ t('admin.competitionCreateSubtitle') }}
          </div>

          <v-form ref="competitionFormRef" validate-on="submit" @submit.prevent="handleCompetitionSubmit">
            <v-row dense>
              <v-col cols="12">
                <v-select
                  v-model="competitionForm.championshipId"
                  :items="championshipOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.competitionChampionshipLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="competitionForm.name"
                  :label="t('admin.competitionNameLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="competitionForm.startDate"
                  type="date"
                  :label="t('admin.competitionStartDateLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.competitionDateOrder, rules.startWithinChampionship]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="competitionForm.endDate"
                  type="date"
                  :label="t('admin.competitionEndDateLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.competitionDateOrder, rules.endWithinChampionship]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="competitionForm.status"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.competitionStatusLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                  chips
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="competitionForm.description"
                  :label="t('admin.competitionDescriptionLabel')"
                  variant="outlined"
                  rows="3"
                  density="comfortable"
                  auto-grow
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-2">
              <v-btn color="success" type="submit" :loading="isCompetitionSubmitting" class="mr-2">
                <v-icon icon="mdi-content-save-outline" class="mr-1" />
                {{ editingCompetitionId ? t('admin.competitionUpdate') : t('admin.competitionSubmit') }}
              </v-btn>
              <v-btn color="secondary" variant="tonal" @click="resetCompetitionForm" :disabled="isCompetitionSubmitting">
                <v-icon icon="mdi-backup-restore" class="mr-1" />
                {{ t('admin.competitionReset') }}
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between mb-2">
            <div>
              <div class="text-overline mb-1">{{ t('admin.competitionPreviewTitle') }}</div>
              <div class="text-caption text-grey-darken-1">
                {{ t('admin.competitionsInfo') }}
              </div>
            </div>
            <v-chip variant="tonal" color="success" size="small" label>{{ competitions.length }}</v-chip>
          </div>

          <div v-if="competitions.length === 0" class="text-body-2 text-grey-darken-1">
            {{ t('admin.competitionNoData') }}
          </div>

          <v-list v-else density="compact" lines="three">
            <v-list-item
              v-for="competition in competitions"
              :key="competition.id"
              class="rounded-lg mb-1"
              :title="competition.name"
            >
              <template #append>
                <div class="d-flex align-center gap-1">
                  <v-btn icon size="small" variant="text" color="success" @click="startCompetitionEdit(competition)" class="ma-0">
                    <v-icon icon="mdi-pencil" size="18" />
                  </v-btn>
                  <v-btn icon size="small" variant="text" color="error" @click="confirmDeleteCompetition(competition)" class="ma-0">
                    <v-icon icon="mdi-delete-outline" size="18" />
                  </v-btn>
                  <v-chip :color="statusColor(competition.status)" variant="tonal" size="small" label class="ml-1">
                    {{ t(`admin.competitionStatus.${competition.status}`) }}
                  </v-chip>
                </div>
              </template>
              <template #subtitle>
                <div class="d-flex flex-column text-caption text-grey-darken-2">
                  <span>{{ getChampionshipName(competition.championshipId) }}</span>
                  <span>{{ formatDateRange(competition.startDate, competition.endDate) }}</span>
                </div>
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
import { computed, nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Status } from '@/types/competition'

type LocalChampionship = {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: Status
}

type LocalCompetition = {
  id: number
  championshipId: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: Status
}

const { t } = useI18n()

const competitionFormRef = ref()
const editingCompetitionId = ref<number | null>(null)
const isCompetitionSubmitting = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')

const championships = ref<LocalChampionship[]>([
  {
    id: 1,
    name: 'JO 2026',
    description: 'Jeux Olympiques 2026',
    startDate: '2026-02-06',
    endDate: '2026-02-22',
    status: Status.PLANNED,
  },
  {
    id: 2,
    name: 'Championnats du Monde 2026',
    description: 'Championnats du Monde athlétisme',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    status: Status.PLANNED,
  },
])

const competitions = ref<LocalCompetition[]>([
  {
    id: 1,
    championshipId: 1,
    name: 'Athlétisme - JO 2026',
    description: 'Épreuves athlétisme',
    startDate: '2026-02-06',
    endDate: '2026-02-12',
    status: Status.PLANNED,
  },
  {
    id: 2,
    championshipId: 1,
    name: 'Natation - JO 2026',
    description: 'Épreuves natation',
    startDate: '2026-02-13',
    endDate: '2026-02-22',
    status: Status.PLANNED,
  },
])

const competitionForm = reactive({
  championshipId: null as number | null,
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

const championshipOptions = computed(() =>
  championships.value.map((champ) => ({
    title: champ.name,
    value: champ.id,
  })),
)

const rules = {
  required: (value: unknown) => {
    if (value === null || value === undefined) return t('validation.requiredField')
    if (typeof value === 'string' && value.trim().length === 0) return t('validation.requiredField')
    return true
  },
  competitionDateOrder: () => {
    if (!competitionForm.startDate || !competitionForm.endDate) return true
    const start = new Date(competitionForm.startDate)
    const end = new Date(competitionForm.endDate)
    return start <= end || t('admin.competitionDateOrderError')
  },
  startWithinChampionship: () => {
    if (!competitionForm.championshipId || !competitionForm.startDate) return true
    const championship = championships.value.find((c) => c.id === competitionForm.championshipId)
    if (!championship) return true
    const start = new Date(competitionForm.startDate)
    const champStart = new Date(championship.startDate)
    return start >= champStart || t('admin.competitionStartBeforeChampionship', { date: championship.startDate })
  },
  endWithinChampionship: () => {
    if (!competitionForm.championshipId || !competitionForm.endDate) return true
    const championship = championships.value.find((c) => c.id === competitionForm.championshipId)
    if (!championship) return true
    const end = new Date(competitionForm.endDate)
    const champEnd = new Date(championship.endDate)
    return end <= champEnd || t('admin.competitionEndAfterChampionship', { date: championship.endDate })
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
  return `${startDate} → ${endDate}`
}

const getChampionshipName = (championshipId: number) => {
  return championships.value.find((c) => c.id === championshipId)?.name || 'N/A'
}

const resetCompetitionForm = () => {
  competitionForm.championshipId = null
  competitionForm.name = ''
  competitionForm.description = ''
  competitionForm.startDate = ''
  competitionForm.endDate = ''
  competitionForm.status = Status.PLANNED
  editingCompetitionId.value = null
  nextTick(() => competitionFormRef.value?.resetValidation())
}

const handleCompetitionSubmit = async () => {
  const result = await competitionFormRef.value?.validate()
  if (!result?.valid) return

  isCompetitionSubmitting.value = true

  if (editingCompetitionId.value) {
    competitions.value = competitions.value.map((c) =>
      c.id === editingCompetitionId.value
        ? {
            ...c,
            championshipId: competitionForm.championshipId!,
            name: competitionForm.name.trim(),
            description: competitionForm.description?.trim() || '',
            startDate: competitionForm.startDate,
            endDate: competitionForm.endDate,
            status: competitionForm.status,
          }
        : c,
    )
    snackbarMessage.value = t('admin.competitionUpdateSuccess')
  } else {
    const id = Math.max(...competitions.value.map((c) => c.id), 0) + 1
    const newCompetition: LocalCompetition = {
      id,
      championshipId: competitionForm.championshipId!,
      name: competitionForm.name.trim(),
      description: competitionForm.description?.trim() || '',
      startDate: competitionForm.startDate,
      endDate: competitionForm.endDate,
      status: competitionForm.status,
    }
    competitions.value = [newCompetition, ...competitions.value]
    snackbarMessage.value = t('admin.competitionSuccess')
  }

  snackbar.value = true
  resetCompetitionForm()
  isCompetitionSubmitting.value = false
}

const startCompetitionEdit = (competition: LocalCompetition) => {
  editingCompetitionId.value = competition.id
  competitionForm.championshipId = competition.championshipId
  competitionForm.name = competition.name
  competitionForm.description = competition.description
  competitionForm.startDate = competition.startDate
  competitionForm.endDate = competition.endDate
  competitionForm.status = competition.status
  nextTick(() => competitionFormRef.value?.resetValidation())
}

const confirmDeleteCompetition = (competition: LocalCompetition) => {
  const confirmed = window.confirm(t('admin.competitionDeleteConfirm', { name: competition.name }))
  if (!confirmed) return
  competitions.value = competitions.value.filter((c) => c.id !== competition.id)
  if (editingCompetitionId.value === competition.id) {
    resetCompetitionForm()
  }
}
</script>
