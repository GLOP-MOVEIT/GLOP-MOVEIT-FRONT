<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-4">
      <div>
        <div class="text-overline mb-1">{{ t('commissionerCompetition.title') }}</div>
        <h2 class="text-h5 font-weight-bold">{{ competition?.competitionName ?? t('commissionerCompetition.subtitle') }}</h2>
        <div v-if="competition" class="text-body-2 text-grey-darken-1">
          {{ formatDateRange(competition.competitionStartDate, competition.competitionEndDate) }}
        </div>
      </div>

      <v-btn
        v-if="championshipDetailsId"
        variant="text"
        color="primary"
        :to="{ name: 'championship-details', params: { id: championshipDetailsId } }"
      >
        <v-icon icon="mdi-arrow-left" class="mr-1" />
        {{ t('commissionerCompetition.backToChampionship') }}
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="infoMessage" type="info" variant="tonal" class="mb-4">
      {{ infoMessage }}
    </v-alert>

    <v-skeleton-loader v-if="isLoading" type="card, list-item-three-line" />

    <template v-else-if="competition">
      <v-row dense>
        <v-col cols="12" md="7">
          <v-card variant="outlined" class="pa-4 mb-4">
            <div class="text-subtitle-1 font-weight-medium mb-3">{{ t('commissionerCompetition.detailsTitle') }}</div>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <v-chip color="primary" variant="tonal">{{ competition.competitionSport }}</v-chip>
              <v-chip color="secondary" variant="tonal">{{ competition.competitionType }}</v-chip>
              <v-chip color="info" variant="tonal">{{ t(`admin.participantType.${competition.participantType}`) }}</v-chip>
              <v-chip :color="statusColor(competition.competitionStatus)" variant="tonal">
                {{ t(`admin.competitionStatus.${competition.competitionStatus}`) }}
              </v-chip>
            </div>

            <div class="text-body-2 text-grey-darken-1 mb-2">
              {{ competition.competitionDescription || t('championshipDetails.noDescription') }}
            </div>

            <div class="d-flex flex-wrap gap-4 text-caption text-grey-darken-2">
              <span>
                <v-icon size="14" class="mr-1">mdi-repeat</v-icon>
                {{ competition.nbManches }} {{ t('championshipDetails.rounds') }}
              </span>
              <span>
                <v-icon size="14" class="mr-1">mdi-account-multiple</v-icon>
                {{ competition.maxPerHeat }} {{ t('championshipDetails.perHeat') }}
              </span>
            </div>
          </v-card>

          <v-card variant="outlined" class="pa-4 mb-4">
            <div class="d-flex flex-wrap align-center justify-space-between mb-3">
              <div>
                <div class="text-subtitle-1 font-weight-medium">{{ t('commissionerCompetition.athletesTitle') }}</div>
                <div class="text-caption text-grey-darken-1">
                  {{ t('commissionerCompetition.athletesSubtitle') }}
                </div>
              </div>

              <v-btn color="primary" variant="outlined" @click="isAthleteDialogOpen = true">
                <v-icon icon="mdi-account-plus" class="mr-1" />
                {{ t('commissionerCompetition.addAthletes') }}
              </v-btn>
            </div>

            <div v-if="selectedAthletes.length === 0" class="text-body-2 text-grey-darken-1 mb-4">
              {{ t('commissionerCompetition.noAthletesSelected') }}
            </div>

            <div v-else class="d-flex flex-wrap gap-2 mb-4">
              <v-chip
                v-for="athlete in selectedAthletes"
                :key="athlete.userId"
                color="primary"
                variant="tonal"
                closable
                @click:close="removeAthlete(athlete.userId)"
              >
                {{ getUserDisplayName(athlete) }}
              </v-chip>
            </div>

            <v-btn
              color="success"
              :loading="isGeneratingTree"
              :disabled="selectedAthleteIds.length === 0"
              @click="generateTree"
            >
              <v-icon icon="mdi-source-branch" class="mr-1" />
              {{ t('commissionerCompetition.generateTree') }}
            </v-btn>
          </v-card>

          <v-card variant="outlined" class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="text-subtitle-1 font-weight-medium">{{ t('commissionerCompetition.trialsTitle') }}</div>
              <v-chip color="primary" variant="tonal" size="small">{{ trials.length }}</v-chip>
            </div>

            <div v-if="trials.length === 0" class="text-body-2 text-grey-darken-1">
              {{ t('commissionerCompetition.noTrials') }}
            </div>

            <v-list v-else lines="three" density="comfortable">
              <v-list-item v-for="trial in trials" :key="trial.trialId" class="rounded-lg mb-2 border-sm">
                <template #title>
                  <div class="d-flex flex-wrap align-center justify-space-between gap-2">
                    <span class="font-weight-medium">{{ trial.trialName }}</span>
                    <v-chip size="x-small" :color="statusColor(trial.trialStatus)" variant="tonal">
                      {{ t(`admin.competitionStatus.${trial.trialStatus}`) }}
                    </v-chip>
                  </div>
                </template>

                <template #subtitle>
                  <div class="d-flex flex-column text-caption text-grey-darken-2 mt-2 gap-1">
                    <span>{{ formatDateRange(trial.trialStartDate, trial.trialEndDate) }}</span>
                    <span>
                      {{ t('commissionerCompetition.trialRoundLabel', { round: trial.roundNumber, position: trial.position }) }}
                    </span>
                    <span>
                      {{ t('commissionerCompetition.trialParticipantsLabel') }}
                      {{ formatParticipantNames(trial.participantIds) }}
                    </span>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="5">
          <v-card variant="outlined" class="pa-4">
            <div class="text-subtitle-1 font-weight-medium mb-3">{{ t('commissionerCompetition.selectionSummaryTitle') }}</div>
            <div class="text-body-2 text-grey-darken-1 mb-2">
              {{ t('commissionerCompetition.selectionCount', { count: selectedAthleteIds.length }) }}
            </div>
            <div class="text-body-2 text-grey-darken-1">
              {{ t('commissionerCompetition.realAthletesNotice') }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-dialog v-model="isAthleteDialogOpen" max-width="720">
        <v-card>
          <v-card-title>{{ t('commissionerCompetition.dialogTitle') }}</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="athleteSearch"
              :label="t('commissionerCompetition.searchAthletes')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="mb-4"
            />

            <div v-if="filteredAthletes.length === 0" class="text-body-2 text-grey-darken-1">
              {{ t('commissionerCompetition.noAthletesFound') }}
            </div>

            <v-list v-else density="comfortable">
              <v-list-item
                v-for="athlete in filteredAthletes"
                :key="athlete.userId"
                @click="toggleAthleteSelection(athlete.userId)"
              >
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="selectedAthleteIds.includes(athlete.userId)"
                    @click.stop="toggleAthleteSelection(athlete.userId)"
                  />
                </template>

                <template #title>
                  {{ getUserDisplayName(athlete) }}
                </template>

                <template #subtitle>
                  <span>{{ athlete.email }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isAthleteDialogOpen = false">{{ t('commissionerCompetition.closeDialog') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import championshipService from '@/services/championshipService'
import userService from '@/services/userService'
import type { CompetitionTreeResult, Trial } from '@/types/competition'
import { Status } from '@/types/competition'
import type { User } from '@/types/user'
import { getUserDisplayName, UserRole } from '@/types/user'
import { formatDateRange } from '@/utils/date'
import { isAxiosError } from 'axios'

const route = useRoute()
const { t } = useI18n()

const competition = ref<CompetitionTreeResult | null>(null)
const athletes = ref<User[]>([])
const trials = ref<Trial[]>([])
const selectedAthleteIds = ref<number[]>([])
const athleteSearch = ref('')
const errorMessage = ref('')
const infoMessage = ref('')
const isLoading = ref(false)
const isGeneratingTree = ref(false)
const isAthleteDialogOpen = ref(false)

const competitionId = computed(() => Number(route.params.id))
const championshipDetailsId = computed(() => competition.value?.championshipId ?? competition.value?.championship?.id ?? null)
const filteredAthletes = computed(() => {
  const query = athleteSearch.value.trim().toLowerCase()

  if (!query) {
    return athletes.value
  }

  return athletes.value.filter((athlete) => {
    const fullName = getUserDisplayName(athlete).toLowerCase()
    return fullName.includes(query) || athlete.email.toLowerCase().includes(query)
  })
})
const selectedAthletes = computed(() => athletes.value.filter((athlete) => selectedAthleteIds.value.includes(athlete.userId)))

const statusColor = (status: Status) => {
  if (status === Status.PLANNED) return 'grey'
  if (status === Status.ONGOING) return 'primary'
  if (status === Status.COMPLETED) return 'success'
  if (status === Status.CANCELLED) return 'error'
  return 'primary'
}

const extractApiErrorMessage = (err: unknown, fallback: string) => {
  if (!isAxiosError(err)) {
    return fallback
  }

  const data = err.response?.data as unknown

  if (typeof data === 'string' && data.trim().length > 0) {
    return data
  }

  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}

const toggleAthleteSelection = (athleteId: number) => {
  if (selectedAthleteIds.value.includes(athleteId)) {
    selectedAthleteIds.value = selectedAthleteIds.value.filter((id) => id !== athleteId)
    return
  }

  selectedAthleteIds.value = [...selectedAthleteIds.value, athleteId]
}

const removeAthlete = (athleteId: number) => {
  selectedAthleteIds.value = selectedAthleteIds.value.filter((id) => id !== athleteId)
}

const formatParticipantNames = (participantIds: number[]) => {
  if (participantIds.length === 0) {
    return t('commissionerCompetition.noParticipantsInTrial')
  }

  return participantIds
    .map((participantId) => athletes.value.find((athlete) => athlete.userId === participantId))
    .map((athlete, index) => athlete ? getUserDisplayName(athlete) : `#${participantIds[index]}`)
    .join(', ')
}

const loadCompetition = async () => {
  competition.value = await championshipService.getCompetitionById(competitionId.value)
}

const loadAthletes = async () => {
  athletes.value = await userService.getUsersByRole(UserRole.ATHLETE)
}

const loadTrials = async () => {
  try {
    trials.value = await championshipService.getTrialsByCompetition(competitionId.value)
  } catch {
    trials.value = []
  }
}

const generateTree = async () => {
  if (!competition.value || selectedAthleteIds.value.length === 0) {
    return
  }

  isGeneratingTree.value = true
  errorMessage.value = ''
  infoMessage.value = ''

  try {
    competition.value = await championshipService.generateCompetitionTree(
      competition.value.competitionId,
      selectedAthleteIds.value,
    )
    await loadTrials()
  } catch (err) {
    const fallback = t('commissionerCompetition.generateError')
    const apiMessage = extractApiErrorMessage(err, fallback)
    errorMessage.value = apiMessage
  } finally {
    isGeneratingTree.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await Promise.all([loadCompetition(), loadAthletes()])
    await loadTrials()
  } catch {
    errorMessage.value = t('commissionerCompetition.loadError')
  } finally {
    isLoading.value = false
  }
})
</script>
