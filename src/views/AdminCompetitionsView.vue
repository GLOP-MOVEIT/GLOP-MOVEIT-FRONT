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
                <v-select
                  v-model="competitionForm.participantType"
                  :items="participantTypeOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.competitionParticipantTypeLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="competitionForm.type"
                  :items="typeOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.competitionTypeLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col v-if="competitionForm.type === 'HEATS'" cols="12" md="6">
                <v-text-field
                  v-model.number="competitionForm.maxPerHeat"
                  type="number"
                  :label="t('admin.competitionMaxPerHeatLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.positiveNumber]"
                  required
                  min="1"
                />
              </v-col>
              <v-col v-if="competitionForm.type !== 'ROUND_ROBIN'" cols="12" md="6">
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
              <v-col cols="12" md="6">
                <v-select
                  v-model="competitionForm.assignedCommissaireId"
                  :items="commissaireOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.competitionCommissaireLabel')"
                  variant="outlined"
                  density="comfortable"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="competitionForm.resultUnit"
                  :items="resultUnitOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.competitionResultUnitLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                  clearable
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
import { Status, Sport, ParticipantType, ResultUnit } from '@/types/competition'
import type { Championship, Competition } from '@/types/competition'
import championshipService from '@/services/championshipService'
import userService from '@/services/userService'
import type { User } from '@/types/user'
import { UserRole } from '@/types/user'
import { formatDateRange as formatDateRangeUtil } from '@/utils/date'

const { t, locale } = useI18n()

const formatDateRange = (start: string | Date, end: string | Date) =>
  formatDateRangeUtil(start, end, locale.value)

const competitionFormRef = ref()
const editingCompetitionId = ref<number | null>(null)
const isCompetitionSubmitting = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const isLoading = ref(false)

const championships = ref<Championship[]>([])
const competitions = ref<Competition[]>([])
const competitionTypes = ref<string[]>([])
// TODO: filtrer uniquement les referees quand il y en aura dans la base
const commissaireUsers = ref<User[]>([])

const mapChampionship = (championship: Championship): Championship => ({
  id: championship.id,
  name: championship.name,
  description: championship.description,
  startDate: String(championship.startDate),
  endDate: String(championship.endDate),
  status: championship.status,
})

const mapCompetition = (competition: Competition): Competition => ({
  competitionId: competition.competitionId,
  championshipId: competition.championship?.id ?? competition.championshipId ?? 0,
  competitionSport: competition.competitionSport,
  competitionName: competition.competitionName,
  competitionDescription: competition.competitionDescription,
  competitionStartDate: competition.competitionStartDate,
  competitionEndDate: competition.competitionEndDate,
  competitionStatus: competition.competitionStatus,
  participantType: competition.participantType,
  competitionType: competition.competitionType,
  maxPerHeat: competition.maxPerHeat,
  nbManches: competition.nbManches,
  assignedCommissaireId: competition.assignedCommissaireId ?? null,
  competitionResultUnit: competition.competitionResultUnit ?? null,
})

const competitionForm = reactive({
  championshipId: null as number | null,
  sport: '',
  participantType: ParticipantType.INDIVIDUAL,
  type: '',
  maxPerHeat: 1,
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: Status.PLANNED,
  nbManches: 1,
  assignedCommissaireId: null as number | null,
  resultUnit: null as ResultUnit | null,
})

const statusOptions = computed(() =>
  Object.values(Status).map((status) => ({
    title: t(`admin.competitionStatus.${status}`),
    value: status,
  })),
)

const participantTypeOptions = computed(() =>
  Object.values(ParticipantType).map((type) => ({
    title: t(`admin.participantType.${type}`),
    value: type,
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

const typeOptions = computed(() =>
  competitionTypes.value.map((type) => ({
    title: type,
    value: type,
  })),
)

const commissaireOptions = computed(() =>
  commissaireUsers.value.map((user) => ({
    title: `${user.firstName ?? ''} ${user.surname ?? ''}`.trim() || user.email,
    value: user.userId,
  })),
)

const resultUnitOptions = computed(() =>
  Object.values(ResultUnit).map((unit) => ({
    title: t(`admin.resultUnit.${unit}`),
    value: unit,
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


const getChampionshipName = (championshipId: number | undefined) => {
  if (!championshipId) return 'N/A'
  return championships.value.find((c) => c.id === championshipId)?.name || 'N/A'
}

// Load data on mount
onMounted(async () => {
  console.log('AdminCompetitionsView mounted')
  isLoading.value = true
  try {
    const [champsData, compsData, typesData, usersData] = await Promise.all([
      championshipService.getAllChampionships(),
      championshipService.getAllCompetitions(),
      championshipService.getCompetitionTypes(),
      userService.getUsers(),
    ])
    console.log('Championships loaded:', champsData)
    console.log('Competitions loaded:', compsData)
    console.log('Competition types loaded:', typesData)
    championships.value = champsData.map(mapChampionship)
    competitions.value = compsData.map(mapCompetition)
    competitionTypes.value = typesData
    commissaireUsers.value = usersData.filter((u) => {
      const roleName = u.role?.name ?? ''
      return roleName === UserRole.REFEREE
    })
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
  competitionForm.participantType = ParticipantType.INDIVIDUAL
  competitionForm.type = ''
  competitionForm.maxPerHeat = 0
  competitionForm.name = ''
  competitionForm.description = ''
  competitionForm.startDate = ''
  competitionForm.endDate = ''
  competitionForm.status = Status.PLANNED
  competitionForm.nbManches = 0
  competitionForm.assignedCommissaireId = null
  competitionForm.resultUnit = null
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
        participantType: competitionForm.participantType,
        competitionType: competitionForm.type,
        maxPerHeat: competitionForm.maxPerHeat,
        nbManches: competitionForm.nbManches,
        assignedCommissaireId: competitionForm.assignedCommissaireId,
        competitionResultUnit: competitionForm.resultUnit,
      })
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
        participantType: competitionForm.participantType,
        competitionType: competitionForm.type,
        maxPerHeat: competitionForm.maxPerHeat,
        nbManches: competitionForm.nbManches,
        assignedCommissaireId: competitionForm.assignedCommissaireId,
        competitionResultUnit: competitionForm.resultUnit,
      }
      await championshipService.createCompetition(payload)
      snackbarMessage.value = t('admin.competitionSuccess')
    }

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

const startCompetitionEdit = (competition: Competition) => {
  editingCompetitionId.value = competition.competitionId
  competitionForm.championshipId = competition.championshipId ?? competition.championship?.id ?? null
  competitionForm.sport = toApiSportValue(competition.competitionSport)
  competitionForm.participantType = competition.participantType
  competitionForm.type = competition.competitionType ?? ''
  competitionForm.maxPerHeat = competition.maxPerHeat
  competitionForm.name = competition.competitionName
  competitionForm.description = competition.competitionDescription
  competitionForm.startDate = competition.competitionStartDate
  competitionForm.endDate = competition.competitionEndDate
  competitionForm.status = competition.competitionStatus
  competitionForm.nbManches = competition.nbManches
  competitionForm.assignedCommissaireId = competition.assignedCommissaireId ?? null
  competitionForm.resultUnit = competition.competitionResultUnit ?? null
  nextTick(() => competitionFormRef.value?.resetValidation())
}

const confirmDeleteCompetition = async (competition: Competition) => {
  const confirmed = globalThis.confirm(t('admin.competitionDeleteConfirm', { name: competition.competitionName }))
  if (!confirmed) return

  try {
    await championshipService.deleteCompetition(competition.competitionId)
    competitions.value = competitions.value.filter((c) => c.competitionId !== competition.competitionId)
    if (editingCompetitionId.value === competition.competitionId) {
      resetCompetitionForm()
    }
    snackbarMessage.value = t('admin.competitionDeleteSuccess')
    snackbar.value = true
  } catch (error) {
    console.error('Error deleting competition:', error)
    snackbarMessage.value = t('admin.competitionDeleteError')
    snackbar.value = true
  }
}
</script>
