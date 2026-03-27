<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="4" class="info-shell pa-6 pa-md-8">
          <div class="mb-6">
            <div class="text-overline section-label">{{ t('privacy.kicker') }}</div>
            <h1 class="text-h4 font-weight-bold">{{ t('privacy.title') }}</h1>
            <p class="text-body-1 text-grey-darken-1 mt-3">
              {{ t('privacy.intro') }}
            </p>
          </div>

          <v-divider class="my-6" />

          <section class="mb-6">
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('privacy.dataTitle') }}</h2>
            <p class="text-body-1">{{ t('privacy.dataBody') }}</p>
          </section>

          <section class="mb-6">
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('privacy.locationTitle') }}</h2>
            <p class="text-body-1">{{ t('privacy.locationBody') }}</p>
          </section>

          <section class="mb-6">
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('privacy.academicTitle') }}</h2>
            <p class="text-body-1">{{ t('privacy.academicBody') }}</p>
          </section>

          <section>
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('privacy.rightsTitle') }}</h2>
            <p class="text-body-1">{{ t('privacy.rightsBody') }}</p>
          </section>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.info-shell {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.04), rgba(255, 255, 255, 0) 180px),
    white;
}

.section-label {
  color: rgb(25, 118, 210);
}
</style>
