<template>
  <v-container class="py-6">
    <div v-if="isLoading" class="d-flex justify-center align-center py-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <v-alert v-else-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <template v-else-if="competition">
      <div class="d-flex flex-wrap align-center justify-space-between mb-6">
        <div>
          <div class="text-overline mb-1">{{ t('competitionDetails.title') }}</div>
          <h1 class="text-h4 font-weight-bold mb-2">{{ competition.competitionName }}</h1>
          <div class="d-flex align-center gap-2 flex-wrap">
            <v-chip color="primary" variant="tonal" prepend-icon="mdi-trophy">
              {{ getSportLabel(competition.competitionSport) }}
            </v-chip>
            <v-chip color="secondary" variant="tonal" prepend-icon="mdi-tournament">
              {{ getCompetitionTypeLabel(competition.competitionType) }}
            </v-chip>
            <v-chip color="info" variant="tonal" prepend-icon="mdi-account-group">
              {{ t(`admin.participantType.${competition.participantType}`) }}
            </v-chip>
          </div>
        </div>

        <v-btn
          variant="text"
          color="primary"
          :to="{ name: 'championship-details', params: { id: competition.championshipId ?? competition.championship?.id } }"
        >
          <v-icon icon="mdi-arrow-left" class="mr-1" />
          {{ t('competitionDetails.backToChampionship') }}
        </v-btn>
      </div>
      <v-row dense class="mb-12">
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-4 h-100">
            <div class="text-subtitle-1 font-weight-medium mb-3">
              <v-icon icon="mdi-information-outline" class="mr-2" />
              {{ t('competitionDetails.generalInfo') }}
            </div>
            <div class="d-flex flex-column gap-2">
              <div class="d-flex align-center text-body-2">
                <v-icon size="18" class="mr-2" color="primary">mdi-calendar-range</v-icon>
                <span class="font-weight-medium mr-2">{{ t('competitionDetails.dates') }} :</span>
                <span>{{ formatDateRange(competition.competitionStartDate, competition.competitionEndDate) }}</span>
              </div>
              <div class="d-flex align-center text-body-2">
                <v-icon size="18" class="mr-2" color="primary">mdi-repeat</v-icon>
                <span class="font-weight-medium mr-2">{{ t('competitionDetails.rounds') }} :</span>
                <span>{{ competition.nbManches }}</span>
              </div>
              <div class="d-flex align-center text-body-2">
                <v-icon size="18" class="mr-2" color="primary">mdi-account-multiple</v-icon>
                <span class="font-weight-medium mr-2">{{ t('competitionDetails.maxPerHeat') }} :</span>
                <span>{{ competition.maxPerHeat }}</span>
              </div>
              <div v-if="competition.competitionResultUnit" class="d-flex align-center text-body-2">
                <v-icon size="18" class="mr-2" color="primary">mdi-ruler</v-icon>
                <span class="font-weight-medium mr-2">{{ t('competitionDetails.resultUnit') }} :</span>
                <span>{{ t(`admin.resultUnit.${competition.competitionResultUnit}`) }}</span>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-4 h-100">
            <div class="text-subtitle-1 font-weight-medium mb-3">
              <v-icon icon="mdi-text-box-outline" class="mr-2" />
              {{ t('competitionDetails.description') }}
            </div>
            <p class="text-body-2 text-grey-darken-1 mb-0">
              {{ competition.competitionDescription || t('competitionDetails.noDescription') }}
            </p>
          </v-card>
        </v-col>
      </v-row>

      <v-card variant="outlined" class="pa-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="text-h6 font-weight-medium">
            <v-icon icon="mdi-flag-checkered" class="mr-2" />
            {{ t('competitionDetails.trialsTitle') }}
          </div>
          <v-chip color="primary" variant="tonal" size="small">{{ trials.length }}</v-chip>
        </div>

        <v-alert v-if="trials.length === 0" type="info" variant="tonal" class="mb-0">
          {{ t('competitionDetails.noTrials') }}
        </v-alert>

        <v-row v-else dense>
          <v-col
            v-for="trial in trials"
            :key="trial.trialId"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card variant="tonal" class="pa-4 h-100">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="text-subtitle-2 font-weight-bold">{{ trial.trialName }}</div>
                <v-chip
                  :color="statusColor(trial.trialStatus)"
                  size="x-small"
                  label
                >
                  {{ t(`athlete.convocations.status.${trial.trialStatus}`) }}
                </v-chip>
              </div>

              <v-divider class="mb-3" />

              <div class="d-flex flex-column gap-2 text-caption">
                <div class="d-flex align-center">
                  <v-icon size="14" class="mr-2" color="primary">mdi-calendar-start</v-icon>
                  <span class="font-weight-medium mr-1">{{ t('competitionDetails.startDate') }} :</span>
                  <span>{{ formatDateTime(trial.trialStartDate) }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="14" class="mr-2" color="primary">mdi-calendar-end</v-icon>
                  <span class="font-weight-medium mr-1">{{ t('competitionDetails.endDate') }} :</span>
                  <span>{{ formatDateTime(trial.trialEndDate) }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="14" class="mr-2" color="primary">mdi-counter</v-icon>
                  <span class="font-weight-medium mr-1">{{ t('competitionDetails.round') }} :</span>
                  <span>{{ trial.roundNumber }} - {{ t('competitionDetails.position') }} {{ trial.position }}</span>
                </div>
                <div v-if="trial.locationId">
                  <TrialLocationCard
                    :location="getLocation(trial.locationId)"
                    :is-referee="isReferee"
                  />
                </div>
                <div v-else class="d-flex align-center">
                  <v-icon size="14" class="mr-2" color="warning">mdi-alert</v-icon>
                  <span class="text-warning">{{ t('competitionDetails.noLocation') }}</span>
                </div>
              </div>

              <v-divider class="my-3" />

              <div class="text-caption">
                <div class="font-weight-medium mb-2">
                  <v-icon size="14" class="mr-1">mdi-account-group</v-icon>
                  {{ competition?.participantType === 'TEAM' ? t('competitionDetails.teams') : t('competitionDetails.athletes') }} :
                </div>
                <div v-if="trial.participantIds && trial.participantIds.length > 0" class="pl-5">
                  <template v-if="competition?.participantType === 'TEAM'">
                    <div v-for="(participantId, idx) in trial.participantIds" :key="`participant-${idx}`" class="mb-2">
                      <template v-if="typeof participantId === 'number'">
                        <div class="text-body-2 font-weight-medium">
                          • {{ typeof getParticipantDisplay(participantId) === 'object' ? (getParticipantDisplay(participantId) as { teamName: string }).teamName : getParticipantDisplay(participantId) }}
                        </div>
                        <div v-if="typeof getParticipantDisplay(participantId) === 'object'" class="pl-4 text-caption text-grey-darken-1">
                          <div v-for="(athleteName, aIdx) in (getParticipantDisplay(participantId) as { athletes: string[] }).athletes" :key="`athlete-${aIdx}`">
                            - {{ athleteName }}
                          </div>
                        </div>
                      </template>
                    </div>
                  </template>
                  <template v-else>
                    <div v-for="(participantId, idx) in trial.participantIds" :key="`participant-${idx}`" class="text-body-2 mb-1">
                      <template v-if="typeof participantId === 'number'">
                        • {{ getAthleteName(participantId) }}
                      </template>
                    </div>
                  </template>
                </div>
                <div v-else class="text-grey pl-5">
                  {{ competition?.participantType === 'TEAM' ? t('competitionDetails.noTeams') : t('competitionDetails.noAthletes') }}
                </div>
              </div>

              <div v-if="trial.trialDescription" class="text-caption text-grey-darken-1 mt-3">
                <v-icon size="14" class="mr-1">mdi-text</v-icon>
                {{ trial.trialDescription }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import championshipService from '@/services/championshipService'
import userService from '@/services/userService'
import locationService from '@/services/locationService'
import teamService from '@/services/teamService'
import { useUserStore } from '@/stores/user'
import TrialLocationCard from '@/components/TrialLocationCard.vue'
import type { CompetitionTreeResult, Trial } from '@/types/competition'
import { Status } from '@/types/competition'
import type { User } from '@/types/user'
import type { Location } from '@/types/location'
import type { Team } from '@/types/team'
import { getUserDisplayName, UserRole } from '@/types/user'
import { formatDateRange as formatDateRangeUtil, formatDateTime as formatDateTimeUtil } from '@/utils/date'

const route = useRoute()
const { t, locale } = useI18n()

const competition = ref<CompetitionTreeResult | null>(null)
const trials = ref<Trial[]>([])
const athletes = ref<User[]>([])
const locations = ref<Location[]>([])
const loadedTeams = ref<Team[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const userStore = useUserStore()
const isReferee = computed(() => userStore.hasRole(UserRole.REFEREE) || userStore.hasRole(UserRole.ADMIN))

const getLocation = (locationId: number | null | undefined): Location | null => {
  if (!locationId) return null
  return locations.value.find((l) => l.locationId === locationId) ?? null
}


const competitionId = computed(() => Number(route.params.id))

const formatDateRange = (start: string | Date, end: string | Date) =>
  formatDateRangeUtil(start, end, locale.value)

const formatDateTime = (dateStr: string) =>
  formatDateTimeUtil(dateStr, locale.value)

const statusColor = (status: Status) => {
  if (status === Status.PLANNED) return 'grey'
  if (status === Status.ONGOING) return 'primary'
  if (status === Status.COMPLETED) return 'success'
  if (status === Status.CANCELLED) return 'error'
  return 'grey'
}

const getAthleteName = (athleteId: number) => {
  const athlete = athletes.value.find((a) => a.userId === athleteId)
  return athlete ? getUserDisplayName(athlete) : `#${athleteId}`
}

const getParticipantDisplay = (participantId: number) => {
  if (competition.value?.participantType === 'TEAM') {
    const team = loadedTeams.value.find(t => t.teamId === participantId)
    if (!team) return `Team #${participantId}`

    return {
      teamName: team.name,
      athletes: team.athletes.map(a => getUserDisplayName(a)),
    }
  }
  return getAthleteName(participantId)
}

const getCompetitionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'SINGLE_ELIMINATION': t('competitionType.singleElimination'),
    'ROUND_ROBIN': t('competitionType.roundRobin'),
    'HEATS': t('competitionType.heats'),
  }
  return labels[type] || type
}

const getSportLabel = (sport: string): string => {
  const normalized = sport.toUpperCase().replace(/\s+/g, '_')
  return t(`admin.sport.${normalized}`)
}


onMounted(async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    competition.value = await championshipService.getCompetitionById(competitionId.value)
    trials.value = await championshipService.getTrialsByCompetition(competitionId.value)
    try { locations.value = await locationService.getAllLocations() } catch { locations.value = [] }
    try {
      athletes.value = await userService.getUsersByRole(UserRole.ATHLETE)
    } catch {
      athletes.value = []
    }

    if (competition.value?.participantType === 'TEAM') {
      try {
        loadedTeams.value = await teamService.getAllTeams()
      } catch {
        loadedTeams.value = []
      }
    }
  } catch (error) {
    console.error('Error loading competition details:', error)
    errorMessage.value = t('competitionDetails.loadError')
  } finally {
    isLoading.value = false
  }
})
</script>

