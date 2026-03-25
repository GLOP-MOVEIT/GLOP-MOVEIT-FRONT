<template>
  <v-dialog :model-value="isOpen" @update:model-value="$emit('update:isOpen', $event)" max-width="900" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <v-icon icon="mdi-account-group" class="mr-2" />
          {{ t('teamManagement.title') }}
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">
          {{ error }}
        </v-alert>

        <TeamCreationForm
          v-model:team-name="newTeamName"
          :is-loading="isCreatingTeam"
          @create="createTeam"
          class="mb-4"
        />

        <div class="text-subtitle-2 font-weight-medium mb-3">
          {{ t('teamManagement.teamsList') }}
          <v-chip size="small" variant="tonal" color="primary" class="ml-2">{{ localTeams.length }}</v-chip>
        </div>

        <div v-if="localTeams.length === 0" class="text-body-2 text-grey-darken-1 text-center py-6">
          {{ t('teamManagement.noTeams') }}
        </div>

        <v-expansion-panels v-else variant="accordion">
          <TeamEditorPanel
            v-for="team in localTeams"
            :key="team.teamId"
            :team="team"
            :selected-athlete="selectedAthleteForTeam[team.teamId!] ?? null"
            @update:selected-athlete="selectedAthleteForTeam[team.teamId!] = $event"
            :available-athletes="availableAthletesForTeam(team)"
            :is-adding-athlete="isAddingAthlete"
            @add-athlete="addAthleteToTeam(team.teamId!, selectedAthleteForTeam[team.teamId!] ?? null)"
            @remove-athlete="(athleteId) => removeAthleteFromTeam(team.teamId!, athleteId)"
            @delete-team="deleteTeam(team.teamId!)"
          />
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions class="justify-end px-6 pb-4">
        <v-btn variant="text" @click="closeDialog">
          {{ t('teamManagement.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import teamService from '@/services/teamService'
import TeamCreationForm from '@/components/commissioner/TeamCreationForm.vue'
import TeamEditorPanel from '@/components/commissioner/TeamEditorPanel.vue'
import type { Team } from '@/types/team'
import type { User } from '@/types/user'
import { getUserDisplayName } from '@/types/user'

const { t } = useI18n()

interface Props {
  isOpen: boolean
  teams: Team[]
  athletes: User[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'update:teams': [value: Team[]]
}>()

const localTeams = ref<Team[]>([...props.teams])
const newTeamName = ref('')
const selectedAthleteForTeam = ref<Record<number, number | null>>({})
const isCreatingTeam = ref(false)
const isAddingAthlete = ref(false)
const error = ref('')

// Synchroniser avec les props
watch(() => props.teams, (newTeams) => {
  localTeams.value = [...newTeams]
}, { deep: true })

// Athlètes disponibles pour une équipe (ceux qui ne sont pas déjà dans cette équipe OU dans une autre équipe)
const availableAthletesForTeam = (team: Team) => {
  const teamAthleteIds = team.athletes.map(a => a.userId)

  // Récupérer tous les athlètes déjà dans d'autres équipes
  const athletesInOtherTeams = new Set<number>()
  localTeams.value.forEach(t => {
    if (t.teamId !== team.teamId) {
      t.athletes.forEach(a => athletesInOtherTeams.add(a.userId))
    }
  })

  return props.athletes
    .filter(a => !teamAthleteIds.includes(a.userId) && !athletesInOtherTeams.has(a.userId))
    .map(a => ({
      ...a,
      displayName: getUserDisplayName(a),
    }))
}

const createTeam = async () => {
  if (!newTeamName.value.trim()) return

  isCreatingTeam.value = true
  error.value = ''
  try {
    const team = await teamService.createTeam({ name: newTeamName.value.trim() })
    localTeams.value.push(team)
    emit('update:teams', localTeams.value)
    newTeamName.value = ''
  } catch {
    error.value = t('teamManagement.createError')
  } finally {
    isCreatingTeam.value = false
  }
}

const addAthleteToTeam = async (teamId: number, athleteId: number | null) => {
  if (!athleteId) return

  isAddingAthlete.value = true
  error.value = ''
  try {
    const updatedTeam = await teamService.addAthleteToTeam(teamId, athleteId)
    const idx = localTeams.value.findIndex(t => t.teamId === teamId)
    if (idx !== -1) {
      localTeams.value[idx] = updatedTeam
      emit('update:teams', localTeams.value)
    }
    selectedAthleteForTeam.value[teamId] = null
  } catch {
    error.value = t('teamManagement.addAthleteError')
  } finally {
    isAddingAthlete.value = false
  }
}

const removeAthleteFromTeam = async (teamId: number, athleteId: number) => {
  error.value = ''
  try {
    const updatedTeam = await teamService.removeAthleteFromTeam(teamId, athleteId)
    const idx = localTeams.value.findIndex(t => t.teamId === teamId)
    if (idx !== -1) {
      localTeams.value[idx] = updatedTeam
      emit('update:teams', localTeams.value)
    }
  } catch {
    error.value = t('teamManagement.removeAthleteError')
  }
}

const deleteTeam = async (teamId: number) => {
  error.value = ''
  try {
    await teamService.deleteTeam(teamId)
    localTeams.value = localTeams.value.filter(t => t.teamId !== teamId)
    emit('update:teams', localTeams.value)
  } catch {
    error.value = t('teamManagement.deleteError')
  }
}

const closeDialog = () => {
  emit('update:isOpen', false)
}
</script>


