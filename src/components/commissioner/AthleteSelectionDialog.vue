<template>
  <v-dialog :model-value="isOpen" max-width="720" @update:model-value="updateIsOpen">
    <v-card>
      <v-card-title>{{ t('commissionerCompetition.dialogTitle') }}</v-card-title>
      <v-card-text>
        <v-text-field
          :model-value="athleteSearch"
          :label="t('commissionerCompetition.searchAthletes')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          class="mb-4"
          @update:model-value="updateAthleteSearch"
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
        <v-btn variant="text" @click="closeDialog">{{ t('commissionerCompetition.closeDialog') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { User } from '@/types/user'
import { getUserDisplayName } from '@/types/user'

const { t } = useI18n()

interface Props {
  isOpen: boolean
  selectedAthleteIds: number[]
  athleteSearch: string
  athletes: User[]
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'update:selectedAthleteIds', value: number[]): void
  (e: 'update:athleteSearch', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const filteredAthletes = computed(() => {
  const query = (props.athleteSearch || '').trim().toLowerCase()

  if (!query) {
    return props.athletes
  }

  return props.athletes.filter((athlete) => {
    const fullName = getUserDisplayName(athlete).toLowerCase()
    const email = athlete.email.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })
})


const toggleAthleteSelection = (athleteId: number) => {
  if (props.selectedAthleteIds.includes(athleteId)) {
    emit('update:selectedAthleteIds', props.selectedAthleteIds.filter((id) => id !== athleteId))
  } else {
    emit('update:selectedAthleteIds', [...props.selectedAthleteIds, athleteId])
  }
}

const closeDialog = () => {
  emit('update:isOpen', false)
}

const updateIsOpen = (value: boolean) => {
  emit('update:isOpen', value)
}

const updateAthleteSearch = (value: string) => {
  emit('update:athleteSearch', value)
}
</script>

