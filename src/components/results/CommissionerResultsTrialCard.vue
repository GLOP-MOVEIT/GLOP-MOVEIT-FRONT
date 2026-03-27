<template>
  <v-card variant="outlined" class="trial-card h-100">
    <div class="d-flex align-start justify-space-between ga-3 mb-4">
      <div>
        <div class="text-overline section-label">{{ competitionName }}</div>
        <div class="text-subtitle-1 font-weight-bold">{{ trialName }}</div>
        <div class="text-caption text-medium-emphasis mt-1">
          {{ roundLabel }} • {{ formattedDate }}
        </div>
      </div>
      <v-chip :color="statusColor" variant="tonal" size="small" label>
        {{ statusLabel }}
      </v-chip>
    </div>

    <div class="meta-list mb-4">
      <div class="meta-item">
        <v-icon size="16" color="primary">mdi-shape-outline</v-icon>
        <span>{{ competitionType }}</span>
      </div>
      <div class="meta-item">
        <v-icon size="16" color="primary">mdi-account-group</v-icon>
        <span>{{ participantType }}</span>
      </div>
    </div>

    <v-alert
      v-if="showNoLocation"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-0"
    >
      {{ noLocationLabel }}
    </v-alert>

    <v-btn
      v-else
      color="primary"
      variant="elevated"
      block
      @click="$emit('manage')"
    >
      <v-icon icon="mdi-pencil-outline" class="mr-2" />
      {{ manageLabel }}
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  competitionName: string
  competitionType: string
  participantType: string
  trialName: string
  roundLabel: string
  formattedDate: string
  statusLabel: string
  statusColor: string
  manageLabel: string
  noLocationLabel: string
  showNoLocation: boolean
}

defineProps<Props>()
defineEmits<{ manage: [] }>()
</script>

<style scoped>
.trial-card {
  padding: 18px;
  border-radius: 24px;
  border-color: rgba(25, 118, 210, 0.14);
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.05), rgba(255, 255, 255, 0.98) 120px),
    white;
}

.section-label {
  color: rgb(25, 118, 210);
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.06);
  font-size: 0.92rem;
}
</style>
