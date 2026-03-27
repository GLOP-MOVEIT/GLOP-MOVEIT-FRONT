<template>
  <v-card variant="outlined" class="pa-4">
    <div class="text-subtitle-2 font-weight-medium mb-3">{{ t('teamManagement.createTeam') }}</div>
    <v-row dense>
      <v-col cols="8">
        <v-text-field
          :model-value="teamName"
          @update:model-value="$emit('update:teamName', $event)"
          :label="t('teamManagement.teamName')"
          variant="outlined"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-shield-star"
        />
      </v-col>
      <v-col cols="4">
        <v-btn
          color="primary"
          block
          :loading="isLoading"
          :disabled="!teamName.trim()"
          @click="$emit('create')"
        >
          <v-icon icon="mdi-plus" class="mr-1" />
          {{ t('teamManagement.create') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  teamName: string
  isLoading: boolean
}

defineProps<Props>()
defineEmits<{
  'update:teamName': [value: string]
  'create': []
}>()
</script>

