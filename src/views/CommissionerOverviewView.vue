<template>
  <div>
    <v-alert type="info" variant="tonal" class="mb-6">
      {{ t('commissioner.overviewInfo') }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="text-overline mb-2">{{ t('commissioner.sportifTitle') }}</div>
          <ul class="text-body-2 text-grey-darken-1 pl-4">
            <li>{{ t('commissioner.sportifDocPassport') }}</li>
            <li>{{ t('commissioner.sportifDocMedical') }}</li>
            <li>{{ t('commissioner.sportifDocAntidoping') }}</li>
            <li>{{ t('commissioner.sportifDocIdentity') }}</li>
            <li>{{ t('commissioner.sportifDocTracking') }}</li>
          </ul>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="text-overline mb-2">{{ t('commissioner.volontaireTitle') }}</div>
          <ul class="text-body-2 text-grey-darken-1 pl-4">
            <li>{{ t('commissioner.volontaireDocIdentity') }}</li>
            <li>{{ t('commissioner.volontaireDocMotivation') }}</li>
          </ul>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
