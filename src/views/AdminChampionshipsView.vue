<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-trophy" size="32" color="primary" class="mr-2" />
        <h2 class="text-h5 font-weight-bold">{{ t('admin.championshipsSection') }}</h2>
      </div>
      <v-btn variant="text" to="/admin" class="text-none">
        <v-icon icon="mdi-arrow-left" class="mr-1" />
        {{ t('admin.backToDashboard') }}
      </v-btn>
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

          <v-form ref="formRef" validate-on="submit" @submit.prevent="handleSubmit">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="form.competitionName"
                  :label="t('admin.championshipNameLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.competitionSport"
                  :label="t('admin.championshipSportLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.competitionStatus"
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
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.competitionStartDate"
                  type="date"
                  :label="t('admin.championshipStartDateLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.startRecentEnough, rules.startWithinParent]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.competitionEndDate"
                  type="date"
                  :label="t('admin.championshipEndDateLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.dateOrder, rules.endWithinParent]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="form.parentCompetitionId"
                  :items="parentOptions"
                  item-title="title"
                  item-value="value"
                  :label="t('admin.championshipParentLabel')"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.competitionDescription"
                  :label="t('admin.championshipDescriptionLabel')"
                  variant="outlined"
                  rows="4"
                  density="comfortable"
                  auto-grow
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-2">
              <v-btn color="primary" type="submit" :loading="isSubmitting" class="mr-2">
                <v-icon icon="mdi-content-save-outline" class="mr-1" />
                {{ isEditing ? t('admin.championshipUpdate') : t('admin.championshipSubmit') }}
              </v-btn>
              <v-btn color="secondary" variant="tonal" @click="resetForm" :disabled="isSubmitting">
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

          <v-list v-else density="compact" lines="three">
            <v-list-item
              v-for="item in orderedChampionships"
              :key="item.node.id"
              class="rounded-lg mb-1"
              :title="item.node.name"
              :subtitle="item.node.sport"
              :style="{ marginLeft: `${item.depth * 16}px` }"
            >
              <template #append>
                <div class="d-flex align-center">
                  <v-btn icon size="small" variant="text" color="primary" @click="startEdit(item.node)" class="ma-0">
                    <v-icon icon="mdi-pencil" size="18" />
                  </v-btn>
                  <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(item.node)" class="ma-0">
                    <v-icon icon="mdi-delete-outline" size="18" />
                  </v-btn>
                  <v-chip :color="statusColor(item.node.status)" variant="tonal" size="small" label class="ml-1">
                    {{ t(`admin.competitionStatus.${item.node.status}`) }}
                  </v-chip>
                </div>
              </template>
              <template #subtitle>
                <div class="d-flex flex-column text-caption text-grey-darken-2">
                  <span class="d-flex align-center" :class="{ 'ml-n1': item.depth > 0 }">
                    <v-icon v-if="item.depth > 0" icon="mdi-subdirectory-arrow-right" size="14" class="mr-1" />
                    <span>{{ item.node.sport }}</span>
                  </span>
                  <span>{{ t('admin.championshipDates') }}: {{ formatDateRange(item.node) }}</span>
                  <span v-if="item.node.parentName">
                    {{ t('admin.championshipParentDisplayLabel') }}: {{ item.node.parentName }}
                  </span>
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
import { CompetitionStatus } from '@/types/competition'

type LocalChampionship = {
  id: string
  name: string
  sport: string
  startDate: string
  endDate: string
  status: CompetitionStatus
  description?: string
  parentId?: string | null
  parentName?: string
}

const { t } = useI18n()

const formRef = ref()
const snackbar = ref(false)
const snackbarMessage = ref('')
const isSubmitting = ref(false)
const editingId = ref<string | null>(null)

const championships = ref<LocalChampionship[]>([
  {
    id: 'champ-001',
    name: 'Interclub Series',
    sport: 'Cycling',
    startDate: '2026-03-10',
    endDate: '2026-05-20',
    status: CompetitionStatus.PLANNED,
    description: 'Regional road racing series.',
  },
  {
    id: 'champ-002',
    name: 'National Masters',
    sport: 'Athletics',
    startDate: '2026-06-02',
    endDate: '2026-07-18',
    status: CompetitionStatus.ONGOING,
    description: 'Multi-discipline track championship.',
  },
  {
    id: 'champ-003',
    name: 'Regional Finals - Road Race',
    sport: 'Cycling',
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    status: CompetitionStatus.PLANNED,
    description: 'Final event of the Interclub Series.',
    parentId: 'champ-001',
    parentName: 'Interclub Series',
  },
])

const form = reactive({
  competitionName: '',
  competitionSport: '',
  competitionStartDate: '',
  competitionEndDate: '',
  competitionDescription: '',
  competitionStatus: CompetitionStatus.PLANNED,
  parentCompetitionId: null as string | null,
})

const isEditing = computed(() => Boolean(editingId.value))

const statusOptions = computed(() =>
  Object.values(CompetitionStatus).map((status) => ({
    title: t(`admin.competitionStatus.${status}`),
    value: status,
  })),
)

const parentOptions = computed(() => [
  { title: t('admin.championshipParentNone'), value: null },
  ...championships.value.map((champ) => ({
    title: champ.name,
    value: champ.id,
  })),
])

const rules = {
  required: (value: unknown) => {
    if (value === null || value === undefined) return t('validation.requiredField')
    if (typeof value === 'string' && value.trim().length === 0) return t('validation.requiredField')
    return true
  },
  startRecentEnough: () => {
    if (!form.competitionStartDate) return true
    const start = new Date(form.competitionStartDate)
    const limit = new Date()
    limit.setHours(0, 0, 0, 0)
    limit.setMonth(limit.getMonth() - 6)
    return start >= limit || t('admin.championshipStartTooOld')
  },
  dateOrder: () => {
    if (!form.competitionStartDate || !form.competitionEndDate) return true
    const start = new Date(form.competitionStartDate)
    const end = new Date(form.competitionEndDate)
    return start <= end || t('admin.championshipDateOrderError')
  },
  startWithinParent: () => {
    if (!form.parentCompetitionId || !form.competitionStartDate) return true
    const parent = championships.value.find((c) => c.id === form.parentCompetitionId)
    if (!parent) return true
    const start = new Date(form.competitionStartDate)
    const parentStart = new Date(parent.startDate)
    return start >= parentStart || t('admin.championshipStartBeforeParent', { date: parent.startDate })
  },
  endWithinParent: () => {
    if (!form.parentCompetitionId || !form.competitionEndDate) return true
    const parent = championships.value.find((c) => c.id === form.parentCompetitionId)
    if (!parent) return true
    const end = new Date(form.competitionEndDate)
    const parentEnd = new Date(parent.endDate)
    return end <= parentEnd || t('admin.championshipEndAfterParent', { date: parent.endDate })
  },
}

const orderedChampionships = computed(() => {
  const childrenMap: Record<string, LocalChampionship[]> = {}
  championships.value.forEach((c) => {
    const key = c.parentId ?? '__root__'
    if (!childrenMap[key]) childrenMap[key] = []
    childrenMap[key].push(c)
  })

  const result: { node: LocalChampionship; depth: number }[] = []

  const walk = (nodes: LocalChampionship[] | undefined, depth: number) => {
    if (!nodes) return
    nodes
      .slice()
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .forEach((node) => {
        result.push({ node, depth })
        walk(childrenMap[node.id], depth + 1)
      })
  }

  walk(childrenMap['__root__'], 0)
  return result
})

const statusColor = (status: CompetitionStatus) => {
  if (status === CompetitionStatus.PLANNED) return 'grey'
  if (status === CompetitionStatus.ONGOING) return 'primary'
  if (status === CompetitionStatus.COMPLETED) return 'success'
  if (status === CompetitionStatus.CANCELLED) return 'error'
  return 'primary'
}

const formatDateRange = (championship: LocalChampionship) => {
  return `${championship.startDate} → ${championship.endDate}`
}

const resetForm = () => {
  form.competitionName = ''
  form.competitionSport = ''
  form.competitionStartDate = ''
  form.competitionEndDate = ''
  form.competitionDescription = ''
  form.competitionStatus = CompetitionStatus.PLANNED
  form.parentCompetitionId = null
  editingId.value = null
  nextTick(() => formRef.value?.resetValidation())
}

const handleSubmit = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) return

  isSubmitting.value = true
  const parent = championships.value.find((c) => c.id === form.parentCompetitionId)

  if (editingId.value) {
    championships.value = championships.value.map((c) =>
      c.id === editingId.value
        ? {
            ...c,
            name: form.competitionName.trim(),
            sport: form.competitionSport.trim(),
            startDate: form.competitionStartDate,
            endDate: form.competitionEndDate,
            status: form.competitionStatus,
            description: form.competitionDescription?.trim() || undefined,
            parentId: form.parentCompetitionId,
            parentName: parent?.name,
          }
        : c,
    )
    snackbarMessage.value = t('admin.championshipUpdateSuccess')
  } else {
    const id = `champ-${Date.now()}`
    const newChampionship: LocalChampionship = {
      id,
      name: form.competitionName.trim(),
      sport: form.competitionSport.trim(),
      startDate: form.competitionStartDate,
      endDate: form.competitionEndDate,
      status: form.competitionStatus,
      description: form.competitionDescription?.trim() || undefined,
      parentId: form.parentCompetitionId,
      parentName: parent?.name,
    }

    championships.value = [newChampionship, ...championships.value]
    snackbarMessage.value = t('admin.championshipSuccess')
  }

  snackbar.value = true
  resetForm()
  isSubmitting.value = false
}

const startEdit = (championship: LocalChampionship) => {
  editingId.value = championship.id
  form.competitionName = championship.name
  form.competitionSport = championship.sport
  form.competitionStartDate = championship.startDate
  form.competitionEndDate = championship.endDate
  form.competitionDescription = championship.description || ''
  form.competitionStatus = championship.status
  form.parentCompetitionId = championship.parentId ?? null
  nextTick(() => formRef.value?.resetValidation())
}

const confirmDelete = (championship: LocalChampionship) => {
  const confirmed = window.confirm(t('admin.championshipDeleteConfirm', { name: championship.name }))
  if (!confirmed) return
  championships.value = championships.value.filter((c) => c.id !== championship.id)
  if (editingId.value === championship.id) {
    resetForm()
  }
}
</script>
