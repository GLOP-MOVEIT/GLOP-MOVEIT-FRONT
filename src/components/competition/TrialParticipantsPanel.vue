<template>
  <div class="participant-panel">
    <div class="font-weight-medium text-body-2 mb-3 participant-title">
      <v-icon size="16" class="mr-1">mdi-account-group</v-icon>
      {{ participantType === 'TEAM' ? t('competitionDetails.teams') : t('competitionDetails.athletes') }}
    </div>

    <div v-if="participantIds.length > 0" class="participant-list">
      <template v-if="participantType === 'TEAM'">
        <div
          v-for="participantId in participantIds"
          :key="participantId"
          class="participant-item team-item"
        >
          <div class="team-header">
            <div class="team-name">
              <v-icon size="18" color="primary">mdi-account-multiple</v-icon>
              <span>{{ getTeamName(participantId) }}</span>
            </div>
            <v-chip size="x-small" color="primary" variant="tonal">
              {{ getTeamAthletes(participantId).length }}
            </v-chip>
          </div>

          <div v-if="getTeamAthletes(participantId).length > 0" class="athlete-links">
            <RouterLink
              v-for="athlete in getTeamAthletes(participantId)"
              :key="athlete.userId"
              :to="{ name: 'public-profile', params: { id: athlete.userId } }"
              class="athlete-link"
            >
              <span>{{ athlete.name }}</span>
              <v-icon size="16">mdi-arrow-top-right</v-icon>
            </RouterLink>
          </div>

          <div v-else class="text-body-2 text-grey-darken-1">
            {{ t('competitionDetails.noAthletes') }}
          </div>
        </div>
      </template>

      <template v-else>
        <RouterLink
          v-for="participantId in participantIds"
          :key="participantId"
          :to="{ name: 'public-profile', params: { id: participantId } }"
          class="participant-item athlete-item"
        >
          <div class="athlete-main">
            <div class="athlete-avatar">
              <v-icon size="18">mdi-account</v-icon>
            </div>
            <div>
              <div class="text-body-2 font-weight-bold">{{ getAthleteName(participantId) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ t('competitionDetails.athlete') }}
              </div>
            </div>
          </div>
          <v-icon size="18" color="primary">mdi-arrow-top-right</v-icon>
        </RouterLink>
      </template>
    </div>

    <div v-else class="text-grey-darken-1 text-body-2">
      {{ participantType === 'TEAM' ? t('competitionDetails.noTeams') : t('competitionDetails.noAthletes') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Team } from '@/types/team'
import type { User } from '@/types/user'
import { getUserDisplayName } from '@/types/user'

interface Props {
  participantType: string
  participantIds: number[]
  athletes: User[]
  teams: Team[]
}

const props = defineProps<Props>()

const { t } = useI18n()

const getAthleteName = (athleteId: number) => {
  const athlete = props.athletes.find((entry) => entry.userId === athleteId)
  return athlete ? getUserDisplayName(athlete) : `#${athleteId}`
}

const getTeam = (teamId: number) =>
  props.teams.find((entry) => entry.teamId === teamId)

const getTeamName = (teamId: number) =>
  getTeam(teamId)?.name ?? `Team #${teamId}`

const getTeamAthletes = (teamId: number) =>
  (getTeam(teamId)?.athletes ?? []).map((athlete) => ({
    userId: athlete.userId,
    name: getUserDisplayName(athlete),
  }))
</script>

<style scoped>
.participant-panel {
  padding: 16px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.06), rgba(255, 255, 255, 0.98) 90px),
    rgba(248, 250, 252, 0.98);
  border: 1px solid rgba(25, 118, 210, 0.12);
}

.participant-title {
  display: flex;
  align-items: center;
}

.participant-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participant-item {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: white;
}

.athlete-item {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  color: inherit;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.athlete-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  border-color: rgba(25, 118, 210, 0.24);
}

.athlete-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.athlete-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(25, 118, 210);
  background: rgba(25, 118, 210, 0.1);
}

.team-item {
  padding: 14px;
}

.team-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.team-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: rgb(15, 23, 42);
}

.athlete-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.athlete-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.9);
  color: inherit;
  text-decoration: none;
  transition: background-color 160ms ease, transform 160ms ease;
}

.athlete-link:hover {
  background: rgba(25, 118, 210, 0.08);
  transform: translateX(2px);
}
</style>
