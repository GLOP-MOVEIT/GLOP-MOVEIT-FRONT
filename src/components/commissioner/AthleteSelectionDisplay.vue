<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { User } from '@/types/user'
import { getUserDisplayName } from '@/types/user'

const { t } = useI18n()

interface Props {
  selectedAthleteIds: number[]
  athletes: User[]
}

interface Emits {
  (e: 'remove', athleteId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedAthletes = computed(() =>
  props.athletes.filter((athlete) => props.selectedAthleteIds.includes(athlete.userId))
)

const removeAthlete = (athleteId: number) => {
  emit('remove', athleteId)
}
</script>

