<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="4" class="info-shell pa-6 pa-md-8">
          <div class="mb-6">
            <div class="text-overline section-label">{{ t('contact.kicker') }}</div>
            <h1 class="text-h4 font-weight-bold">{{ t('contact.title') }}</h1>
            <p class="text-body-1 text-grey-darken-1 mt-3">
              {{ t('contact.intro') }}
            </p>
          </div>

          <v-divider class="my-6" />

          <section class="mb-6">
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('contact.teamTitle') }}</h2>
            <ul class="text-body-1 ml-5">
              <li v-for="member in teamMembers" :key="member">{{ member }}</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('contact.projectTitle') }}</h2>
            <p class="text-body-1">{{ t('contact.projectBody') }}</p>
          </section>

          <section>
            <h2 class="text-h6 font-weight-bold mb-3">{{ t('contact.reachUsTitle') }}</h2>
            <p class="text-body-1">{{ t('contact.reachUsBody') }}</p>
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
