<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3" class="pa-6">
          <div class="text-center mb-6">
            <v-icon icon="mdi-medal" size="80" color="primary" class="mb-4"></v-icon>
            <h1 class="text-h3 mb-4">CiblOrgaSport</h1>
          </div>
          
          <v-card-text class="text-center">
            <p class="text-h6 mb-4">
              {{ t('about.tagline') }}
            </p>
            
            <v-divider class="my-6"></v-divider>
            
            <v-row class="mt-6">
              <v-col cols="12" md="6">
                <v-icon icon="mdi-eye" size="60" color="primary" class="mb-3"></v-icon>
                <h3 class="text-h5 mb-2">{{ t('about.spectatorsTitle') }}</h3>
                <p class="text-body-1">
                  {{ t('about.spectatorsBody') }}
                </p>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-icon icon="mdi-account-cog" size="60" color="success" class="mb-3"></v-icon>
                <h3 class="text-h5 mb-2">{{ t('about.organizersTitle') }}</h3>
                <p class="text-body-1">
                  {{ t('about.organizersBody') }}
                </p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
