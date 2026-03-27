<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="4" class="info-shell pa-6 pa-md-8">
          <div class="mb-6">
            <div class="text-overline section-label">{{ t('legal.kicker') }}</div>
            <h1 class="text-h4 font-weight-bold">{{ t('legal.title') }}</h1>
            <p class="text-body-1 text-grey-darken-1 mt-3">
              {{ t('legal.intro') }}
            </p>
          </div>

          <v-divider class="my-6" />

          <section class="mb-6">
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('legal.publisherTitle') }}</h2>
            <p class="text-body-1 mb-2">{{ t('legal.publisherBody') }}</p>
            <div class="text-body-1">
              <strong>{{ t('legal.teamTitle') }}</strong>
            </div>
            <ul class="text-body-1 ml-5 mt-2">
              <li v-for="member in teamMembers" :key="member">{{ member }}</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('legal.hostingTitle') }}</h2>
            <p class="text-body-1">{{ t('legal.hostingBody') }}</p>
          </section>

          <section>
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('legal.liabilityTitle') }}</h2>
            <p class="text-body-1">{{ t('legal.liabilityBody') }}</p>
          </section>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const teamMembers = [
  'Aymeric JAKOBOWSKI',
  'Camille BARTHELEMY',
  'Julien CONOIR',
  'Evann LIETARD',
  'Florine PALOWSKI',
]
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
