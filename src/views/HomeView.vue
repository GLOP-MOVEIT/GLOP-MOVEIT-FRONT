<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <v-icon icon="mdi-trophy" size="120" color="primary" class="mb-6"></v-icon>
        
        <h1 class="text-h3 font-weight-bold mb-4">
          {{ t('home.title') }}
        </h1>
        
        <p class="text-h6 text-grey-darken-1 mb-8">
          {{ t('home.subtitle') }}
        </p>

        <v-btn
          v-if="!userStore.isAuthenticated"
          to="/login"
          color="primary"
          size="large"
          class="mr-4"
        >
          <v-icon icon="mdi-login" class="mr-2"></v-icon>
          {{ t('home.signIn') }}
        </v-btn>

        <v-btn
          v-else-if="isAdmin"
          to="/admin"
          color="primary"
          size="large"
          variant="outlined"
        >
          <v-icon icon="mdi-view-dashboard" class="mr-2"></v-icon>
          {{ t('home.dashboard') }}
        </v-btn>
        <v-btn
          v-else-if="isCommissaire"
          to="/commissaire"
          color="primary"
          size="large"
          variant="outlined"
        >
          <v-icon icon="mdi-view-dashboard" class="mr-2"></v-icon>
          {{ t('home.dashboard') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/user'

const userStore = useUserStore()
const { t } = useI18n()
const isAdmin = computed(() => userStore.hasRole(UserRole.ADMIN))
const isCommissaire = computed(() => userStore.hasRole(UserRole.COMMISSIONER))
</script>
