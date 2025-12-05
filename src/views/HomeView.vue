<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <v-icon icon="mdi-trophy" size="120" color="primary" class="mb-6"></v-icon>
        
        <h1 class="text-h3 font-weight-bold mb-4">
          Bienvenue sur CiblOrgaSport
        </h1>
        
        <p class="text-h6 text-grey-darken-1 mb-8">
          La plateforme de gestion de compétitions sportives
        </p>

        <v-btn
          v-if="!userStore.isAuthenticated"
          to="/login"
          color="primary"
          size="large"
          class="mr-4"
        >
          <v-icon icon="mdi-login" class="mr-2"></v-icon>
          Se connecter
        </v-btn>

        <v-btn
          v-else
          color="primary"
          size="large"
          variant="outlined"
        >
          <v-icon icon="mdi-view-dashboard" class="mr-2"></v-icon>
          Tableau de bord
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
