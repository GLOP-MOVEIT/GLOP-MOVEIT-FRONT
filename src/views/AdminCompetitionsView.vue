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
              <v-col cols="12" md="6">
                <v-select
                  v-model="competitionForm.sport"
                  :items="sportOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.competitionSportLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="competitionForm.nbManches"
                  type="number"
                  :label="t('admin.competitionNbManchesLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.positiveNumber]"
                  required
                  min="1"
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
              :key="competition.competitionId"
              class="rounded-lg mb-1"
              :title="competition.competitionName"
            >
              <template #append>
                <div class="d-flex align-center gap-1">
                  <v-btn icon size="small" variant="text" color="success" @click="startCompetitionEdit(competition)" class="ma-0">
                    <v-icon icon="mdi-pencil" size="18" />
                  </v-btn>
                  <v-btn icon size="small" variant="text" color="error" @click="confirmDeleteCompetition(competition)" class="ma-0">
                    <v-icon icon="mdi-delete-outline" size="18" />
                  </v-btn>
                  <v-chip :color="statusColor(competition.competitionStatus)" variant="tonal" size="small" label class="ml-1">
                    {{ t(`admin.competitionStatus.${competition.competitionStatus}`) }}
                  </v-chip>
                </div>
              </template>
              <template #subtitle>
                <div class="d-flex flex-column text-caption text-grey-darken-2">
                  <span>{{ toDisplaySport(competition.competitionSport) }} • {{ getChampionshipName(competition.championshipId) }}</span>
                  <span>{{ formatDateRange(competition.competitionStartDate, competition.competitionEndDate) }}</span>
                  <span>{{ competition.nbManches }} manche(s)</span>
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
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Status, Sport } from '@/types/competition'
import championshipService from '@/services/championshipService'

type LocalChampionship = {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: Status
}

type LocalCompetition = {
  competitionId: number
  championshipId: number
  competitionSport: string
  competitionName: string
  competitionDescription: string
  competitionStartDate: string
  competitionEndDate: string
  competitionStatus: Status
  nbManches: number
}

const { t } = useI18n()

const competitionFormRef = ref()
const editingCompetitionId = ref<number | null>(null)
const isCompetitionSubmitting = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const isLoading = ref(false)

const championships = ref<LocalChampionship[]>([])
const competitions = ref<LocalCompetition[]>([])

const mapChampionship = (championship: { id: number; name: string; description: string; startDate: string | Date; endDate: string | Date; status: Status }): LocalChampionship => ({
  id: championship.id,
  name: championship.name,
  description: championship.description,
  startDate: String(championship.startDate),
  endDate: String(championship.endDate),
  status: championship.status,
})

const mapCompetition = (competition: { competitionId: number; championship?: { id: number }; competitionSport: string; competitionName: string; competitionDescription: string; competitionStartDate: string; competitionEndDate: string; competitionStatus: Status; nbManches: number }): LocalCompetition => ({
  competitionId: competition.competitionId,
  championshipId: competition.championship?.id ?? 0,
  competitionSport: competition.competitionSport,
  competitionName: competition.competitionName,
  competitionDescription: competition.competitionDescription,
  competitionStartDate: competition.competitionStartDate,
  competitionEndDate: competition.competitionEndDate,
  competitionStatus: competition.competitionStatus,
  nbManches: competition.nbManches,
})

const competitionForm = reactive({
  championshipId: null as number | null,
  sport: '',
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: Status.PLANNED,
  nbManches: 1,
})

const statusOptions = computed(() =>
  Object.values(Status).map((status) => ({
    title: t(`admin.competitionStatus.${status}`),
    value: status,
  })),
)

const normalizeSportEnum = (value: string) => {
  const normalized = value.replace(/\s+/g, '_').toLowerCase()
  const match = Object.values(Sport).find((sport) => sport.toLowerCase() === normalized)
  return match ?? value
}

const toApiSportValue = (value: string) => {
  const normalized = normalizeSportEnum(value)
  if (Object.values(Sport).includes(normalized as Sport)) {
    return (normalized as string)
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }
  return value
}

const toDisplaySport = (value: string) => {
  const normalized = normalizeSportEnum(value)
  if (Object.values(Sport).includes(normalized as Sport)) {
    return t(`admin.sport.${normalized}`)
  }
  return value
}

const sportOptions = computed(() =>
  Object.values(Sport).map((sport) => ({
    title: t(`admin.sport.${sport}`),
    value: toApiSportValue(sport),
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
  positiveNumber: (value: unknown) => {
    if (value === null || value === undefined) return t('validation.requiredField')
    const num = Number(value)
    return (num > 0 && Number.isInteger(num)) || 'Le nombre de manches doit être un entier positif'
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

const getChampionshipName = (championshipId: number) => {
  return championships.value.find((c) => c.id === championshipId)?.name || 'N/A'
}

// Load data on mount
onMounted(async () => {
  console.log('AdminCompetitionsView mounted')
  isLoading.value = true
  try {
    const [champsData, compsData] = await Promise.all([
      championshipService.getAllChampionships(),
      championshipService.getAllCompetitions()
    ])
    console.log('Championships loaded:', champsData)
    console.log('Competitions loaded:', compsData)
    championships.value = champsData.map(mapChampionship)
    competitions.value = compsData.map(mapCompetition)
  } catch (error) {
    console.error('Error loading data:', error)
    snackbarMessage.value = 'Erreur lors du chargement des données'
    snackbar.value = true
  } finally {
    isLoading.value = false
  }
})

const resetCompetitionForm = () => {
  competitionForm.championshipId = null
  competitionForm.sport = ''
  competitionForm.name = ''
  competitionForm.description = ''
  competitionForm.startDate = ''
  competitionForm.endDate = ''
  competitionForm.status = Status.PLANNED
  competitionForm.nbManches = 1
  editingCompetitionId.value = null
  nextTick(() => competitionFormRef.value?.resetValidation())
}

const handleCompetitionSubmit = async () => {
  console.log('handleCompetitionSubmit called')
  const result = await competitionFormRef.value?.validate()
  console.log('Validation result:', result)
  if (!result?.valid) {
    console.log('Validation failed')
    return
  }

  isCompetitionSubmitting.value = true
  console.log('Form data:', competitionForm)

  try {
    if (editingCompetitionId.value) {
      console.log('Updating competition:', editingCompetitionId.value)
      await championshipService.updateCompetition(editingCompetitionId.value, {
        championship: { id: competitionForm.championshipId! },
        competitionSport: toApiSportValue(competitionForm.sport.trim()),
        competitionName: competitionForm.name.trim(),
        competitionDescription: competitionForm.description?.trim() || '',
        competitionStartDate: competitionForm.startDate,
        competitionEndDate: competitionForm.endDate,
        competitionStatus: competitionForm.status,
        nbManches: competitionForm.nbManches,
      } as any)
      snackbarMessage.value = t('admin.competitionUpdateSuccess')
    } else {
      console.log('Creating competition')
      const payload = {
        championship: { id: competitionForm.championshipId! },
        competitionSport: toApiSportValue(competitionForm.sport.trim()),
        competitionName: competitionForm.name.trim(),
        competitionDescription: competitionForm.description?.trim() || '',
        competitionStartDate: competitionForm.startDate,
        competitionEndDate: competitionForm.endDate,
        competitionStatus: competitionForm.status,
        nbManches: competitionForm.nbManches,
      }
      // Ne pas inclure competitionId pour la création, Hibernate le génère
      await championshipService.createCompetition(payload as any)
      snackbarMessage.value = t('admin.competitionSuccess')
    }

    // Reload competitions
    console.log('Reloading competitions')
    const data = await championshipService.getAllCompetitions()
    competitions.value = data.map(mapCompetition)
    snackbar.value = true
    resetCompetitionForm()
  } catch (error) {
    console.error('Error saving competition:', error)
    snackbarMessage.value = 'Erreur lors de l\'enregistrement'
    snackbar.value = true
  } finally {
    isCompetitionSubmitting.value = false
  }
}

const startCompetitionEdit = (competition: LocalCompetition) => {
  editingCompetitionId.value = competition.competitionId
  competitionForm.championshipId = competition.championshipId
  competitionForm.sport = toApiSportValue(competition.competitionSport)
  competitionForm.name = competition.competitionName
  competitionForm.description = competition.competitionDescription
  competitionForm.startDate = competition.competitionStartDate
  competitionForm.endDate = competition.competitionEndDate
  competitionForm.status = competition.competitionStatus
  competitionForm.nbManches = competition.nbManches
  nextTick(() => competitionFormRef.value?.resetValidation())
}

const confirmDeleteCompetition = async (competition: LocalCompetition) => {
  const confirmed = window.confirm(t('admin.competitionDeleteConfirm', { name: competition.competitionName }))
  if (!confirmed) return

  try {
    await championshipService.deleteCompetition(competition.competitionId)
    competitions.value = competitions.value.filter((c) => c.competitionId !== competition.competitionId)
    if (editingCompetitionId.value === competition.competitionId) {
      resetCompetitionForm()
    }
    snackbarMessage.value = 'Compétition supprimée avec succès'
    snackbar.value = true
  } catch (error) {
    console.error('Error deleting competition:', error)
    snackbarMessage.value = 'Erreur lors de la suppression'
    snackbar.value = true
  }
}
</script>
