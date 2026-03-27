<template>
  <v-dialog :model-value="isOpen" max-width="800" @update:model-value="updateIsOpen">
    <v-card>
      <v-card-title>{{ t('commissionerCompetition.dialogTitleTeams') }}</v-card-title>
      <v-card-text>
        <div class="mb-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-body-2 font-weight-medium">{{ t('commissionerCompetition.teamsLabel') }}</span>
            <v-btn size="small" color="primary" variant="tonal" @click="addTeam">
              <v-icon icon="mdi-plus" class="mr-1" />
              {{ t('commissionerCompetition.addTeam') }}
            </v-btn>
          </div>

          <v-card v-if="teams.length === 0" variant="outlined" class="pa-4">
            <p class="text-body-2 text-grey-darken-1">{{ t('commissionerCompetition.noTeams') }}</p>
          </v-card>

          <v-card v-for="(team, teamIndex) in teams" :key="teamIndex" variant="outlined" class="mb-3 pa-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-subtitle-2 font-weight-medium">{{ t('commissionerCompetition.teamNumber', { number: teamIndex + 1 }) }}</span>
              <v-btn size="x-small" icon color="error" @click="removeTeam(teamIndex)">
                <v-icon icon="mdi-close" />
              </v-btn>
            </div>

            <v-text-field
              :model-value="teamSearches[teamIndex]"
              :label="t('commissionerCompetition.searchAthletes')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="mb-2"
              @update:model-value="updateTeamSearch(teamIndex, $event)"
            />

            <div v-if="getFilteredAthletesForTeam(teamIndex).length === 0" class="text-caption text-grey-darken-1">
              {{ t('commissionerCompetition.noAthletesFound') }}
            </div>

            <v-list v-else density="compact" class="border">
              <v-list-item
                v-for="athlete in getFilteredAthletesForTeam(teamIndex)"
                :key="athlete.userId"
                @click="toggleTeamAthleteSelection(teamIndex, athlete.userId)"
              >
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="team.includes(athlete.userId)"
                    @click.stop="toggleTeamAthleteSelection(teamIndex, athlete.userId)"
                  />
                </template>

                <template #title>
                  {{ getUserDisplayName(athlete) }}
                </template>
              </v-list-item>
            </v-list>

            <div v-if="team.length > 0" class="mt-2">
              <span class="text-caption text-grey">{{ t('commissionerCompetition.selectedCount', { count: team.length }) }}</span>
            </div>
          </v-card>
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeDialog">{{ t('commissionerCompetition.closeDialog') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { User } from '@/types/user'
import { getUserDisplayName } from '@/types/user'

const { t } = useI18n()

interface Props {
  isOpen: boolean
  teams: number[][]
  teamSearches: string[]
  athletes: User[]
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'update:teams', value: number[][]): void
  (e: 'update:teamSearches', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const getFilteredAthletesForTeam = (teamIndex: number): User[] => {
  const query = (props.teamSearches[teamIndex] || '').trim().toLowerCase()
  const selectedInTeam = props.teams[teamIndex] || []

  if (!query) {
    return props.athletes.filter((a) => !selectedInTeam.includes(a.userId))
  }

  return props.athletes.filter((a) => {
    const name = getUserDisplayName(a).toLowerCase()
    const email = a.email?.toLowerCase() || ''
    const isAlreadySelected = selectedInTeam.includes(a.userId)
    return (name.includes(query) || email.includes(query)) && !isAlreadySelected
  })
}

const addTeam = () => {
  const newTeams = [...props.teams, []]
  const newSearches = [...props.teamSearches, '']
  emit('update:teams', newTeams)
  emit('update:teamSearches', newSearches)
}

const removeTeam = (teamIndex: number) => {
  const newTeams = props.teams.filter((_, idx) => idx !== teamIndex)
  const newSearches = props.teamSearches.filter((_, idx) => idx !== teamIndex)
  emit('update:teams', newTeams)
  emit('update:teamSearches', newSearches)
}

const toggleTeamAthleteSelection = (teamIndex: number, athleteId: number) => {
  const newTeams = props.teams.map((team, idx) => {
    if (idx === teamIndex) {
      if (team.includes(athleteId)) {
        return team.filter((id) => id !== athleteId)
      } else {
        return [...team, athleteId]
      }
    }
    return team
  })
  emit('update:teams', newTeams)
}

const updateTeamSearch = (teamIndex: number, value: string) => {
  const newSearches = [...props.teamSearches]
  newSearches[teamIndex] = value
  emit('update:teamSearches', newSearches)
}

const closeDialog = () => {
  emit('update:isOpen', false)
}

const updateIsOpen = (value: boolean) => {
  emit('update:isOpen', value)
}
</script>

