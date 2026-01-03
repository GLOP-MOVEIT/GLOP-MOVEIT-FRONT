<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="3" class="pa-6 text-center">
          <v-icon icon="mdi-clipboard-text" size="64" color="primary" class="mb-4" />
          <h1 class="text-h4 font-weight-bold mb-2">{{ t('roleRequest.title') }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1 mb-4">
            {{ t('roleRequest.subtitle', { role: roleLabel }) }}
          </p>
          <v-alert type="info" variant="tonal" class="mb-6">
            {{ t('roleRequest.comingSoon') }}
          </v-alert>
          <v-btn color="primary" variant="outlined" to="/profil">
            {{ t('roleRequest.backToProfile') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const requestedRole = computed(() => {
  const value = String(route.params.role || '').toUpperCase()
  return value
})

const allowedRoles = ['SPORTIF', 'VOLONTAIRE']

const roleLabel = computed(() => {
  if (!requestedRole.value) {
    return t('roleRequest.unknownRole')
  }

  if (!allowedRoles.includes(requestedRole.value)) {
    return requestedRole.value
  }

  return t(`roles.${requestedRole.value}`)
})
</script>
