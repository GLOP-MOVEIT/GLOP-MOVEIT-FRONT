<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { User } from '@/types/user'

defineProps<{
  profile: User
}>()

const { t } = useI18n()
</script>

<template>
  <v-row>
    <v-col cols="12">
      <div class="text-overline mb-2">{{ t('publicProfile.identitySection') }}</div>
      <div class="text-body-1">
        {{ `${profile.firstName} ${profile.surname}`.trim() || '-' }}
      </div>
      <div class="text-body-2 text-grey-darken-1 mt-2">
        <strong>{{ t('publicProfile.userIdLabel') }}</strong>
        #{{ profile.userId }}
      </div>
    </v-col>
  </v-row>
</template>
