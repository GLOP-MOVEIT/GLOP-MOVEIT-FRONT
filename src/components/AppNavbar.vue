<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/user'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import UserSearchBar from '@/components/UserSearchBar.vue'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const drawer = ref(false)
const isAdmin = computed(() => userStore.hasRole(UserRole.ADMIN))
const isReferee = computed(() => userStore.hasRole(UserRole.REFEREE))
const isAthlete = computed(
  () =>
    userStore.hasRole(UserRole.ATHLETE) &&
    !userStore.hasRole(UserRole.ADMIN) &&
    !userStore.hasRole(UserRole.REFEREE),
)

const isVolunteer = computed(
  () =>
    userStore.hasRole(UserRole.VOLUNTEER) &&
    !userStore.hasRole(UserRole.ADMIN) &&
    !userStore.hasRole(UserRole.REFEREE),
)

const menuItems = computed(() => [
  { title: t('nav.home'), icon: 'mdi-home', to: '/' },
  { title: t('nav.ticketing'), icon: 'mdi-ticket', to: '/billetterie' },
])

const logout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <v-app-bar color="primary" :elevation="2" app>
    <v-app-bar-nav-icon
      variant="text"
      @click.stop="drawer = !drawer"
      class="d-md-none"
    ></v-app-bar-nav-icon>
    <v-toolbar-title class="text-h5 font-weight-bold d-flex align-center title-shell mr-4">
      <router-link to="/" class="app-title">
        <v-icon icon="mdi-medal" class="mr-2"></v-icon>
        <span class="d-none d-md-inline">CiblOrgaSport - {{ t('nav.home') }}</span>
      </router-link>
    </v-toolbar-title>
    <UserSearchBar />
    <v-spacer></v-spacer>
    <div class="d-none d-md-flex app-nav-spacer"></div>
    <v-btn
      class="d-none d-md-inline-flex"
      variant="text"
      color="white"
      to="/billetterie"
    >
      <v-icon icon="mdi-ticket" class="mr-2"></v-icon>
      {{ t('nav.ticketing') }}
    </v-btn>
    <v-btn
      v-if="userStore.isAuthenticated && isAthlete"
      to="/mes-convocations"
      variant="outlined"
      color="white"
      class="mr-2"
      prepend-icon="mdi-calendar-clock"
    >
      {{ t('nav.myConvocations') }}
    </v-btn>
    <v-btn
      v-if="userStore.isAuthenticated && isVolunteer"
      to="/mes-taches"
      variant="outlined"
      color="white"
      class="mr-2"
      prepend-icon="mdi-clipboard-check-outline"
    >
      {{ t('nav.myTasks') }}
    </v-btn>
    <LanguageSwitcher class="ml-2" />
    <v-menu v-if="userStore.isAuthenticated">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item to="/profil">
          <v-list-item-title>{{ t('nav.profile') }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isAdmin" to="/admin">
          <v-list-item-title>{{ t('nav.adminPanel') }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isReferee" to="/referee">
          <v-list-item-title>{{ t('nav.refereePanel') }}</v-list-item-title>
        </v-list-item>
        <v-list-item to="/parametres">
          <v-list-item-title>{{ t('nav.settings') }}</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="logout">
          <v-list-item-title>{{ t('nav.logout') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn v-else to="/login" variant="text">
      <v-icon icon="mdi-login" class="mr-2"></v-icon>
      {{ t('nav.login') }}
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary app>
    <v-list>
      <v-list-item
        prepend-icon="mdi-medal"
        title="CiblOrgaSport"
        :subtitle="t('nav.menu')"
      ></v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list density="compact" nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.app-title {
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-decoration: none;
  color: inherit;
}

.app-title:hover {
  opacity: 0.9;
}

.app-nav-spacer {
  width: 16px;
}

.title-shell {
  flex: 0 0 auto;
  min-width: 0;
}

@media (max-width: 959px) {
  .app-title {
    min-width: 24px;
  }
}
</style>
