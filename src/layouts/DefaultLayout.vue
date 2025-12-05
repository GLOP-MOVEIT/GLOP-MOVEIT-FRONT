<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const drawer = ref(false)

const menuItems = [
  { title: 'Accueil', icon: 'mdi-home', to: '/' },
]

const currentYear = computed(() => new Date().getFullYear())

const logout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <v-app>
    <v-app-bar 
      color="primary" 
      :elevation="2"
      app
    >
      <v-app-bar-nav-icon 
        variant="text" 
        @click.stop="drawer = !drawer"
        class="d-md-none"
      ></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h5 font-weight-bold">
        <v-icon icon="mdi-medal" class="mr-2"></v-icon>
        CiblOrgaSport
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn 
        v-for="item in menuItems" 
        :key="item.title"
        :to="item.to"
        variant="text"
        class="d-none d-md-flex"
      >
        <v-icon :icon="item.icon" class="mr-2"></v-icon>
        {{ item.title }}
      </v-btn>
      <v-menu v-if="userStore.isAuthenticated">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <!-- TODO: Mon profil & paramètres : modification/ préférences etc-->
            <v-list-item-title>Mon profil</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Paramètres</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="logout">
            <v-list-item-title>Déconnexion</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn 
        v-else
        to="/login"
        variant="text"
      >
        <v-icon icon="mdi-login" class="mr-2"></v-icon>
        Connexion
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      temporary
      app
    >
      <v-list>
        <v-list-item
          prepend-icon="mdi-medal"
          title="CiblOrgaSport"
          subtitle="Menu"
        ></v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid class="pa-0">
        <router-view />
      </v-container>
    </v-main>
    <v-footer 
      color="grey-lighten-3" 
      app
      class="d-flex flex-column flex-md-row align-center"
    >
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="6" class="text-center text-md-left">
            <strong>CiblOrgaSport</strong> © {{ currentYear }} - Tous droits réservés
          </v-col>
          <v-col cols="12" md="6" class="text-center text-md-right">
            <v-btn 
              variant="text" 
              size="small" 
              href="#" 
              class="mx-1"
            >
              Mentions légales
            </v-btn>
            <v-btn 
              variant="text" 
              size="small" 
              href="#" 
              class="mx-1"
            >
              Confidentialité
            </v-btn>
            <v-btn 
              variant="text" 
              size="small" 
              href="#" 
              class="mx-1"
            >
              Contact
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>


<style scoped>
.v-toolbar-title {
  display: flex;
  align-items: center;
}
</style>
