<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <v-footer
    color="grey-lighten-3"
    app
    class="d-flex flex-column flex-md-row align-center"
  >
    <v-container>
      <v-row align="center" justify="space-between">
        <v-col cols="12" md="6" class="text-center text-md-left">
          <strong>CiblOrgaSport</strong> © {{ currentYear }} - {{ t('footer.rightsReserved') }}
        </v-col>
        <v-col cols="12" md="6" class="text-center text-md-right">
          <v-btn variant="text" size="small" :to="{ name: 'legal-notice' }" class="mx-1">
            {{ t('footer.legal') }}
          </v-btn>
          <v-btn variant="text" size="small" :to="{ name: 'privacy-policy' }" class="mx-1">
            {{ t('footer.privacy') }}
          </v-btn>
          <v-btn variant="text" size="small" :to="{ name: 'contact-page' }" class="mx-1">
            {{ t('footer.contact') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>
