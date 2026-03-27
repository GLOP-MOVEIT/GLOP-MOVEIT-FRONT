<template>
  <div>
    <section class="results-hero mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between ga-4">
        <div>
          <div class="text-overline section-label mb-1">{{ t('commissionerResults.title') }}</div>
          <h2 class="text-h4 font-weight-bold mb-2">{{ t('commissionerResults.title') }}</h2>
          <p class="text-body-2 text-grey-darken-1 mb-0">{{ t('commissionerResults.subtitle') }}</p>
        </div>

        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-value">{{ trialRows.length }}</span>
            <span class="hero-stat-label">{{ t('commissionerResults.trial') }}</span>
          </div>
        </div>
      </div>
    </section>

    <div v-if="isLoading" class="d-flex justify-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-else-if="trialRows.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      {{ t('commissionerResults.noTrials') }}
    </v-alert>

    <v-row v-else dense>
      <v-col
        v-for="row in trialRows"
        :key="row.trial.trialId"
        cols="12"
        md="6"
        xl="4"
      >
        <CommissionerResultsTrialCard
          :competition-name="row.competition.competitionName"
          :competition-type="getCompetitionTypeLabel(row.competition.competitionType)"
          :participant-type="t(`admin.participantType.${row.competition.participantType}`)"
          :trial-name="row.trial.trialName"
          :round-label="t('commissionerResults.roundLabel', { round: row.trial.roundNumber, position: row.trial.position })"
          :formatted-date="formatTrialDate(row.trial.trialStartDate)"
          :status-label="t(`admin.competitionStatus.${row.trial.trialStatus}`)"
          :status-color="statusColor(row.trial.trialStatus)"
          :manage-label="t('commissionerResults.manageResults')"
          :no-location-label="t('commissionerResults.noLocationAssigned')"
          :show-no-location="!row.trial.locationId"
          @manage="openResultDialog(row)"
        />
      </v-col>
    </v-row>

    <v-alert v-if="successMessage" type="success" variant="tonal" class="mt-4" closable @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>

    <v-dialog v-model="isDialogOpen" max-width="760" persistent>
      <v-card v-if="activeRow">
        <v-card-title class="pt-4 px-6">
          {{ t('commissionerResults.dialogTitle') }}
          <span class="text-body-2 text-grey-darken-1 ml-2">— {{ activeRow.trial.trialName }}</span>
        </v-card-title>

        <v-card-text class="px-6">
          <div v-if="isDialogLoading" class="d-flex justify-center py-6">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <template v-else>
            <v-alert v-if="dialogError" type="error" variant="tonal" class="mb-4">
              {{ dialogError }}
            </v-alert>

            <v-alert
              v-if="hasQualifiedParticipantsInTrial"
              type="warning"
              variant="tonal"
              class="mb-4"
              icon="mdi-lock"
            >
              {{ t('commissionerResults.resultsLocked') }}
            </v-alert>

            <v-checkbox
              v-model="editForm.lastTrial"
              :label="t('commissionerResults.lastTrial')"
              :disabled="hasQualifiedParticipantsInTrial || !activeRow?.trial.locationId"
              class="mb-2"
            />

            <v-alert
              v-if="editForm.rows.length === 0"
              type="warning"
              variant="tonal"
              class="mb-4"
            >
              {{ t('commissionerResults.noParticipants') }}
            </v-alert>

            <v-table v-else density="compact">
              <thead>
                <tr>
                  <th scope="col" style="width: 48px">#</th>
                  <th scope="col" class="text-left">{{ t('commissionerResults.participant') }}</th>
                  <th scope="col" class="text-left">{{ t('commissionerResults.score') }}</th>
                  <th scope="col" style="width: 100px">{{ t('commissionerResults.order') }}</th>
                  <th v-if="!editForm.lastTrial && activeRow?.trial.nextTrialId" scope="col" style="width: 100px">
                    {{ t('commissionerResults.qualify') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in editForm.rows" :key="row.id">
                  <td>
                    <v-chip color="primary" size="small" variant="tonal">{{ index + 1 }}</v-chip>
                  </td>
                  <td>
                    <RouterLink
                      v-if="activeRow?.competition.participantType !== 'TEAM'"
                      :to="{ name: 'public-profile', params: { id: row.id } }"
                      class="participant-link"
                    >
                      {{ getAthleteName(row.id) }}
                    </RouterLink>
                    <span v-else>{{ getAthleteName(row.id) }}</span>
                  </td>
                  <td>
                    <div class="d-flex align-center">
                      <v-text-field
                        v-model="row.scoreValue"
                        density="compact"
                        variant="outlined"
                        hide-details
                        class="my-1"
                        style="min-width: 120px"
                        :disabled="hasQualifiedParticipantsInTrial || hasNoLocation"
                      />
                      <span v-if="resultUnit" class="ml-2 text-body-2 text-grey-darken-1 text-no-wrap">
                        {{ resultUnit }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      :disabled="index === 0 || hasQualifiedParticipantsInTrial || hasNoLocation"
                      @click="moveUp(index)"
                    >
                      <v-icon>mdi-arrow-up</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      :disabled="index === editForm.rows.length - 1 || hasQualifiedParticipantsInTrial || hasNoLocation"
                      @click="moveDown(index)"
                    >
                      <v-icon>mdi-arrow-down</v-icon>
                    </v-btn>
                  </td>
                  <td v-if="!editForm.lastTrial && activeRow?.trial.nextTrialId">
                    <v-checkbox
                      v-model="row.qualified"
                      hide-details
                      density="compact"
                      :disabled="hasQualifiedParticipantsInTrial || hasNoLocation"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </template>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">{{ t('commissionerResults.cancel') }}</v-btn>
          <v-btn
            v-if="!editForm.lastTrial && activeRow?.trial.nextTrialId && hasQualifiedParticipants"
            color="success"
            variant="elevated"
            :loading="isAdvancing"
            :disabled="isDialogLoading || editForm.rows.length === 0 || hasNoLocation"
            @click="advanceQualified"
            class="mr-2"
          >
            <v-icon icon="mdi-arrow-right" class="mr-1" />
            {{ t('commissionerResults.advanceQualified') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="isSaving"
            :disabled="isDialogLoading || editForm.rows.length === 0 || hasQualifiedParticipantsInTrial || hasNoLocation || previousRoundMissingResults"
            @click="saveResult"
          >
            {{ t('commissionerResults.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import CommissionerResultsTrialCard from '@/components/results/CommissionerResultsTrialCard.vue'
import championshipService from '@/services/championshipService'
import resultService from '@/services/resultService'
import userService from '@/services/userService'
import teamService from '@/services/teamService'
import { Status, type Competition, type Trial } from '@/types/competition'
import type { User } from '@/types/user'
import { UserRole } from '@/types/user'
import type { Team } from '@/types/team'
import type { Ranking } from '@/types/result'

const { t } = useI18n()

interface TrialRow {
  competition: Competition
  trial: Trial
}

interface RankingRow {
  id: number
  scoreValue: string
  qualified?: boolean
}

interface EditForm {
  resultId?: number
  lastTrial: boolean
  rows: RankingRow[]
}

const stripUnit = (score: string, unit: string | null | undefined): string => {
  if (!unit || !score) return score ?? ''
  const suffix = ` ${unit}`
  return score.endsWith(suffix) ? score.slice(0, -suffix.length) : score
}

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const trialRows = ref<TrialRow[]>([])
const athletes = ref<User[]>([])
const loadedTeams = ref<Team[]>([])

const isDialogOpen = ref(false)
const isDialogLoading = ref(false)
const isSaving = ref(false)
const isAdvancing = ref(false)
const dialogError = ref('')
const activeRow = ref<TrialRow | null>(null)
const editForm = ref<EditForm>({ lastTrial: false, rows: [] })

const resultUnit = computed(() => activeRow.value?.competition.competitionResultUnit ?? null)

const hasQualifiedParticipants = computed(() =>
  editForm.value.rows.some((row) => row.qualified === true)
)

const hasQualifiedParticipantsInTrial = computed(() =>
  activeRow.value?.trial.qualifiedParticipantIds && activeRow.value.trial.qualifiedParticipantIds.length > 0
)

const hasNoLocation = computed(() => !activeRow.value?.trial.locationId)

const previousRoundMissingResults = ref(false)

const getPreviousRoundTrials = (currentTrial: Trial, allTrials: Trial[]): Trial[] => {
  const currentRound = currentTrial.roundNumber
  if (currentRound <= 1) return [] // Pas de manches précédentes pour la première manche

  return allTrials.filter((trial) => trial.roundNumber === currentRound - 1)
}

const canEnterResultsForTrial = async (trial: Trial, allTrials: Trial[]): Promise<boolean> => {
  const competition = trialRows.value.find((row) => row.trial.trialId === trial.trialId)?.competition
  if (!competition || competition.competitionType !== 'single_elimination') {
    return true
  }

  if (trial.roundNumber <= 1) {
    return true
  }

  const previousTrials = getPreviousRoundTrials(trial, allTrials)
  if (previousTrials.length === 0) return true

  for (const prevTrial of previousTrials) {
    try {
      const response = await resultService.getResultByTrialId(prevTrial.trialId!)
      if (!response || !response.rankings || response.rankings.length === 0) {
        return false
      }
    } catch {
      // Si on ne peut pas récupérer les résultats de la manche précédente, on bloque
      return false
    }
  }

  return true
}

const moveUp = (index: number) => {
  if (index === 0) return
  const rows = editForm.value.rows
  const moved = rows.splice(index, 1)[0]!
  rows.splice(index - 1, 0, moved)
}

const moveDown = (index: number) => {
  const rows = editForm.value.rows
  if (index === rows.length - 1) return
  const moved = rows.splice(index, 1)[0]!
  rows.splice(index + 1, 0, moved)
}

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
  if (status === Status.COMPLETED) return 'success'
  if (status === Status.ONGOING) return 'primary'
  if (status === Status.PLANNED) return 'grey'
  return 'grey'
}

const getCompetitionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'SINGLE_ELIMINATION': t('competitionType.singleElimination'),
    'ROUND_ROBIN': t('competitionType.roundRobin'),
    'HEATS': t('competitionType.heats'),
  }
  return labels[type] || type
}

const getAthleteName = (userId: number): string => {
  if (activeRow.value?.competition.participantType === 'TEAM') {
    const team = loadedTeams.value.find(t => t.teamId === userId)
    if (!team) return `Équipe #${userId}`

    const athleteNames = team.athletes
      .map(athlete => `${athlete.firstName} ${athlete.surname}`.trim())
      .join(', ')

    const athletesPart = athleteNames ? ` (${athleteNames})` : ''
    return `${team.name}${athletesPart}`
  }

  const athlete = athletes.value.find((a) => a.userId === userId)
  if (!athlete) return `#${userId}`
  return `${athlete.firstName} ${athlete.surname}`.trim()
}

const loadData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [allCompetitions, allAthletes, allTeams] = await Promise.all([
      championshipService.getAllCompetitions(),
      userService.getUsersByRole(UserRole.ATHLETE),
      teamService.getAllTeams().catch(() => []),
    ])
    athletes.value = allAthletes
    loadedTeams.value = allTeams

    const now = new Date()

    const activeCompetitions = allCompetitions.filter(
      (c) => c.competitionStatus !== Status.CANCELLED,
    )

    const trialsByComp = await Promise.all(
      activeCompetitions.map((comp) =>
        championshipService
          .getTrialsByCompetition(comp.competitionId!)
          .then((trials) => ({ comp, trials }))
          .catch(() => ({ comp, trials: [] as Trial[] })),
      ),
    )

    const rows: TrialRow[] = []
    for (const { comp, trials } of trialsByComp) {
      for (const trial of trials) {
        const hasStarted = trial.trialStartDate && new Date(trial.trialStartDate) <= now
        const isCompleted = trial.trialStatus === Status.COMPLETED
        if (trial.trialStatus !== Status.CANCELLED && (hasStarted || isCompleted)) {
          rows.push({ competition: comp, trial })
        }
      }
    }
    trialRows.value = rows
  } catch (error) {
    console.error('Load results error:', error)
    errorMessage.value = t('commissionerResults.loadError')
  } finally {
    isLoading.value = false
  }
}

const openResultDialog = async (row: TrialRow) => {
  activeRow.value = row
  isDialogOpen.value = true
  isDialogLoading.value = true
  dialogError.value = ''
  editForm.value = { lastTrial: false, rows: [] }
  previousRoundMissingResults.value = false

  try {
    const canEnter = await canEnterResultsForTrial(row.trial, trialRows.value.map((r) => r.trial))
    if (!canEnter) {
      previousRoundMissingResults.value = true
      dialogError.value = t('commissionerResults.previousRoundMissingResults')
    }

    const existing = await resultService.getResultByTrialId(row.trial.trialId!)
    const unit = row.competition.competitionResultUnit ?? null
    // Sort by position ascending to restore saved order
    const sorted = [...existing.rankings].sort((a, b) => a.position - b.position)
    editForm.value = {
      resultId: existing.resultId,
      lastTrial: existing.lastTrial,
      rows: sorted.map((r) => ({ id: r.id, scoreValue: stripUnit(r.score, unit) })),
    }
  } catch {
    // No result yet — initialize rows from trial participants
    const participantIds = (row.trial.participantIds ?? [])
      .filter((id): id is number => typeof id === 'number')

    editForm.value = {
      lastTrial: false,
      rows: participantIds.map((id) => ({
        id,
        scoreValue: ''
      })),
    }
  } finally {
    isDialogLoading.value = false
  }
}

const closeDialog = () => {
  isDialogOpen.value = false
  activeRow.value = null
  editForm.value = { lastTrial: false, rows: [] }
  dialogError.value = ''
}

const advanceQualified = async () => {
  if (!activeRow.value) return
  isAdvancing.value = true
  dialogError.value = ''
  try {
    const qualifiedIds = editForm.value.rows
      .filter((row) => row.qualified === true)
      .map((row) => row.id)

    if (qualifiedIds.length === 0) {
      dialogError.value = t('commissionerResults.noQualifiedSelected')
      return
    }

    await championshipService.advanceQualifiedParticipants(activeRow.value.trial.trialId!, qualifiedIds)
    successMessage.value = t('commissionerResults.advanceSuccess')
    closeDialog()
    // Reload data to show the updated trials
    await loadData()
  } catch (error) {
    console.error('Advance qualified error:', error)
    dialogError.value = t('commissionerResults.advanceError')
  } finally {
    isAdvancing.value = false
  }
}

const saveResult = async () => {
  if (!activeRow.value) return
  isSaving.value = true
  dialogError.value = ''
  try {
    const unit = activeRow.value.competition.competitionResultUnit
    const rankings: Ranking[] = editForm.value.rows.map((row, index) => ({
      id: row.id,
      position: index + 1,
      score: unit && row.scoreValue ? `${row.scoreValue} ${unit}` : row.scoreValue,
    }))
    const payload = {
      resultId: editForm.value.resultId,
      trialId: activeRow.value.trial.trialId!,
      lastTrial: editForm.value.lastTrial,
      rankings,
    }
    if (editForm.value.resultId) {
      await resultService.updateResult(payload)
    } else {
      await resultService.saveResult(payload)
    }

    // Update trial status to COMPLETED with all fields
    const trialId = activeRow.value.trial.trialId
    if (!trialId) throw new Error('Trial ID is missing')

    const trial = activeRow.value.trial
    await championshipService.updateTrial(trialId, {
      trialName: trial.trialName,
      trialStartDate: trial.trialStartDate,
      trialEndDate: trial.trialEndDate,
      trialDescription: trial.trialDescription,
      trialStatus: Status.COMPLETED,
      locationId: trial.locationId,
      roundNumber: trial.roundNumber,
      position: trial.position,
      nextTrialId: trial.nextTrialId,
      competitionId: trial.competitionId,
      participantIds: trial.participantIds,
    })

    successMessage.value = t('commissionerResults.saveSuccess')
    closeDialog()
    // Reload data to show the updated trials
    await loadData()
  } catch (error) {
    console.error('Save result error:', error)
    dialogError.value = t('commissionerResults.saveError')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadData()
})
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

.section-label {
  color: rgb(25, 118, 210);
}

.hero-stats {
  display: flex;
  gap: 12px;
}

.hero-stat {
  min-width: 130px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(25, 118, 210, 0.12);
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  flex-direction: column;
}

.hero-stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: rgb(15, 23, 42);
}

.hero-stat-label {
  font-size: 0.78rem;
  color: rgba(15, 23, 42, 0.65);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.participant-link {
  color: rgb(25, 118, 210);
  text-decoration: none;
  font-weight: 600;
}

.participant-link:hover {
  text-decoration: underline;
}
</style>
