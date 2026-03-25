<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex align-center justify-space-between w-100">
        <div class="d-flex align-center">
          <v-icon icon="mdi-account-group" class="mr-2" color="primary" />
          <span class="font-weight-medium">{{ team.name }}</span>
          <v-chip size="x-small" variant="tonal" color="info" class="ml-3">
            {{ team.athletes.length }} {{ t('teamManagement.athletes') }}
          </v-chip>
        </div>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-row dense class="mb-3">
        <v-col cols="8">
          <v-autocomplete
            :model-value="selectedAthlete"
            @update:model-value="$emit('update:selectedAthlete', $event)"
            :items="availableAthletes"
            item-title="displayName"
            item-value="userId"
            :label="t('teamManagement.addAthlete')"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
          />
        </v-col>
        <v-col cols="4">
          <v-btn
            color="success"
            block
            :disabled="!selectedAthlete"
            :loading="isAddingAthlete"
            @click="$emit('add-athlete')"
          >
            <v-icon icon="mdi-plus" class="mr-1" />
            {{ t('teamManagement.add') }}
          </v-btn>
        </v-col>
      </v-row>

      <div v-if="team.athletes.length === 0" class="text-caption text-grey-darken-1 py-2">
        {{ t('teamManagement.noAthletesInTeam') }}
      </div>
      <v-list v-else density="compact">
        <v-list-item
          v-for="athlete in team.athletes"
          :key="athlete.userId"
          class="px-2"
        >
          <template #prepend>
            <v-icon icon="mdi-account" size="20" color="grey-darken-1" />
          </template>
          <v-list-item-title class="text-body-2">
            {{ getUserDisplayName(athlete) }}
          </v-list-item-title>
          <template #append>
            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              @click="$emit('remove-athlete', athlete.userId)"
            />
          </template>
        </v-list-item>
      </v-list>

      <v-btn
        variant="outlined"
        color="error"
        size="small"
        class="mt-3"
        @click="$emit('delete-team')"
      >
        <v-icon icon="mdi-delete" class="mr-1" />
        {{ t('teamManagement.deleteTeam') }}
      </v-btn>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Team } from '@/types/team'
import type { User } from '@/types/user'
import { getUserDisplayName } from '@/types/user'

const { t } = useI18n()

interface Props {
  team: Team
  selectedAthlete: number | null
  availableAthletes: (User & { displayName: string })[]
  isAddingAthlete: boolean
}

defineProps<Props>()
defineEmits<{
  'update:selectedAthlete': [value: number | null]
  'add-athlete': []
  'remove-athlete': [athleteId: number]
  'delete-team': []
}>()
</script>

