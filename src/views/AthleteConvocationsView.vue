<template>
  <v-container class="py-6">
    <div class="d-flex align-center mb-6">
      <v-icon icon="mdi-calendar-clock" size="32" color="primary" class="mr-3" />
      <div>
        <h1 class="text-h5 font-weight-bold">{{ t('athlete.convocations.title') }}</h1>
        <p class="text-body-2 text-grey-darken-1 mb-0">{{ t('athlete.convocations.subtitle') }}</p>
      </div>
    </div>

    <div v-if="isLoading" class="d-flex justify-center align-center py-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-card v-else-if="trials.length === 0" variant="outlined" class="pa-8 text-center">
      <v-icon icon="mdi-calendar-remove" size="64" color="grey-lighten-1" class="mb-4" />
      <p class="text-h6 text-grey-darken-1">{{ t('athlete.convocations.empty') }}</p>
      <p class="text-body-2 text-grey">{{ t('athlete.convocations.emptySubtitle') }}</p>
    </v-card>

    <v-row v-else dense>
      <v-col
        v-for="trial in trials"
        :key="trial.trialId"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-caption text-grey-darken-1">
              <v-icon size="14" class="mr-1">mdi-trophy</v-icon>
              {{ t('athlete.convocations.competition') }} : {{ competitionsMap.get(trial.competitionId)?.competitionName ?? `#${trial.competitionId}` }}
            </span>
          </div>
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-flag-checkered" color="primary" class="mr-2" />
              <span class="text-subtitle-1 font-weight-bold">{{ trial.trialName }}</span>
            </div>
            <v-chip
              :color="statusColor(trial.trialStatus)"
              size="small"
              label
            >
              {{ t(`athlete.convocations.status.${trial.trialStatus}`) }}
            </v-chip>
          </div>

          <v-divider class="mb-3" />

          <div class="d-flex align-center text-body-2 text-grey-darken-2 mb-2">
            <v-icon size="16" class="mr-2">mdi-calendar-start</v-icon>
            <span>{{ t('athlete.convocations.startDate') }} : {{ formatDate(trial.trialStartDate) }}</span>
          </div>
          <div class="d-flex align-center text-body-2 text-grey-darken-2 mb-2">
            <v-icon size="16" class="mr-2">mdi-calendar-end</v-icon>
            <span>{{ t('athlete.convocations.endDate') }} : {{ formatDate(trial.trialEndDate) }}</span>
          </div>
          <div class="d-flex align-center text-body-2 text-grey-darken-2 mb-2">
            <v-icon size="16" class="mr-2">mdi-counter</v-icon>
            <span>{{ t('athlete.convocations.round') }} : {{ trial.roundNumber }}</span>
          </div>
          <div class="d-flex align-center text-body-2 text-grey-darken-2 mb-2">
            <v-icon size="16" class="mr-2">mdi-podium</v-icon>
            <span>{{ t('athlete.convocations.position') }} : {{ trial.position }}</span>
          </div>
          <div v-if="trial.trialDescription" class="text-body-2 text-grey-darken-1 mt-2">
            <v-icon size="16" class="mr-1">mdi-text</v-icon>
            {{ trial.trialDescription }}
          </div>

          <v-divider class="my-3" />

          <v-sheet v-if="getLocation(trial.locationId)" color="primary" rounded="lg" class="pa-3 mt-1">
            <div class="text-body-2 font-weight-bold text-white mb-1">
              <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
              {{ t('athlete.convocations.venueLabel') }}
            </div>
            <div class="text-body-2 text-white mb-1">
              {{ getLocation(trial.locationId)!.name }}
            </div>
            <div v-if="getLocation(trial.locationId)!.athleteEntrance" class="text-body-2 text-white">
              <v-icon size="14" class="mr-1" color="white">mdi-door-open</v-icon>
              {{ t('athlete.convocations.athleteEntrance') }} : {{ getLocation(trial.locationId)!.athleteEntrance }}
            </div>
          </v-sheet>
          <v-alert v-else density="compact" type="warning" variant="tonal" class="mt-2" icon="mdi-alert">
            {{ t('athlete.convocations.noLocation') }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import championshipService from '@/services/championshipService'
import locationService from '@/services/locationService'
import type { Trial, Competition } from '@/types/competition'
import type { Location } from '@/types/location'
import { Status } from '@/types/competition'
import { formatDateTime } from '@/utils/date'

const { t, locale } = useI18n()
const userStore = useUserStore()

const trials = ref<Trial[]>([])
const locations = ref<Location[]>([])
const competitionsMap = ref<Map<number, Competition>>(new Map())
const isLoading = ref(false)
const error = ref<string | null>(null)

const getLocation = (locationId: number | null | undefined): Location | null => {
  if (!locationId) return null
  return locations.value.find((l) => l.locationId === locationId) ?? null
}

const formatDate = (dateStr: string) => formatDateTime(dateStr, locale.value)

const statusColor = (status: string) => {
  if (status === Status.PLANNED) return 'grey'
  if (status === Status.ONGOING) return 'primary'
  if (status === Status.COMPLETED) return 'success'
  if (status === Status.CANCELLED) return 'error'
  return 'grey'
}

onMounted(async () => {
  const athleteId = userStore.user?.userId
  if (!athleteId) {
    error.value = t('athlete.convocations.errorNoId')
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const [trialData] = await Promise.all([
      championshipService.getTrialsByAthlete(athleteId),
      locationService.getAllLocations().then((data) => { locations.value = data }).catch(() => {}),
    ])
    trials.value = trialData
    const uniqueCompetitionIds = [...new Set(trialData.map((t) => t.competitionId))]
    const comps = await Promise.all(
      uniqueCompetitionIds.map((id) => championshipService.getCompetitionById(id).catch(() => null))
    )
    const map = new Map<number, Competition>()
    comps.forEach((c) => { if (c) map.set(c.competitionId, c) })
    competitionsMap.value = map
  } catch {
    error.value = t('athlete.convocations.errorLoad')
  } finally {
    isLoading.value = false
  }
})
</script>

