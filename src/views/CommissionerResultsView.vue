<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-trophy" size="32" color="primary" class="mr-2" />
        <div>
          <h2 class="text-h5 font-weight-bold">{{ t('commissionerResults.title') }}</h2>
          <p class="text-body-2 text-grey-darken-1">{{ t('commissionerResults.subtitle') }}</p>
        </div>
      </div>
    </div>

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

    <v-table v-else>
      <thead>
        <tr>
          <th scope="col" class="text-left">{{ t('commissionerResults.competition') }}</th>
          <th scope="col" class="text-left">{{ t('commissionerResults.trial') }}</th>
          <th scope="col" class="text-left">{{ t('commissionerResults.round') }}</th>
          <th scope="col" class="text-left">{{ t('commissionerResults.date') }}</th>
          <th scope="col" class="text-left">{{ t('commissionerResults.status') }}</th>
          <th scope="col" class="text-left">{{ t('commissionerResults.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in trialRows" :key="row.trial.trialId">
          <td>{{ row.competition.competitionName }}</td>
          <td>{{ row.trial.trialName }}</td>
          <td>{{ t('commissionerResults.roundLabel', { round: row.trial.roundNumber, position: row.trial.position }) }}</td>
          <td>{{ formatTrialDate(row.trial.trialStartDate) }}</td>
          <td>
            <v-chip
              :color="statusColor(row.trial.trialStatus)"
              variant="tonal"
              size="small"
              label
            >
              {{ t(`admin.competitionStatus.${row.trial.trialStatus}`) }}
            </v-chip>
          </td>
          <td>
            <div v-if="!row.trial.locationId" class="text-caption text-warning">
              <v-icon size="16" class="mr-1">mdi-alert-circle-outline</v-icon>
              {{ t('commissionerResults.noLocationAssigned') }}
            </div>
            <v-btn
              v-else
              size="small"
              color="primary"
              variant="outlined"
              @click="openResultDialog(row)"
            >
              {{ t('commissionerResults.manageResults') }}
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

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
                  <td>{{ getAthleteName(row.id) }}</td>
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

const getAthleteName = (userId: number): string => {
  if (activeRow.value?.competition.participantType === 'TEAM') {
    const team = loadedTeams.value.find(t => t.teamId === userId)
    if (!team) return `Équipe #${userId}`

    const athleteNames = team.athletes
      .map(athlete => `${athlete.firstName} ${athlete.surname}`.trim())
      .join(', ')

    return `${team.name}${athleteNames ? ` (${athleteNames})` : ''}`
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
    if (editForm.value.resultId !== undefined) {
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
