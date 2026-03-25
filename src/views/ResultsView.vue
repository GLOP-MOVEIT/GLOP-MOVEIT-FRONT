<template>
  <v-container class="py-8">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <v-btn variant="text" to="/" class="text-none">
          <v-icon icon="mdi-arrow-left" class="mr-2" />
          {{ t('results.back') }}
        </v-btn>
        <h1 class="text-h4 font-weight-bold mt-4">
          {{ competitionIdFilter ? filteredCompetitionName : t('results.title') }}
        </h1>
        <p class="text-body-1 text-grey-darken-1 mt-2">
          {{ competitionIdFilter ? t('results.subtitleFiltered') : t('results.subtitle') }}
        </p>
      </div>
    </div>

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

    <div v-else class="space-y-4">
      <div
        v-for="(trialGroup, index) in groupedTrialsByCompetition"
        :key="`comp-${index}`"
        class="mb-8"
      >
        <div class="mb-4 pb-3 border-bottom">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h3 class="text-h6 font-weight-bold">{{ trialGroup.competition.competitionName }}</h3>
              <p class="text-caption text-grey-darken-1 mt-1">
                {{ getChampionshipName(trialGroup.competition.championshipId) }}
                • {{ formatDateRange(trialGroup.competition.competitionStartDate, trialGroup.competition.competitionEndDate) }}
              </p>
            </div>
            <v-chip
              size="small"
              color="info"
              variant="tonal"
              label
            >
              {{ trialGroup.trials.length }} {{ t('results.resultsLabel') }}
            </v-chip>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="trial in trialGroup.trials"
            :key="trial.trialId"
            class="border rounded-lg pa-4"
          >
            <div class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="text-subtitle-2 font-weight-medium">{{ trial.trialName }}</div>
                <div class="text-caption text-grey-darken-1">
                  {{ t('results.roundLabel', { round: trial.roundNumber }) }} —
                  {{ formatTrialDate(trial.trialStartDate) }}
                </div>
              </div>
              <v-chip
                size="small"
                :color="statusColor(trial.trialStatus)"
                variant="tonal"
                label
              >
                {{ t(`admin.competitionStatus.${trial.trialStatus}`) }}
              </v-chip>
            </div>

            <v-divider class="my-3" />

            <div v-if="getTrialResultComputed(trial.trialId)">
              <div class="text-caption font-weight-medium mb-2">{{ t('results.rankings') }}:</div>
              <v-table density="compact" class="text-caption">
                <thead>
                  <tr>
                    <th class="text-left">{{ t('results.position') }}</th>
                    <th class="text-left">{{ t('results.participant') }}</th>
                    <th class="text-left">{{ t('results.score') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="ranking in getTrialResultComputed(trial.trialId)?.rankings"
                    :key="ranking.id"
                  >
                    <td>
                      <v-chip size="small" color="primary" variant="tonal" label>
                        {{ ranking.position }}
                      </v-chip>
                    </td>
                    <td>{{ getAthleteNameById(ranking.id, trial.trialId) }}</td>
                    <td>{{ ranking.score }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div v-else class="text-caption text-grey-darken-1">
              {{ t('results.noRankingsYet') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
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

// Récupérer le competitionId depuis les params de la route (optionnel)
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

    return `${team.name}${athleteNames ? ` (${athleteNames})` : ''}`
  }

  const athlete = athletes.value.find((a) => a.userId === athleteId)
  if (!athlete) return `#${athleteId}`
  return `${athlete.firstName} ${athlete.surname}`.trim()
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
.space-y-4 > * + * {
  margin-top: 1rem;
}

.border {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>

