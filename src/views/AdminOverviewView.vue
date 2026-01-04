<template>
  <div>
    <v-alert type="info" variant="tonal" class="mb-6">
      {{ t('admin.overviewInfo') }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="text-overline mb-2">{{ t('admin.roleGovernanceTitle') }}</div>
          <p class="text-body-2 text-grey-darken-1 mb-3">
            {{ t('admin.roleGovernanceBody') }}
          </p>
          <div class="text-caption text-grey-darken-1">
            {{ t('admin.roleGovernanceHint') }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="text-overline mb-2">{{ t('admin.moderationTitle') }}</div>
          <p class="text-body-2 text-grey-darken-1 mb-3">
            {{ t('admin.moderationBody') }}
          </p>
          <div class="text-caption text-grey-darken-1">
            {{ t('admin.moderationHint') }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
