<template>
  <v-container class="py-8">
    <v-btn
      variant="outlined"
      color="primary"
      rounded="pill"
      to="/"
      class="text-none back-button mb-4"
    >
      <v-icon icon="mdi-arrow-left" class="mr-2" />
      {{ t('results.back') }}
    </v-btn>

    <section class="results-hero mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold">
          {{ competitionIdFilter ? filteredCompetitionName : t('results.title') }}
        </h1>
        <p class="text-body-1 text-grey-darken-1 mt-2 mb-0">
          {{ competitionIdFilter ? t('results.subtitleFiltered') : t('results.subtitle') }}
        </p>
      </div>
    </section>

    <v-skeleton-loader v-if="isLoading" type="table" class="mb-6" />

    <v-alert v-else-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-else-if="trialsWithResultsSorted.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      {{ t('results.noResults') }}
    </v-alert>

    <div v-else class="results-groups">
      <section
        v-for="(trialGroup, index) in groupedTrialsByCompetition"
        :key="`comp-${index}`"
        class="competition-group"
      >
        <div class="competition-header mb-4">
          <div class="d-flex flex-wrap align-center justify-space-between ga-3">
            <div>
              <div class="text-overline section-label">
                {{ getChampionshipName(trialGroup.competition.championshipId) }}
              </div>
              <h3 class="text-h6 font-weight-bold mb-1">{{ trialGroup.competition.competitionName }}</h3>
              <p class="text-caption text-grey-darken-1 mb-0">
                {{ formatDateRange(trialGroup.competition.competitionStartDate, trialGroup.competition.competitionEndDate) }}
              </p>
            </div>
            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip size="small" color="info" variant="tonal" label>
                {{ trialGroup.trials.length }} {{ t('results.resultsLabel') }}
              </v-chip>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                :to="{ name: 'competition-details', params: { id: trialGroup.competition.competitionId } }"
              >
                <v-icon icon="mdi-arrow-top-right" class="mr-1" />
                {{ trialGroup.competition.competitionName }}
              </v-btn>
            </div>
          </div>
        </div>

        <v-row dense>
          <v-col
            v-for="trial in trialGroup.trials"
            :key="trial.trialId"
            cols="12"
            md="6"
            xl="4"
          >
            <PublicResultsTrialCard
              :trial="trial"
              :result="getTrialResultComputed(trial.trialId)"
              :round-label="t('results.roundLabel', { round: trial.roundNumber })"
              :formatted-date="formatTrialDate(trial.trialStartDate)"
              :status-label="t(`admin.competitionStatus.${trial.trialStatus}`)"
              :status-color="statusColor(trial.trialStatus)"
              :empty-label="t('results.noRankingsYet')"
              :get-participant-name="(participantId) => getAthleteNameById(participantId, trial.trialId)"
              :get-participant-route="(participantId) => getParticipantRoute(participantId, trial.trialId)"
            />
          </v-col>
        </v-row>
      </section>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import PublicResultsTrialCard from '@/components/results/PublicResultsTrialCard.vue'
import championshipService from '@/services/championshipService'
import resultService from '@/services/resultService'
import userService from '@/services/userService'
import teamService from '@/services/teamService'
import type { Competition, Trial } from '@/types/competition'
import type { Result } from '@/types/result'
import type { User } from '@/types/user'
import type { Team } from '@/types/team'
import { UserRole } from '@/types/user'
import { formatDateRange as formatDateRangeUtil } from '@/utils/date'

const { t, locale } = useI18n()
const route = useRoute()

const competitionIdFilter = computed(() => {
  const id = route.params.competitionId
  return id ? Number(id) : null
})

const filteredCompetitionName = computed(() => {
  if (!competitionIdFilter.value) return ''
  const comp = competitions.value.find(c => c.competitionId === competitionIdFilter.value)
  return comp ? comp.competitionName : t('results.title')
})

const isLoading = ref(false)
const errorMessage = ref('')
const competitions = ref<Competition[]>([])
const allTrials = ref<Trial[]>([])
const championships = ref<Map<number, string>>(new Map())
const athletes = ref<User[]>([])
const loadedTeams = ref<Team[]>([])
const allResults = ref<Result[]>([])

const formatDateRange = (start: string | Date, end: string | Date) =>
  formatDateRangeUtil(start, end, locale.value)

const formatTrialDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusColor = (status: string) => {
  if (status === 'COMPLETED') return 'success'
  if (status === 'ONGOING') return 'primary'
  if (status === 'PLANNED') return 'grey'
  return 'grey'
}


const getChampionshipName = (championshipId: number | undefined): string => {
  if (!championshipId) return ''
  return championships.value.get(championshipId) ?? ''
}


const resultsMap = computed(() => {
  const map = new Map<number, Result>()
  allResults.value.forEach((result) => {
    map.set(result.trialId, result)
  })
  return map
})

const getTrialResultComputed = (trialId: number): Result | undefined =>
  resultsMap.value.get(trialId)

const getAthleteNameById = (athleteId: number, trialId?: number): string => {
  const trial = allTrials.value.find(t => t.trialId === trialId)
  const competition = trial ? competitions.value.find(c => c.competitionId === trial.competitionId) : null

  if (competition?.participantType === 'TEAM') {
    const team = loadedTeams.value.find(t => t.teamId === athleteId)
    if (!team) return `Équipe #${athleteId}`

    const athleteNames = team.athletes
      .map(athlete => `${athlete.firstName} ${athlete.surname}`.trim())
      .join(', ')

    const athletesPart = athleteNames ? ` (${athleteNames})` : ''
    return `${team.name}${athletesPart}`
  }

  const athlete = athletes.value.find((a) => a.userId === athleteId)
  if (!athlete) return `#${athleteId}`
  return `${athlete.firstName} ${athlete.surname}`.trim()
}

const getParticipantRoute = (participantId: number, trialId?: number) => {
  const trial = allTrials.value.find(t => t.trialId === trialId)
  const competition = trial ? competitions.value.find(c => c.competitionId === trial.competitionId) : null

  if (competition?.participantType === 'TEAM') {
    return null
  }

  return { name: 'public-profile', params: { id: participantId } }
}

const loadData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [allCompetitions, allChampionships, allAthletes, allTeams] = await Promise.all([
      championshipService.getAllCompetitions(),
      championshipService.getAllChampionships(),
      userService.getUsersByRole(UserRole.ATHLETE),
      teamService.getAllTeams().catch(() => []),
    ])

    competitions.value = allCompetitions
    athletes.value = allAthletes
    loadedTeams.value = allTeams

    // Map championships by ID
    const chMap = new Map<number, string>()
    allChampionships.forEach((ch) => chMap.set(ch.id, ch.name))
    championships.value = chMap

    // Load all trials
    const trialsMap = new Map<number, Trial[]>()
    await Promise.all(
      allCompetitions.map(async (comp) => {
        try {
          const trials = await championshipService.getTrialsByCompetition(comp.competitionId!)
          trialsMap.set(comp.competitionId!, trials)
        } catch {
          trialsMap.set(comp.competitionId!, [])
        }
      }),
    )

    const allTrialsList: Trial[] = []
    trialsMap.forEach((trials) => allTrialsList.push(...trials))
    allTrials.value = allTrialsList

    // Load all results
    const allResultsList: Result[] = []
    await Promise.all(
      allTrialsList.map(async (trial) => {
        try {
          const result = await resultService.getResultByTrialId(trial.trialId)
          allResultsList.push(result)
        } catch {
          // No result for this trial
        }
      }),
    )
    allResults.value = allResultsList
  } catch (error) {
    console.error('Load results error:', error)
    errorMessage.value = t('results.loadError')
  } finally {
    isLoading.value = false
  }
}

const trialsWithResultsSorted = computed(() => {
  // Get all trials with results
  const trialsWithResults = new Set<number>()
  allResults.value.forEach((result) => {
    trialsWithResults.add(result.trialId)
  })

  const trials = allTrials.value.filter((t) => trialsWithResults.has(t.trialId))

  // Sort by end date of competition (most recent first), then by trial round and position
  return trials.sort((a, b) => {
    const compA = competitions.value.find((c) => c.competitionId === a.competitionId)
    const compB = competitions.value.find((c) => c.competitionId === b.competitionId)

    if (compA && compB) {
      const dateA = new Date(compA.competitionEndDate).getTime()
      const dateB = new Date(compB.competitionEndDate).getTime()
      if (dateA !== dateB) return dateB - dateA // Most recent first
    }

    // Same competition: sort by round and position
    if (a.competitionId === b.competitionId) {
      if (a.roundNumber !== b.roundNumber) return a.roundNumber - b.roundNumber
      return a.position - b.position
    }

    return 0
  })
})

const groupedTrialsByCompetition = computed(() => {
  const grouped: Array<{ competition: Competition; trials: Trial[] }> = []
  const competitionMap = new Map<number, Trial[]>()

  const trialsToGroup = competitionIdFilter.value
    ? trialsWithResultsSorted.value.filter(t => t.competitionId === competitionIdFilter.value)
    : trialsWithResultsSorted.value

  // Group trials by competition
  trialsToGroup.forEach((trial) => {
    if (!competitionMap.has(trial.competitionId)) {
      competitionMap.set(trial.competitionId, [])
    }
    competitionMap.get(trial.competitionId)!.push(trial)
  })

  // Create grouped array with competition info
  competitionMap.forEach((trials, competitionId) => {
    const competition = competitions.value.find((c) => c.competitionId === competitionId)
    if (competition) {
      grouped.push({ competition, trials })
    }
  })

  return grouped
})

onMounted(loadData)
</script>

<style scoped>
.results-hero {
  padding: 28px;
  border-radius: 30px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background:
    radial-gradient(circle at top left, rgba(25, 118, 210, 0.16), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 251, 0.96));
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
}

.back-button {
  border-color: rgba(25, 118, 210, 0.2);
}

.results-groups {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.competition-group {
  padding: 24px;
  border-radius: 26px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.04), rgba(255, 255, 255, 0.98) 140px),
    white;
}

.competition-header {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.section-label {
  color: rgb(25, 118, 210);
}
</style>
