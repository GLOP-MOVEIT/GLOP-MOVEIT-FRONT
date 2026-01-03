<template>
  <v-container fluid class="py-6">
    <AdminLayout :title="t('admin.title')" :subtitle="t('admin.subtitle')" :items="menuItems">
      <router-view />
    </AdminLayout>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/AdminLayout.vue'

const { t } = useI18n()

const menuItems = [
  { title: t('admin.menuUsers'), icon: 'mdi-account-group', to: '/admin/users' },
  { title: t('admin.menuCompetitions'), icon: 'mdi-flag-checkered' },
  { title: t('admin.menuChampionships'), icon: 'mdi-trophy' },
]
</script>
