<script setup lang="ts">
import { ref } from 'vue'

type AdminMenuItem = {
  title: string
  icon: string
  to?: string
}

defineProps<{
  title: string
  subtitle: string
  items: AdminMenuItem[]
}>()

const isRail = ref(false)
</script>

<template>
  <div class="admin-shell">
    <v-navigation-drawer :rail="isRail" permanent class="admin-drawer">
      <v-list density="compact">
        <v-list-item
          :prepend-icon="'mdi-menu'"
          :title="!isRail ? title : undefined"
          @click="isRail = !isRail"
          :aria-label="isRail ? 'Expand menu' : 'Collapse menu'"
        ></v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          exact
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <div class="admin-content">
      <h1 class="text-h4 font-weight-bold mb-1">{{ title }}</h1>
      <p class="text-subtitle-1 text-grey-darken-1 mb-6">
        {{ subtitle }}
      </p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 70vh;
}

.admin-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.admin-content {
  flex: 1;
  padding: 24px;
}
</style>
