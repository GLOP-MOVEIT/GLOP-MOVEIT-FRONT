<template>
  <div>
    <div v-if="teams.length === 0" class="text-body-2 text-grey-darken-1 mb-4">
      {{ t('commissionerCompetition.noTeamsSelected') }}
    </div>

    <div v-else class="mb-4">
      <v-card
        v-for="(team, teamIndex) in teams"
        :key="teamIndex"
        variant="outlined"
        class="mb-2 pa-3"
      >
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-subtitle-2 font-weight-medium">
            {{ t('commissionerCompetition.teamNumber', { number: teamIndex + 1 }) }}
            <v-chip size="small" variant="tonal" color="info">{{ team.length }}</v-chip>
          </span>
          <v-btn size="x-small" icon color="error" @click="removeTeam(teamIndex)">
            <v-icon icon="mdi-close" />
          </v-btn>
        </div>
        <div class="d-flex flex-wrap gap-1">
          <v-chip
            v-for="athleteId in team"
            :key="athleteId"
            color="primary"
            variant="tonal"
            size="small"
            closable
            @click:close="removeAthleteFromTeam(teamIndex, athleteId)"
          >
            {{ getUserDisplayNameById(athleteId) }}
          </v-chip>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { User } from '@/types/user'
import { getUserDisplayName } from '@/types/user'

const { t } = useI18n()

interface Props {
  teams: number[][]
  athletes: User[]
}

interface Emits {
  (e: 'removeTeam', teamIndex: number): void
  (e: 'removeAthleteFromTeam', teamIndex: number, athleteId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const getUserDisplayNameById = (userId: number): string => {
  const athlete = props.athletes.find((a) => a.userId === userId)
  return athlete ? getUserDisplayName(athlete) : `#${userId}`
}

const removeTeam = (teamIndex: number) => {
  emit('removeTeam', teamIndex)
}

const removeAthleteFromTeam = (teamIndex: number, athleteId: number) => {
  emit('removeAthleteFromTeam', teamIndex, athleteId)
}
</script>

