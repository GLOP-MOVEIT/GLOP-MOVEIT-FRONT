import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    nav: {
      home: 'Home',
      profile: 'My profile',
      adminPanel: 'Admin panel',
      settings: 'Settings',
      logout: 'Sign out',
      login: 'Sign in',
      menu: 'Menu',
      language: 'Language',
    },
    footer: {
      rightsReserved: 'All rights reserved',
      legal: 'Legal notice',
      privacy: 'Privacy',
      contact: 'Contact',
    },
    home: {
      title: 'Welcome to CiblOrgaSport',
      subtitle: 'The platform for managing sports competitions',
      signIn: 'Sign in',
      dashboard: 'Dashboard',
    },
    admin: {
      title: 'Administration',
      subtitle: 'Administer users and application rules',
      menuUsers: 'Users',
      menuCompetitions: 'Events',
      menuChampionships: 'Championships',
      overviewInfo:
        'This space summarizes your responsibilities as administrator. Use the menu to act.',
      roleGovernanceTitle: 'Role governance',
      roleGovernanceBody:
        'Validate commissioner assignments and ensure role changes follow the rules.',
      roleGovernanceHint: 'Only admins can promote users to COMMISSAIRE.',
      moderationTitle: 'Competition oversight',
      moderationBody:
        'Keep the ecosystem healthy: review requests and monitor published data.',
      moderationHint: 'Future tools will include championships and events.',
      usersSection: 'Users',
      usersInfo: 'User management will be connected to the API soon.',
      userName: 'Name',
      userEmail: 'Email',
      userRole: 'Role',
      userActions: 'Actions',
      noUsers: 'No users to display yet.',
      loading: 'Loading users...',
      usersError: 'Unable to load users.',
      promoteCommissaire: 'Promote to COMMISSAIRE',
      backToDashboard: 'Back to admin',
      competitionsSection: 'Events',
      competitionsInfo: 'Upcoming management for events and races.',
      championshipsSection: 'Championships',
      championshipsInfo: 'Upcoming management for championships.',
    },
    about: {
      tagline:
        'Your complete platform to follow and organize sports competitions',
      spectatorsTitle: 'For spectators',
      spectatorsBody:
        'Find all information about sports competitions: schedules, results, rankings, and real-time news.',
      organizersTitle: 'For organizers',
      organizersBody:
        'As an administrator or commissioner, organize and manage your competitions easily with our dedicated tools.',
    },
    login: {
      subtitleRegister: 'Create your account',
      subtitleLogin: 'Sign in to your account',
      emailLabel: 'Email address',
      passwordLabel: 'Password',
      rememberMe: 'Remember me',
      signIn: 'Sign in',
      forgotPassword: 'Forgot your password?',
      firstName: 'First name',
      surname: 'Last name',
      phoneNumber: 'Phone number',
      confirmPassword: 'Confirm password',
      acceptNotifications:
        'I agree to receive notifications about events and competitions',
      acceptLocation:
        'I agree to be located in real time during events',
      acceptTermsText: 'I accept the',
      termsLink: 'terms and conditions',
      signUp: 'Sign up',
      alreadyAccount: 'Already have an account?',
      noAccount: 'No account yet?',
      secureLogin: 'Secure login',
      competitionsManagement: 'Competition management',
      sportEvents: 'Sport events',
      invalidCredentials: 'Incorrect email or password',
      registerError: 'An error occurred during registration',
      registerSuccess:
        'Registration successful! You can now sign in.',
      passwordRecovery: 'Password recovery feature to be implemented',
    },
    forgotPassword: {
      title: 'Reset password',
      description:
        'Enter your email address to receive reset instructions. This is a placeholder and will be wired later.',
      submit: 'Send',
      cancel: 'Cancel',
      required: 'Please enter your email address.',
      invalid: 'Please enter a valid email address.',
      success: 'We would send you an email if this was connected.',
    },
    profile: {
      title: 'My profile',
      subtitle: 'Review your account details',
      primaryRole: 'Main role:',
      identitySection: 'Identity',
      accountSection: 'Account',
      rolesSection: 'Roles',
      roleRequestSection: 'Role requests',
      roleRequestInfo:
        'You can request additional roles. The forms will be added later.',
      requestSportif: 'Request SPORTIF role',
      requestVolontaire: 'Request VOLONTAIRE role',
      emailLabel: 'Email:',
      phoneLabel: 'Phone:',
      joinedLabel: 'Member since:',
      notificationsLabel: 'Notifications:',
      locationLabel: 'Location tracking:',
      yes: 'Yes',
      no: 'No',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your preferences',
      preferencesSection: 'Preferences',
      displaySection: 'Display',
      securitySection: 'Security',
      notifications: 'Receive notifications',
      location: 'Allow location tracking during events',
      textSize: 'Text size',
      textSizeSmall: 'Small',
      textSizeNormal: 'Normal',
      textSizeLarge: 'Large',
      dyslexiaMode: 'Dyslexia-friendly mode',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      save: 'Save',
      reset: 'Reset',
      saved: 'Settings saved locally. API connection will come later.',
      passwordMismatch: 'Passwords do not match.',
    },
    roleRequest: {
      title: 'Role request',
      subtitle: 'Request form for: {role}',
      note:
        'This request will be reviewed by a commissioner after checking your documents.',
      sportifTitle: 'Sportif request',
      volontaireTitle: 'Volontaire request',
      sportPassport: 'Sport passport',
      medicalCertificate: 'Medical certificate',
      antidopingCharter: 'Anti-doping charter (signed)',
      identityCard: 'Identity card',
      motivationLetter: 'Motivation letter',
      trackingConsent: 'I accept traceability for competitions',
      submit: 'Submit request',
      requiredDocument: 'This document is required.',
      requiredConsent: 'You must accept traceability.',
      placeholderSubmit: 'Request saved locally. API connection will come later.',
      backToProfile: 'Back to profile',
      unknownRole: 'Unknown role',
    },
    roles: {
      SPECTATOR: 'Spectator',
      SPORTIF: 'Athlete',
      VOLONTAIRE: 'Volunteer',
      COMMISSAIRE: 'Commissioner',
      ADMIN: 'Admin',
    },
    validation: {
      emailRequired: 'Email is required',
      emailInvalid: 'Email must be valid',
      passwordRequired: 'Password is required',
      passwordMin: 'Password must be at least 6 characters',
      firstNameRequired: 'First name is required',
      surnameRequired: 'Last name is required',
      phoneRequired: 'Phone number is required',
      phoneInvalid: 'Phone number must be 10 digits',
      confirmPasswordRequired: 'Confirmation is required',
      passwordsMismatch: 'Passwords do not match',
      termsRequired: 'You must accept the terms',
    },
    locales: {
      fr: 'French',
      en: 'English',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      profile: 'Mon profil',
      adminPanel: 'Panel admin',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      login: 'Connexion',
      menu: 'Menu',
      language: 'Langue',
    },
    footer: {
      rightsReserved: 'Tous droits réservés',
      legal: 'Mentions légales',
      privacy: 'Confidentialité',
      contact: 'Contact',
    },
    home: {
      title: 'Bienvenue sur CiblOrgaSport',
      subtitle: 'La plateforme de gestion de compétitions sportives',
      signIn: 'Se connecter',
      dashboard: 'Tableau de bord',
    },
    admin: {
      title: 'Administration',
      subtitle: 'Administrer les utilisateurs et les règles de l’application',
      menuUsers: 'Utilisateurs',
      menuCompetitions: 'Épreuves',
      menuChampionships: 'Championnats',
      overviewInfo:
        'Cet espace résume vos responsabilités d’administrateur. Utilisez le menu pour agir.',
      roleGovernanceTitle: 'Gouvernance des rôles',
      roleGovernanceBody:
        'Validez les affectations de commissaires et appliquez les règles de promotion.',
      roleGovernanceHint: 'Seuls les admins peuvent promouvoir COMMISSAIRE.',
      moderationTitle: 'Supervision des compétitions',
      moderationBody:
        'Assurez la qualité des données : demandes, inscriptions et publications.',
      moderationHint: 'Les outils pour épreuves et championnats arrivent bientôt.',
      usersSection: 'Utilisateurs',
      usersInfo: 'La gestion des utilisateurs sera reliée à l\'API prochainement.',
      userName: 'Nom',
      userEmail: 'Email',
      userRole: 'Rôle',
      userActions: 'Actions',
      noUsers: 'Aucun utilisateur à afficher pour le moment.',
      loading: 'Chargement des utilisateurs...',
      usersError: 'Impossible de charger les utilisateurs.',
      promoteCommissaire: 'Promouvoir COMMISSAIRE',
      backToDashboard: 'Retour au panel admin',
      competitionsSection: 'Épreuves',
      competitionsInfo: 'Gestion des épreuves et courses à venir.',
      championshipsSection: 'Championnats',
      championshipsInfo: 'Gestion des championnats à venir.',
    },
    about: {
      tagline:
        'Votre plateforme complète pour suivre et organiser des compétitions sportives',
      spectatorsTitle: 'Pour les spectateurs',
      spectatorsBody:
        'Retrouvez toutes les informations sur les compétitions sportives : calendriers, résultats, classements et actualités en temps réel.',
      organizersTitle: 'Pour les organisateurs',
      organizersBody:
        'En tant qu\'administrateur ou commissaire, organisez et gérez vos compétitions facilement avec nos outils dédiés.',
    },
    login: {
      subtitleRegister: 'Créez votre compte',
      subtitleLogin: 'Connectez-vous à votre espace',
      emailLabel: 'Adresse email',
      passwordLabel: 'Mot de passe',
      rememberMe: 'Se souvenir de moi',
      signIn: 'Se connecter',
      forgotPassword: 'Mot de passe oublié ?',
      firstName: 'Prénom',
      surname: 'Nom',
      phoneNumber: 'Numéro de téléphone',
      confirmPassword: 'Confirmer le mot de passe',
      acceptNotifications:
        'J\'accepte de recevoir des notifications sur les événements et compétitions',
      acceptLocation:
        'J\'accepte d\'être localisé(e) en temps réel lors des événements',
      acceptTermsText: 'J\'accepte les',
      termsLink: 'conditions générales d\'utilisation',
      signUp: 'S\'inscrire',
      alreadyAccount: 'Déjà un compte ?',
      noAccount: 'Pas encore de compte ?',
      secureLogin: 'Connexion sécurisée',
      competitionsManagement: 'Gestion des compétitions',
      sportEvents: 'Événements sportifs',
      invalidCredentials: 'Email ou mot de passe incorrect',
      registerError: 'Une erreur est survenue lors de l\'inscription',
      registerSuccess:
        'Inscription réussie ! Vous pouvez maintenant vous connecter.',
      passwordRecovery:
        'Fonctionnalité de récupération de mot de passe à implémenter',
    },
    forgotPassword: {
      title: 'Réinitialiser le mot de passe',
      description:
        'Saisissez votre adresse email pour recevoir les instructions. Cette fonctionnalité sera reliée ultérieurement.',
      submit: 'Envoyer',
      cancel: 'Annuler',
      required: 'Veuillez saisir votre adresse email.',
      invalid: 'Veuillez saisir une adresse email valide.',
      success: 'Un email serait envoyé si la fonctionnalité était active.',
    },
    profile: {
      title: 'Mon profil',
      subtitle: 'Retrouvez les informations de votre compte',
      primaryRole: 'Rôle principal :',
      identitySection: 'Identité',
      accountSection: 'Compte',
      rolesSection: 'Rôles',
      roleRequestSection: 'Demandes de rôle',
      roleRequestInfo:
        'Vous pouvez demander des rôles supplémentaires. Les formulaires seront ajoutés plus tard.',
      requestSportif: 'Demander le rôle SPORTIF',
      requestVolontaire: 'Demander le rôle VOLONTAIRE',
      emailLabel: 'Email :',
      phoneLabel: 'Téléphone :',
      joinedLabel: 'Membre depuis :',
      notificationsLabel: 'Notifications :',
      locationLabel: 'Localisation :',
      yes: 'Oui',
      no: 'Non',
    },
    settings: {
      title: 'Paramètres',
      subtitle: 'Gérez vos préférences',
      preferencesSection: 'Préférences',
      displaySection: 'Affichage',
      securitySection: 'Sécurité',
      notifications: 'Recevoir des notifications',
      location: 'Autoriser la localisation lors des événements',
      textSize: 'Taille du texte',
      textSizeSmall: 'Petite',
      textSizeNormal: 'Normale',
      textSizeLarge: 'Grande',
      dyslexiaMode: 'Mode dyslexie',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      save: 'Enregistrer',
      reset: 'Réinitialiser',
      saved: 'Paramètres enregistrés localement. Liaison API à venir.',
      passwordMismatch: 'Les mots de passe ne correspondent pas.',
    },
    roleRequest: {
      title: 'Demande de rôle',
      subtitle: 'Formulaire de demande pour : {role}',
      note:
        'Cette demande sera examinée par un commissaire après vérification des documents.',
      sportifTitle: 'Demande SPORTIF',
      volontaireTitle: 'Demande VOLONTAIRE',
      sportPassport: 'Passeport sportif',
      medicalCertificate: 'Certificat médical',
      antidopingCharter: 'Charte antidopage signée',
      identityCard: 'Carte d\'identité',
      motivationLetter: 'Lettre de motivation',
      trackingConsent: 'J\'accepte la traçabilité en compétition',
      submit: 'Envoyer la demande',
      requiredDocument: 'Ce document est requis.',
      requiredConsent: 'Vous devez accepter la traçabilité.',
      placeholderSubmit: 'Demande enregistrée localement. Liaison API à venir.',
      backToProfile: 'Retour au profil',
      unknownRole: 'Rôle inconnu',
    },
    roles: {
      SPECTATOR: 'Spectateur',
      SPORTIF: 'Sportif',
      VOLONTAIRE: 'Volontaire',
      COMMISSAIRE: 'Commissaire',
      ADMIN: 'Admin',
    },
    validation: {
      emailRequired: 'L\'email est requis',
      emailInvalid: 'L\'email doit être valide',
      passwordRequired: 'Le mot de passe est requis',
      passwordMin: 'Le mot de passe doit contenir au moins 6 caractères',
      firstNameRequired: 'Le prénom est requis',
      surnameRequired: 'Le nom est requis',
      phoneRequired: 'Le numéro de téléphone est requis',
      phoneInvalid: 'Le numéro doit contenir 10 chiffres',
      confirmPasswordRequired: 'La confirmation est requise',
      passwordsMismatch: 'Les mots de passe ne correspondent pas',
      termsRequired: 'Vous devez accepter les conditions',
    },
    locales: {
      fr: 'Français',
      en: 'Anglais',
    },
  },
}

const availableLocales = Object.keys(messages)
const defaultLocale = 'fr'

const getStartingLocale = () => {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const storedLocale = localStorage.getItem('locale')
  if (storedLocale && availableLocales.includes(storedLocale)) {
    return storedLocale
  }

  const browserLocale = navigator.language.split('-')[0]
  if (availableLocales.includes(browserLocale)) {
    return browserLocale
  }

  return defaultLocale
}

const i18n = createI18n({
  legacy: false,
  locale: getStartingLocale(),
  fallbackLocale: 'en',
  messages,
})

export default i18n
