<template>
  <div>
    <section v-if="competition" class="competition-hero mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between ga-4">
        <div>
          <div class="text-overline section-label mb-1">{{ t('commissionerCompetition.title') }}</div>
          <h2 class="text-h4 font-weight-bold">{{ competition.competitionName }}</h2>
          <div class="text-body-2 text-grey-darken-1 mt-2">
            {{ formatDateRange(competition.competitionStartDate, competition.competitionEndDate) }}
          </div>
          <div class="d-flex flex-wrap ga-2 mt-3">
            <v-chip color="primary" variant="tonal">{{ getSportLabel(competition.competitionSport) }}</v-chip>
            <v-chip color="secondary" variant="tonal">{{ getCompetitionTypeLabel(competition.competitionType) }}</v-chip>
            <v-chip color="info" variant="tonal">{{ t(`admin.participantType.${competition.participantType}`) }}</v-chip>
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
    </section>

    <div v-else class="d-flex flex-wrap align-center justify-space-between mb-4">
      <div>
        <div class="text-overline mb-1">{{ t('commissionerCompetition.title') }}</div>
        <h2 class="text-h5 font-weight-bold">{{ t('commissionerCompetition.subtitle') }}</h2>
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

    <v-alert v-if="hasExistingResults" type="warning" variant="tonal" class="mb-4" icon="mdi-lock">
      {{ t('commissionerCompetition.resultsExistWarning') }}
    </v-alert>

    <v-skeleton-loader v-if="isLoading" type="card, list-item-three-line" />

    <template v-else-if="competition">
      <v-row dense>
        <v-col cols="12" md="7">
          <v-card variant="outlined" class="pa-4 mb-4">
            <div class="text-subtitle-1 font-weight-medium mb-3">{{ t('commissionerCompetition.detailsTitle') }}</div>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <v-chip color="primary" variant="tonal">{{ getSportLabel(competition.competitionSport) }}</v-chip>
              <v-chip color="secondary" variant="tonal">{{ getCompetitionTypeLabel(competition.competitionType) }}</v-chip>
              <v-chip color="info" variant="tonal">{{ t(`admin.participantType.${competition.participantType}`) }}</v-chip>
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

              <v-btn
                v-if="competition?.participantType === 'INDIVIDUAL'"
                color="primary"
                variant="outlined"
                :disabled="hasExistingResults"
                @click="isAthleteDialogOpen = true"
              >
                <v-icon icon="mdi-account-plus" class="mr-1" />
                {{ t('commissionerCompetition.addAthletes') }}
              </v-btn>

              <v-btn
                v-else
                color="primary"
                variant="outlined"
                :disabled="hasExistingResults"
                @click="isTeamManagementDialogOpen = true"
              >
                <v-icon icon="mdi-account-group-outline" class="mr-1" />
                {{ t('commissionerCompetition.manageTeams') }}
              </v-btn>
            </div>

            <div v-if="competition?.participantType === 'INDIVIDUAL'">
              <AthleteSelectionDisplay
                :selected-athlete-ids="selectedAthleteIds"
                :athletes="athletes"
                @remove="removeAthlete"
              />
            </div>

            <div v-else>
              <div v-if="managedTeams.length > 0">
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="team in managedTeams"
                    :key="team.teamId"
                    closable
                    color="primary"
                    variant="tonal"
                    :disabled="hasExistingResults"
                    @click:close="removeTeamFromManaged(team.teamId!)"
                  >
                    <v-icon icon="mdi-account-group" class="mr-1" size="small" />
                    {{ team.name }} ({{ team.athletes.length }} {{ t('commissionerCompetition.athletesLabel') }})
                  </v-chip>
                </div>
              </div>
              <TeamSelectionDisplay
                v-else
                :teams="teams"
                :athletes="athletes"
                @removeTeam="removeTeam"
                @removeAthleteFromTeam="removeAthleteFromTeamDisplay"
              />
            </div>

            <v-btn
              color="success"
              :loading="isGeneratingTree"
              :disabled="(competition?.participantType === 'TEAM' ? (managedTeams.length === 0 && teams.length === 0) : selectedAthleteIds.length === 0) || hasExistingResults"
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

            <div v-else>
              <v-card
                v-for="trial in trials"
                :key="trial.trialId"
                class="rounded-xl mb-3 pa-4 trial-card"
                variant="outlined"
              >
                <div class="d-flex align-start gap-4">
                  <div class="flex-grow-1">
                    <div class="d-flex flex-wrap align-center gap-2 mb-2">
                      <span class="font-weight-medium text-body-1">{{ trial.trialName }}</span>
                      <v-chip
                        :color="isTrialReady(trial) ? 'success' : 'warning'"
                        :prepend-icon="isTrialReady(trial) ? 'mdi-check-circle' : 'mdi-alert-circle-outline'"
                        size="small"
                        variant="tonal"
                      >
                        {{ isTrialReady(trial) ? t('commissionerCompetition.trialReady') : t('commissionerCompetition.trialNotReady') }}
                      </v-chip>
                      <v-chip size="small" :color="statusColor(trial.trialStatus)" variant="tonal">
                        {{ t(`admin.competitionStatus.${trial.trialStatus}`) }}
                      </v-chip>
                    </div>
                    <div class="d-flex flex-column text-caption text-grey-darken-2 gap-1">
                      <span>
                        <v-icon size="13" class="mr-1">mdi-calendar-range</v-icon>
                        {{ formatDateRange(trial.trialStartDate, trial.trialEndDate) }}
                      </span>
                      <span>
                        <v-icon size="13" class="mr-1">mdi-clock-outline</v-icon>
                        {{ formatTimeRange(trial.trialStartDate, trial.trialEndDate) }}
                      </span>
                      <span>
                        <v-icon size="13" class="mr-1">mdi-counter</v-icon>
                        {{ t('commissionerCompetition.trialRoundLabel', { round: trial.roundNumber, position: trial.position }) }}
                      </span>
                      <span v-if="trial.locationId">
                        <v-icon size="13" class="mr-1">mdi-map-marker</v-icon>
                        {{ getLocationName(trial.locationId) }}
                      </span>
                      <span>
                        <v-icon size="13" class="mr-1">mdi-account-group</v-icon>
                        {{ t('commissionerCompetition.trialParticipantsLabel') }}
                        {{ formatParticipantNames(trial.participantIds) }}
                      </span>
                    </div>
                  </div>
                  <div class="d-flex flex-column flex-shrink-0 trial-actions">
                    <v-btn
                      variant="outlined"
                      color="primary"
                      prepend-icon="mdi-calendar-clock"
                      block
                      @click="openDateDialog(trial)"
                    >
                      {{ t('commissionerCompetition.editDateTitle') }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="secondary"
                      prepend-icon="mdi-map-marker"
                      block
                      @click="openLocationDialog(trial)"
                    >
                      {{ t('commissionerCompetition.editLocationTitle') }}
                    </v-btn>
                    <v-btn
                      v-if="trial.locationId"
                      variant="outlined"
                      color="info"
                      prepend-icon="mdi-directions"
                      block
                      @click="openMapItinerary(trial.locationId)"
                    >
                      {{ t('common.itinerary') }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="warning"
                      prepend-icon="mdi-crosshairs-gps"
                      block
                      @click="openTrialLocationDialog(trial)"
                    >
                      {{ t('commissionerCompetition.locateTrialAction') }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="success"
                      prepend-icon="mdi-clipboard-list-outline"
                      block
                      @click="navigateToTrialTasks(trial)"
                    >
                      {{ t('trialTasks.title') }}
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="5">
          <v-card variant="outlined" class="pa-4">
            <div class="text-subtitle-1 font-weight-medium mb-3">{{ t('commissionerCompetition.selectionSummaryTitle') }}</div>
            <template v-if="competition?.participantType === 'TEAM'">
              <div v-if="managedTeams.length > 0">
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  {{ t('commissionerCompetition.teamsCount', { count: managedTeams.length }) }}
                </div>
                <div class="text-caption text-grey-darken-2 space-y-1">
                  <div v-for="team in managedTeams" :key="team.teamId">
                    {{ team.name }}: {{ team.athletes.length }} {{ t('commissionerCompetition.athletesLabel') }}
                  </div>
                </div>
              </div>
              <div v-else-if="teams.length > 0">
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  {{ t('commissionerCompetition.teamsCount', { count: teams.length }) }}
                </div>
                <div class="text-caption text-grey-darken-2 space-y-1">
                  <div v-for="(team, idx) in teams" :key="idx">
                    {{ t('commissionerCompetition.teamNumber', { number: idx + 1 }) }}: {{ team.length }} {{ t('commissionerCompetition.athletesLabel') }}
                  </div>
                </div>
              </div>
              <div v-else class="text-body-2 text-grey-darken-1">
                {{ t('commissionerCompetition.noTeamsSelected') }}
              </div>
            </template>
            <template v-else>
              <div class="text-body-2 text-grey-darken-1 mb-2">
                {{ t('commissionerCompetition.selectionCount', { count: selectedAthleteIds.length }) }}
              </div>
            </template>
          </v-card>
        </v-col>
      </v-row>

      <AthleteSelectionDialog
        v-if="competition?.participantType === 'INDIVIDUAL'"
        :is-open="isAthleteDialogOpen"
        :selected-athlete-ids="selectedAthleteIds"
        :athlete-search="athleteSearch"
        :athletes="athletes"
        @update:is-open="isAthleteDialogOpen = $event"
        @update:selected-athlete-ids="selectedAthleteIds = $event"
        @update:athlete-search="athleteSearch = $event"
      />

      <TeamSelectionDialog
        v-else-if="competition?.participantType === 'TEAM'"
        :is-open="isAthleteDialogOpen"
        :teams="teams"
        :team-searches="teamSearches"
        :athletes="athletes"
        @update:is-open="isAthleteDialogOpen = $event"
        @update:teams="teams = $event"
        @update:team-searches="teamSearches = $event"
      />

      <TeamManagementDialog
        v-if="competition?.participantType === 'TEAM'"
        :is-open="isTeamManagementDialogOpen"
        :teams="managedTeams"
        :athletes="athletes"
        @update:is-open="isTeamManagementDialogOpen = $event"
        @update:teams="managedTeams = $event"
      />

      <TrialParticipantsLocationDialog
        v-model="isTrialLocationDialogOpen"
        :trial-name="trialLocationDialogTrialName"
        :athletes="trialLocations?.athletes ?? []"
        :volunteers="trialLocations?.volunteers ?? []"
        :is-loading="isLoadingTrialLocations"
        :error="trialLocationError"
      />

      <v-dialog v-model="isDateDialogOpen" max-width="500">
        <v-card>
          <v-card-title>
            <v-icon icon="mdi-calendar-clock" class="mr-2" />
            {{ t('commissionerCompetition.editDateTitle') }}
          </v-card-title>
          <v-card-text>
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">{{ t('commissionerCompetition.trialStartDate') }}</div>
              <v-row dense>
                <v-col cols="7">
                  <v-text-field
                    v-model="editDateForm.startDate"
                    type="date"
                    label="Date"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    v-model="editDateForm.startTime"
                    type="time"
                    label="Heure"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
              </v-row>
            </div>
            <div>
              <div class="text-subtitle-2 mb-2">{{ t('commissionerCompetition.trialEndDate') }}</div>
              <v-row dense>
                <v-col cols="7">
                  <v-text-field
                    v-model="editDateForm.endDate"
                    type="date"
                    label="Date"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    v-model="editDateForm.endTime"
                    type="time"
                    label="Heure"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
              </v-row>
            </div>
            <v-alert v-if="dateOrderError" type="error" variant="tonal" class="mt-3" density="compact">
              {{ t('commissionerCompetition.dateOrderError') }}
            </v-alert>
            <v-alert v-if="dateOutOfRangeError" type="error" variant="tonal" class="mt-3" density="compact">
              {{ t('commissionerCompetition.dateOutOfRangeError', {
                start: formatDate(competition.competitionStartDate),
                end: formatDate(competition.competitionEndDate)
              }) }}
            </v-alert>
            <v-alert v-if="dateDialogError" type="error" variant="tonal" class="mt-3" density="compact">
              {{ dateDialogError }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isDateDialogOpen = false">{{ t('commissionerCompetition.cancel') }}</v-btn>
            <v-btn color="primary" :loading="isSavingTrial" @click="saveDateDialog">
              {{ t('commissionerCompetition.saveDate') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isLocationDialogOpen" max-width="400">
        <v-card>
          <v-card-title>
            <v-icon icon="mdi-map-marker" class="mr-2" />
            {{ t('commissionerCompetition.editLocationTitle') }}
          </v-card-title>
          <v-card-text>
            <v-autocomplete
              v-model="editLocationForm.locationId"
              v-model:search="locationSearch"
              :items="availableLocations"
              item-title="name"
              item-value="locationId"
              :label="t('commissionerCompetition.locationId')"
              variant="outlined"
              density="comfortable"
              :loading="isLoadingLocations"
              clearable
              prepend-inner-icon="mdi-magnify"
              :custom-filter="(item: any, queryText: string) => {
                if (!queryText) return true
                const query = queryText.toLowerCase()
                return (
                  item.raw?.name?.toLowerCase().includes(query) ||
                  item.raw?.mainEntrance?.toLowerCase().includes(query) ||
                  item.raw?.description?.toLowerCase().includes(query)
                )
              }"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="`${item.raw?.mainEntrance || 'Adresse non disponible'}`" />
              </template>
              <template #selection="{ item }">
                <div v-if="item.raw" class="d-flex flex-column">
                  <span class="font-weight-medium">{{ item.raw.name }}</span>
                  <span class="text-caption" style="color: #666;">{{ item.raw.mainEntrance || 'Adresse non disponible' }}</span>
                </div>
              </template>
            </v-autocomplete>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isLocationDialogOpen = false">{{ t('commissionerCompetition.cancel') }}</v-btn>
            <v-btn color="secondary" :loading="isSavingTrial" @click="saveLocationDialog">
              {{ t('commissionerCompetition.saveLocation') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <v-snackbar
      v-model="showQualifiedWarning"
      location="center"
      color="warning"
      :timeout="6000"
      multi-line
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-lock-alert" class="mr-3" size="24" />
        <div>
          <div class="font-weight-bold mb-1">{{ t('commissionerCompetition.cannotEditTitle') }}</div>
          <div class="text-body-2">{{ t('commissionerCompetition.cannotEditQualifiedTrial') }}</div>
        </div>
      </div>
      <template #actions>
        <v-btn
          variant="text"
          @click="showQualifiedWarning = false"
        >
          {{ t('commissionerCompetition.cancel') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import championshipService from '@/services/championshipService'
import userService from '@/services/userService'
import locationService from '@/services/locationService'
import resultService from '@/services/resultService'
import teamService from '@/services/teamService'
import volunteerService from '@/services/volunteerService'
import type { VolunteerTask } from '@/services/volunteerService'
import type { CompetitionTreeResult, Trial } from '@/types/competition'
import { Status } from '@/types/competition'
import type { LocateTrialResponse, Location } from '@/types/location'
import type { User } from '@/types/user'
import { getUserDisplayName, UserRole } from '@/types/user'
import type { Team } from '@/types/team'
import { formatDateRange as formatDateRangeUtil, formatTimeRange as formatTimeRangeUtil, formatDate as formatDateUtil } from '@/utils/date'
import { isAxiosError } from 'axios'
import { useUserStore } from '@/stores/user'
import AthleteSelectionDialog from '@/components/commissioner/AthleteSelectionDialog.vue'
import TeamSelectionDialog from '@/components/commissioner/TeamSelectionDialog.vue'
import TeamManagementDialog from '@/components/commissioner/TeamManagementDialog.vue'
import AthleteSelectionDisplay from '@/components/commissioner/AthleteSelectionDisplay.vue'
import TeamSelectionDisplay from '@/components/commissioner/TeamSelectionDisplay.vue'
import TrialParticipantsLocationDialog from '@/components/commissioner/TrialParticipantsLocationDialog.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { t, locale } = useI18n()

const formatDateRange = (start: string | Date, end: string | Date) =>
  formatDateRangeUtil(start, end, locale.value)

const formatTimeRange = (start: string | Date, end: string | Date) =>
  formatTimeRangeUtil(start, end, locale.value)

const formatDate = (date: string | Date) =>
  formatDateUtil(date, locale.value)

const competition = ref<CompetitionTreeResult | null>(null)
const athletes = ref<User[]>([])
const trials = ref<Trial[]>([])
const allLocations = ref<Location[]>([])
const selectedAthleteIds = ref<number[]>([])
const teams = ref<number[][]>([]) // Pour le mode TEAM (ancien système)
const managedTeams = ref<Team[]>([]) // Pour le mode TEAM (nouveau système avec API)
const loadedTeams = ref<Team[]>([]) // Teams chargées depuis l'API pour affichage
const teamSearches = ref<string[]>([]) // Pour les recherches par équipe
const athleteSearch = ref('')
const errorMessage = ref('')
const infoMessage = ref('')
const isLoading = ref(false)
const isGeneratingTree = ref(false)
const isAthleteDialogOpen = ref(false)
const isTeamManagementDialogOpen = ref(false)
const hasExistingResults = ref(false)

// Dialog date
const isDateDialogOpen = ref(false)
const editingTrialId = ref<number | null>(null)
const editDateForm = ref({
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
})

// Dialog lieu
const isLocationDialogOpen = ref(false)
const editLocationForm = ref({ locationId: null as number | null })
const availableLocations = ref<Location[]>([])
const isLoadingLocations = ref(false)
const locationSearch = ref('')

// Dialog date - validation error
const dateOrderError = ref(false)
const dateDialogError = ref('')
const dateOutOfRangeError = ref(false)
const showQualifiedWarning = ref(false)

const isSavingTrial = ref(false)
const isTrialLocationDialogOpen = ref(false)
const isLoadingTrialLocations = ref(false)
const trialLocationError = ref('')
const trialLocationDialogTrialName = ref('')
const trialLocations = ref<LocateTrialResponse | null>(null)

const competitionId = computed(() => Number(route.params.id))
const championshipDetailsId = computed(() => competition.value?.championshipId ?? competition.value?.championship?.id ?? null)
const requesterId = computed(() => userStore.user?.userId ?? null)

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


const removeAthlete = (athleteId: number) => {
  selectedAthleteIds.value = selectedAthleteIds.value.filter((id) => id !== athleteId)
}

const removeTeam = (teamIndex: number) => {
  teams.value.splice(teamIndex, 1)
  teamSearches.value.splice(teamIndex, 1)
}

const removeTeamFromManaged = (teamId: number) => {
  managedTeams.value = managedTeams.value.filter(team => team.teamId !== teamId)
}

const removeAthleteFromTeamDisplay = (teamIdx: number, athleteId: number) => {
  const team = teams.value[teamIdx]
  if (team) {
    const idx = team.indexOf(athleteId)
    if (idx > -1) team.splice(idx, 1)
  }
}

const formatParticipantNames = (participantIds: number[] | number[][]): string => {
  // Check if it's a list of lists (teams) or a simple list (individuals or team IDs)
  if (participantIds.length === 0) {
    return t('commissionerCompetition.noParticipantsInTrial')
  }

  console.log('formatParticipantNames:', {
    participantIds,
    participantType: competition.value?.participantType,
    loadedTeamsCount: loadedTeams.value.length,
    isArray: Array.isArray(participantIds[0]),
  })

  // If first element is an array, it's teams (old system)
  if (Array.isArray(participantIds[0])) {
    const teams = participantIds as number[][]
    return teams
      .map((team, idx) => {
        const names = team
          .map((participantId) => athletes.value.find((athlete) => athlete.userId === participantId))
          .map((athlete, index) => athlete ? getUserDisplayName(athlete) : `#${team[index]}`)
          .join(', ')
        return `${t('commissionerCompetition.teamNumber', { number: idx + 1 })}: ${names}`
      })
      .join(' | ')
  }

  // Check if it's a TEAM competition (new system with managedTeams)
  if (competition.value?.participantType === 'TEAM') {
    // participantIds contains team IDs, fetch the teams and display their athletes
    return (participantIds as number[])
      .map((teamId) => {
        const team = loadedTeams.value.find(t => t.teamId === teamId)
        if (!team) {
          // Team not loaded yet or doesn't exist
          return `Équipe #${teamId}`
        }

        const athleteNames = team.athletes
          .map(athlete => getUserDisplayName(athlete))
          .join(', ')

        return `${team.name}: ${athleteNames || t('teamManagement.noAthletesInTeam')}`
      })
      .join(' | ')
  }

  // Otherwise it's individuals
  return (participantIds as number[])
    .map((participantId) => athletes.value.find((athlete) => athlete.userId === participantId))
    .map((athlete, index) => athlete ? getUserDisplayName(athlete) : `#${(participantIds as number[])[index]}`)
    .join(', ')
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
  // Normaliser le sport en majuscules avec underscores
  const normalized = sport.toUpperCase().replace(/\s+/g, '_')
  return t(`admin.sport.${normalized}`)
}


const getLocationName = (locationId: number | null | undefined): string | null => {
  if (!locationId) return null
  return allLocations.value.find((l) => l.locationId === locationId)?.name ?? String(locationId)
}

const getLocationById = (locationId: number | null | undefined) => {
  if (!locationId) return null
  return allLocations.value.find((l) => l.locationId === locationId)
}

const openMapItinerary = (locationId: number | null | undefined) => {
  const location = getLocationById(locationId)
  if (!location) return

  // Utiliser les coordonnées GPS pour ouvrir Google Maps en mode itinéraire
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
  window.open(mapsUrl, '_blank')
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
    // Si c'est une compétition TEAM, charger les équipes pour afficher les athlètes
    if (competition.value?.participantType === 'TEAM') {
      await loadTeamsFromApi()
    }
  } catch {
    trials.value = []
  }
}

const loadTeamsFromApi = async () => {
  try {
    // Récupérer toutes les équipes
    const allTeams = await teamService.getAllTeams()
    loadedTeams.value = allTeams
    console.log('Équipes chargées:', allTeams)
  } catch (error) {
    console.error('Erreur lors du chargement des équipes:', error)
    loadedTeams.value = []
  }
}

const isTrialReady = (trial: Trial): boolean =>
  !!trial.trialStartDate && !!trial.trialEndDate && !!trial.locationId

const hasQualifiedParticipants = async (trialId: number): Promise<boolean> => {
  try {
    const result = await resultService.getResultByTrialId(trialId)
    if (result && result.rankings && result.rankings.length > 0 && !result.lastTrial) {
      return true
    }

    return false
  } catch {
    return false
  }
}

const splitDateTime = (dateTimeStr: string | null | undefined): { date: string; time: string } => {
  if (!dateTimeStr) return { date: '', time: '' }
  // Format ISO: 2026-03-20T14:30:00
  const parts = dateTimeStr.split('T')
  return {
    date: parts[0] || '',
    time: parts[1]?.slice(0, 5) || '', // HH:mm
  }
}

const combineDateTime = (date: string, time: string): string => {
  if (!date || !time) return ''
  return `${date}T${time}:00` // Format ISO avec secondes
}

const openDateDialog = async (trial: Trial) => {
  // Vérifier si cette épreuve a déjà qualifié des participants vers la manche suivante
  const hasQualified = await hasQualifiedParticipants(trial.trialId!)
  if (hasQualified) {
    showQualifiedWarning.value = true
    return
  }

  editingTrialId.value = trial.trialId
  dateOrderError.value = false
  dateDialogError.value = ''
  const start = splitDateTime(trial.trialStartDate)
  const end = splitDateTime(trial.trialEndDate)
  editDateForm.value = {
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
  }
  isDateDialogOpen.value = true
}

const openLocationDialog = async (trial: Trial) => {
  const hasQualified = await hasQualifiedParticipants(trial.trialId!)
  if (hasQualified) {
    showQualifiedWarning.value = true
    return
  }

  editingTrialId.value = trial.trialId
  editLocationForm.value = { locationId: trial.locationId ?? null }
  isLoadingLocations.value = true
  try {
    availableLocations.value = await locationService.getAllLocations()
  } catch {
    availableLocations.value = []
  } finally {
    isLoadingLocations.value = false
  }
  isLocationDialogOpen.value = true
}

const saveDateDialog = async () => {
  if (!editingTrialId.value) return
  dateOrderError.value = false
  dateDialogError.value = ''
  dateOutOfRangeError.value = false

  const startDateTime = combineDateTime(editDateForm.value.startDate, editDateForm.value.startTime)
  const endDateTime = combineDateTime(editDateForm.value.endDate, editDateForm.value.endTime)

  // Vérifier que la date de fin est après la date de début
  if (startDateTime && endDateTime && endDateTime <= startDateTime) {
    dateOrderError.value = true
    return
  }

  // Vérifier que les dates de l'épreuve sont dans les dates de la compétition
  if (competition.value && startDateTime && endDateTime) {
    const compStart = new Date(competition.value.competitionStartDate)
    const compEnd = new Date(competition.value.competitionEndDate)
    const trialStart = new Date(startDateTime)
    const trialEnd = new Date(endDateTime)

    if (trialStart < compStart || trialEnd > compEnd) {
      dateOutOfRangeError.value = true
      return
    }
  }

  isSavingTrial.value = true
  errorMessage.value = ''
  try {
    const trial = trials.value.find((t) => t.trialId === editingTrialId.value)
    if (!trial || !trial.trialId) return

    const updated = await championshipService.updateTrial(trial.trialId, {
      trialName: trial.trialName,
      trialStartDate: startDateTime,
      trialEndDate: endDateTime,
      trialDescription: trial.trialDescription,
      trialStatus: trial.trialStatus,
      locationId: trial.locationId,
      roundNumber: trial.roundNumber,
      position: trial.position,
      nextTrialId: trial.nextTrialId,
      competitionId: trial.competitionId,
      participantIds: trial.participantIds,
    })
    const idx = trials.value.findIndex((t) => t.trialId === editingTrialId.value)
    if (idx !== -1) trials.value[idx] = updated
    isDateDialogOpen.value = false
    infoMessage.value = t('commissionerCompetition.updateSuccess')
  } catch (err) {
    const fallback = t('commissionerCompetition.updateError')
    const apiMessage = extractApiErrorMessage(err, fallback)

    // Check if it's a scheduling conflict error
    if (apiMessage.includes('Conflit d\'emploi du temps') || apiMessage.includes('emploi du temps')) {
      dateDialogError.value = t('commissionerCompetition.scheduleConflictError')
    } else {
      dateDialogError.value = apiMessage
    }
  } finally {
    isSavingTrial.value = false
  }
}

const navigateToTrialTasks = (trial: Trial) => {
  router.push({ name: 'trial-tasks', params: { id: trial.trialId } })
}

const openTrialLocationDialog = async (trial: Trial) => {
  trialLocationDialogTrialName.value = trial.trialName
  trialLocations.value = null
  trialLocationError.value = ''
  isTrialLocationDialogOpen.value = true

  if (!requesterId.value || !trial.trialId) {
    trialLocationError.value = t('commissionerCompetition.locateTrialLoadError')
    return
  }

  isLoadingTrialLocations.value = true

  try {
    trialLocations.value = await locationService.locateTrialParticipants({
      requesterId: requesterId.value,
      trialId: trial.trialId,
    })
  } catch (error) {
    console.error('Load trial participants location error:', error)
    trialLocationError.value = t('commissionerCompetition.locateTrialLoadError')
  } finally {
    isLoadingTrialLocations.value = false
  }
}

const saveLocationDialog = async () => {
  if (!editingTrialId.value) return
  isSavingTrial.value = true
  errorMessage.value = ''
  try {
    const trial = trials.value.find((t) => t.trialId === editingTrialId.value)
    if (!trial || !trial.trialId) return
    const newLocationId = editLocationForm.value.locationId ?? 0
    const updated = await championshipService.updateTrial(trial.trialId, {
      trialName: trial.trialName,
      trialStartDate: trial.trialStartDate,
      trialEndDate: trial.trialEndDate,
      trialDescription: trial.trialDescription,
      trialStatus: trial.trialStatus,
      locationId: newLocationId,
      roundNumber: trial.roundNumber,
      position: trial.position,
      nextTrialId: trial.nextTrialId,
      competitionId: trial.competitionId,
      participantIds: trial.participantIds,
    })
    const idx = trials.value.findIndex((t) => t.trialId === editingTrialId.value)
    if (idx !== -1) trials.value[idx] = updated

    // Cascade : mettre à jour le locationId de toutes les tâches de cette épreuve
    try {
      const trialTasks = await volunteerService.getTasksByTarget('TRIAL', editingTrialId.value)
      await Promise.all(
        trialTasks.map((task: VolunteerTask) =>
          volunteerService.updateTask(task.id, { ...task, locationId: newLocationId })
        )
      )
    } catch {
      // non bloquant
    }

    isLocationDialogOpen.value = false
    infoMessage.value = t('commissionerCompetition.updateSuccess')
  } catch {
    errorMessage.value = t('commissionerCompetition.updateError')
  } finally {
    isSavingTrial.value = false
  }
}

const checkExistingResults = async () => {
  hasExistingResults.value = false
  try {
    // Vérifier si au moins une épreuve a des résultats
    if (trials.value.length === 0) {
      return
    }

    for (const trial of trials.value) {
      try {
        const result = await resultService.getResultByTrialId(trial.trialId!)
        if (result && result.rankings && result.rankings.length > 0) {
          hasExistingResults.value = true
          return
        }
      } catch {
        // Si la requête échoue, il n'y a pas de résultat pour cette épreuve
        continue
      }
    }
  } catch {
    // Erreur lors de la vérification, on continue sans bloquer
  }
}

const generateTree = async () => {
  if (!competition.value) {
    return
  }

  const isTeamCompetition = competition.value.participantType === 'TEAM'

  let participantData
  if (isTeamCompetition) {
    // Si on a des équipes gérées avec l'API, utiliser leurs IDs
    if (managedTeams.value.length > 0) {
      participantData = managedTeams.value.map(team => team.teamId!)
    } else {
      // Sinon utiliser l'ancien système avec tableaux d'IDs
      participantData = teams.value
    }
  } else {
    participantData = selectedAthleteIds.value
  }

  if (!participantData || participantData.length === 0) {
    return
  }

  isGeneratingTree.value = true
  errorMessage.value = ''
  infoMessage.value = ''

  try {
    competition.value = await championshipService.generateCompetitionTree(
      competition.value.competitionId,
      participantData,
    )
    await loadTrials()
    await checkExistingResults()

    if (isTeamCompetition) {
      if (teams.value.length > 0) {
        teams.value = []
        teamSearches.value = []
      }
    } else {
      selectedAthleteIds.value = []
    }
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

    const locations = await locationService.getAllLocations().catch(() => [])
    allLocations.value = locations

    await loadTrials()
    await checkExistingResults()

    if (competition.value?.participantType === 'TEAM') {
      try {
        const allTeams = await teamService.getAllTeams()
        if (trials.value.length > 0) {
          const usedTeamIds = new Set<number>()
          trials.value.forEach(trial => {
            trial.participantIds.forEach(id => {
              if (typeof id === 'number') {
                usedTeamIds.add(id)
              }
            })
          })
          managedTeams.value = allTeams.filter(team => usedTeamIds.has(team.teamId!))
        }
      } catch {
      }
    }
  } catch {
    errorMessage.value = t('commissionerCompetition.loadError')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.section-label {
  color: rgb(25, 118, 210);
}

.competition-hero {
  padding: 28px;
  border-radius: 30px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background:
    radial-gradient(circle at top left, rgba(25, 118, 210, 0.14), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 251, 0.96));
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
}

.trial-card {
  border-color: rgba(25, 118, 210, 0.12);
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.04), rgba(255, 255, 255, 0.98) 120px),
    white;
}

.trial-actions {
  min-width: 220px;
  gap: 12px;
}
</style>
