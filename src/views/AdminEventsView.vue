<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-flag" size="32" color="warning" class="mr-2" />
        <h2 class="text-h5 font-weight-bold">{{ t('admin.eventsSection') }}</h2>
      </div>
    </div>

    <v-row align="stretch" dense>
      <v-col cols="12" md="7">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="text-overline mb-1">{{ t('admin.eventCreateTitle') }}</div>
          <div class="text-body-2 text-grey-darken-1 mb-4">
            {{ t('admin.eventCreateSubtitle') }}
          </div>

          <v-form ref="eventFormRef" validate-on="submit" @submit.prevent="handleEventSubmit">
            <v-row dense>
              <v-col cols="12">
                <v-select
                  v-model="eventForm.competitionId"
                  :items="competitionOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.eventCompetitionLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="eventForm.name"
                  :label="t('admin.eventNameLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="eventForm.startDate"
                  type="date"
                  :label="t('admin.eventStartDateLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.eventDateOrder, rules.startWithinCompetition]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="eventForm.endDate"
                  type="date"
                  :label="t('admin.eventEndDateLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.eventDateOrder, rules.endWithinCompetition]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="eventForm.status"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.eventStatusLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                  chips
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="eventForm.description"
                  :label="t('admin.eventDescriptionLabel')"
                  variant="outlined"
                  rows="3"
                  density="comfortable"
                  auto-grow
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-2">
              <v-btn color="warning" type="submit" :loading="isEventSubmitting" class="mr-2">
                <v-icon icon="mdi-content-save-outline" class="mr-1" />
                {{ editingEventId ? t('admin.eventUpdate') : t('admin.eventSubmit') }}
              </v-btn>
              <v-btn color="secondary" variant="tonal" @click="resetEventForm" :disabled="isEventSubmitting">
                <v-icon icon="mdi-backup-restore" class="mr-1" />
                {{ t('admin.eventReset') }}
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between mb-2">
            <div>
              <div class="text-overline mb-1">{{ t('admin.eventPreviewTitle') }}</div>
              <div class="text-caption text-grey-darken-1">
                {{ t('admin.eventsInfo') }}
              </div>
            </div>
            <v-chip variant="tonal" color="warning" size="small" label>{{ events.length }}</v-chip>
          </div>

          <div v-if="events.length === 0" class="text-body-2 text-grey-darken-1">
            {{ t('admin.eventNoData') }}
          </div>

          <v-list v-else density="compact" lines="three">
            <v-list-item
              v-for="event in events"
              :key="event.id"
              class="rounded-lg mb-1"
              :title="event.name"
            >
              <template #append>
                <div class="d-flex align-center gap-1">
                  <v-btn icon size="small" variant="text" color="warning" @click="startEventEdit(event)" class="ma-0">
                    <v-icon icon="mdi-pencil" size="18" />
                  </v-btn>
                  <v-btn icon size="small" variant="text" color="error" @click="confirmDeleteEvent(event)" class="ma-0">
                    <v-icon icon="mdi-delete-outline" size="18" />
                  </v-btn>
                  <v-chip :color="statusColor(event.status)" variant="tonal" size="small" label class="ml-1">
                    {{ t(`admin.competitionStatus.${event.status}`) }}
                  </v-chip>
                </div>
              </template>
              <template #subtitle>
                <div class="d-flex flex-column text-caption text-grey-darken-2">
                  <span>{{ getCompetitionName(event.competitionId) }}</span>
                  <span>{{ formatDateRange(event.startDate, event.endDate) }}</span>
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

type LocalCompetition = {
  id: number
  championshipId: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: Status
}

type LocalEvent = {
  id: number
  competitionId: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: Status
}

const { t } = useI18n()

const eventFormRef = ref()
const editingEventId = ref<number | null>(null)
const isEventSubmitting = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')

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

const events = ref<LocalEvent[]>([
  {
    id: 1,
    competitionId: 1,
    name: '100m hommes',
    description: 'Sprint 100m catégorie hommes',
    startDate: '2026-02-08',
    endDate: '2026-02-08',
    status: Status.PLANNED,
  },
  {
    id: 2,
    competitionId: 1,
    name: 'Marathon hommes',
    description: 'Marathon catégorie hommes',
    startDate: '2026-02-10',
    endDate: '2026-02-10',
    status: Status.PLANNED,
  },
])

const eventForm = reactive({
  competitionId: null as number | null,
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

const competitionOptions = computed(() =>
  competitions.value.map((comp) => ({
    title: comp.name,
    value: comp.id,
  })),
)

const rules = {
  required: (value: unknown) => {
    if (value === null || value === undefined) return t('validation.requiredField')
    if (typeof value === 'string' && value.trim().length === 0) return t('validation.requiredField')
    return true
  },
  eventDateOrder: () => {
    if (!eventForm.startDate || !eventForm.endDate) return true
    const start = new Date(eventForm.startDate)
    const end = new Date(eventForm.endDate)
    return start <= end || t('admin.eventDateOrderError')
  },
  startWithinCompetition: () => {
    if (!eventForm.competitionId || !eventForm.startDate) return true
    const competition = competitions.value.find((c) => c.id === eventForm.competitionId)
    if (!competition) return true
    const start = new Date(eventForm.startDate)
    const compStart = new Date(competition.startDate)
    return start >= compStart || t('admin.eventStartBeforeCompetition', { date: competition.startDate })
  },
  endWithinCompetition: () => {
    if (!eventForm.competitionId || !eventForm.endDate) return true
    const competition = competitions.value.find((c) => c.id === eventForm.competitionId)
    if (!competition) return true
    const end = new Date(eventForm.endDate)
    const compEnd = new Date(competition.endDate)
    return end <= compEnd || t('admin.eventEndAfterCompetition', { date: competition.endDate })
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

const getCompetitionName = (competitionId: number) => {
  return competitions.value.find((c) => c.id === competitionId)?.name || 'N/A'
}

const resetEventForm = () => {
  eventForm.competitionId = null
  eventForm.name = ''
  eventForm.description = ''
  eventForm.startDate = ''
  eventForm.endDate = ''
  eventForm.status = Status.PLANNED
  editingEventId.value = null
  nextTick(() => eventFormRef.value?.resetValidation())
}

const handleEventSubmit = async () => {
  const result = await eventFormRef.value?.validate()
  if (!result?.valid) return

  isEventSubmitting.value = true

  if (editingEventId.value) {
    events.value = events.value.map((e) =>
      e.id === editingEventId.value
        ? {
            ...e,
            competitionId: eventForm.competitionId!,
            name: eventForm.name.trim(),
            description: eventForm.description?.trim() || '',
            startDate: eventForm.startDate,
            endDate: eventForm.endDate,
            status: eventForm.status,
          }
        : e,
    )
    snackbarMessage.value = t('admin.eventUpdateSuccess')
  } else {
    const id = Math.max(...events.value.map((e) => e.id), 0) + 1
    const newEvent: LocalEvent = {
      id,
      competitionId: eventForm.competitionId!,
      name: eventForm.name.trim(),
      description: eventForm.description?.trim() || '',
      startDate: eventForm.startDate,
      endDate: eventForm.endDate,
      status: eventForm.status,
    }
    events.value = [newEvent, ...events.value]
    snackbarMessage.value = t('admin.eventSuccess')
  }

  snackbar.value = true
  resetEventForm()
  isEventSubmitting.value = false
}

const startEventEdit = (event: LocalEvent) => {
  editingEventId.value = event.id
  eventForm.competitionId = event.competitionId
  eventForm.name = event.name
  eventForm.description = event.description
  eventForm.startDate = event.startDate
  eventForm.endDate = event.endDate
  eventForm.status = event.status
  nextTick(() => eventFormRef.value?.resetValidation())
}

const confirmDeleteEvent = (event: LocalEvent) => {
  const confirmed = window.confirm(t('admin.eventDeleteConfirm', { name: event.name }))
  if (!confirmed) return
  events.value = events.value.filter((e) => e.id !== event.id)
  if (editingEventId.value === event.id) {
    resetEventForm()
  }
}
</script>
