<template>
  <v-container fluid class="py-6">
    <AdminLayout
      :title="t('commissioner.title')"
      :subtitle="t('commissioner.subtitle')"
      :items="menuItems"
    >
      <router-view />
    </AdminLayout>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/AdminLayout.vue'

const { t } = useI18n()

const menuItems = computed(() => [
  {
    title: t('commissioner.menuOverview'),
    icon: 'mdi-view-dashboard',
    to: '/commissaire',
  },
  {
    title: t('commissioner.menuRequests'),
    icon: 'mdi-file-document-check',
    to: '/commissaire/demandes',
  },
])
</script>
