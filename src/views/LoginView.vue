<template>
  <v-container fluid class="fill-height login-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <v-card 
          elevation="8" 
          rounded="lg"
          class="mx-auto"
        >
          <!-- En-tête de la carte -->
          <v-card-item class="text-center pa-6 bg-primary">
            <v-icon 
              icon="mdi-medal" 
              size="x-large" 
              color="white"
              class="mb-3"
            ></v-icon>
            <v-card-title class="text-h4 font-weight-bold text-white">
              CiblOrgaSport
            </v-card-title>
            <v-card-subtitle class="text-white">
              {{ showRegisterForm ? 'Créez votre compte' : 'Connectez-vous à votre espace' }}
            </v-card-subtitle>
          </v-card-item>

          <!-- Formulaire de connexion -->
          <v-card-text class="pa-6">
            <!-- FORMULAIRE DE CONNEXION -->
            <v-form 
              v-if="!showRegisterForm"
              ref="form" 
              v-model="valid"
              @submit.prevent="handleLogin"
            >
              <!-- Champ email -->
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Adresse email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                type="email"
                required
                class="mb-3"
                :error-messages="errorMessage"
              ></v-text-field>

              <!-- Champ mot de passe -->
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Mot de passe"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                required
                @click:append-inner="showPassword = !showPassword"
                :error-messages="errorMessage"
              ></v-text-field>

              <!-- Se souvenir de moi -->
              <v-checkbox
                v-model="rememberMe"
                label="Se souvenir de moi"
                color="primary"
                hide-details
                class="mb-4"
              ></v-checkbox>

              <!-- Message d'erreur global -->
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <!-- Bouton de connexion -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!valid || loading"
                class="mb-3"
              >
                <v-icon left class="mr-2">mdi-login</v-icon>
                Se connecter
              </v-btn>

              <!-- Mot de passe oublié -->
              <div class="text-center">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  @click="forgotPassword"
                >
                  Mot de passe oublié ?
                </v-btn>
              </div>
            </v-form>

            <!-- FORMULAIRE D'INSCRIPTION -->
            <v-form 
              v-else
              ref="registerForm" 
              v-model="validRegister"
              @submit.prevent="handleRegister"
            >
              <!-- Nom -->
              <v-text-field
                v-model="registerData.firstName"
                :rules="[(v) => !!v || 'Le prénom est requis']"
                label="Prénom"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
                class="mb-3"
              ></v-text-field>

              <!-- Prénom -->
              <v-text-field
                v-model="registerData.lastName"
                :rules="[(v) => !!v || 'Le nom est requis']"
                label="Nom"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
                class="mb-3"
              ></v-text-field>

              <!-- Email -->
              <v-text-field
                v-model="registerData.email"
                :rules="emailRules"
                label="Adresse email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                type="email"
                required
                class="mb-3"
              ></v-text-field>

              <!-- Mot de passe -->
              <v-text-field
                v-model="registerData.password"
                :rules="passwordRules"
                label="Mot de passe"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                required
                @click:append-inner="showPassword = !showPassword"
                class="mb-3"
              ></v-text-field>

              <!-- Confirmation mot de passe -->
              <v-text-field
                v-model="registerData.confirmPassword"
                :rules="[
                  (v) => !!v || 'La confirmation est requise',
                  (v) => v === registerData.password || 'Les mots de passe ne correspondent pas'
                ]"
                label="Confirmer le mot de passe"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                required
                @click:append-inner="showPassword = !showPassword"
                class="mb-3"
              ></v-text-field>

              <!-- Options de consentement -->
              <v-checkbox
                v-model="registerData.acceptNotifications"
                color="primary"
                hide-details
                class="mb-2"
              >
                <template v-slot:label>
                  <div class="text-caption">
                    J'accepte de recevoir des notifications sur les événements et compétitions
                  </div>
                </template>
              </v-checkbox>

              <v-checkbox
                v-model="registerData.acceptLocation"
                color="primary"
                hide-details
                class="mb-2"
              >
                <template v-slot:label>
                  <div class="text-caption">
                    J'accepte d'être localisé(e) en temps réel lors des événements
                  </div>
                </template>
              </v-checkbox>

              <v-checkbox
                v-model="registerData.acceptTerms"
                :rules="[(v) => !!v || 'Vous devez accepter les conditions']"
                color="primary"
                class="mb-4"
              >
                <template v-slot:label>
                  <div class="text-caption">
                    J'accepte les <a href="#" @click.stop>conditions générales d'utilisation</a>
                  </div>
                </template>
              </v-checkbox>

              <!-- Message d'erreur global -->
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <!-- Bouton d'inscription -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!validRegister || loading"
                class="mb-3"
              >
                <v-icon left class="mr-2">mdi-account-plus</v-icon>
                S'inscrire
              </v-btn>
            </v-form>
          </v-card-text>

          <!-- Pied de carte - Basculer entre connexion/inscription -->
          <v-divider></v-divider>
          <v-card-actions class="justify-center pa-4">
            <span class="text-body-2 mr-2">
              {{ showRegisterForm ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
            </span>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="toggleForm"
            >
              {{ showRegisterForm ? 'Se connecter' : 'S\'inscrire' }}
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Info supplémentaire responsive -->
        <v-row class="mt-6" justify="center">
          <v-col cols="12" sm="4" class="text-center">
            <v-icon color="white" size="large">mdi-shield-check</v-icon>
            <div class="text-caption mt-2 text-white">Connexion sécurisée</div>
          </v-col>
          <v-col cols="12" sm="4" class="text-center">
            <v-icon color="white" size="large">mdi-trophy</v-icon>
            <div class="text-caption mt-2 text-white">Gestion des compétitions</div>
          </v-col>
          <v-col cols="12" sm="4" class="text-center">
            <v-icon color="white" size="large">mdi-calendar-check</v-icon>
            <div class="text-caption mt-2 text-white">Événements sportifs</div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { LoginRequest, RegisterRequest } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

// États du formulaire
const form = ref()
const registerForm = ref()
const valid = ref(false)
const validRegister = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showRegisterForm = ref(false)

// Données d'inscription
const registerData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  acceptNotifications: false,
  acceptLocation: false,
})

// Règles de validation
const emailRules = [
  (v: string) => !!v || 'L\'email est requis',
  (v: string) => /.+@.+\..+/.test(v) || 'L\'email doit être valide',
]

const passwordRules = [
  (v: string) => !!v || 'Le mot de passe est requis',
  (v: string) => v.length >= 6 || 'Le mot de passe doit contenir au moins 6 caractères',
]

// Gestion de la connexion
const handleLogin = async () => {
  errorMessage.value = ''
  
  const { valid } = await form.value.validate()
  
  if (!valid) return

  loading.value = true

  try {
    const credentials: LoginRequest = {
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
    }

    await userStore.login(credentials)
    
    // Redirection après connexion réussie
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Email ou mot de passe incorrect'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

// Mot de passe oublié
const forgotPassword = () => {
  // TODO: Implémenter la logique de récupération de mot de passe
  console.log('Forgot password clicked')
  alert('Fonctionnalité de récupération de mot de passe à implémenter')
}

// Basculer entre connexion et inscription
const toggleForm = () => {
  showRegisterForm.value = !showRegisterForm.value
  errorMessage.value = ''
  email.value = ''
  password.value = ''
  registerData.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptNotifications: false,
    acceptLocation: false,
  }
}

// Gestion de l'inscription
const handleRegister = async () => {
  errorMessage.value = ''
  
  const { valid } = await registerForm.value.validate()
  
  if (!valid) return

  loading.value = true

  try {
    const userData: RegisterRequest = {
      firstName: registerData.value.firstName,
      lastName: registerData.value.lastName,
      email: registerData.value.email,
      password: registerData.value.password,
      confirmPassword: registerData.value.confirmPassword,
      acceptTerms: registerData.value.acceptTerms,
      acceptNotifications: registerData.value.acceptNotifications,
      acceptLocation: registerData.value.acceptLocation,
    }

    await userStore.register(userData)
    
    // Après inscription réussie, rediriger vers l'accueil
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
    console.error('Register error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #006747 0%, #00A86B 100%);
}

/* Media queries pour une meilleure responsivité */
@media (max-width: 600px) {
  .login-container {
    padding: 16px;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .login-container {
    padding: 24px;
  }
}

@media (min-width: 961px) {
  .login-container {
    padding: 32px;
  }
}
</style>
