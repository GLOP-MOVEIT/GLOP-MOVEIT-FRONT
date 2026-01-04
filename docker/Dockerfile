# Dockerfile pour la production (multi-stage build)

# Étape 1: Build de l'application
FROM node:22-alpine AS builder

# Définit le répertoire de travail
WORKDIR /app

# Augmente la mémoire pour Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copie les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installe toutes les dépendances (nécessaires pour le build)
RUN npm ci

# Copie le code source (.env est exclu via .dockerignore)
COPY . .

# Configuration pour le build de production
# IMPORTANT: VITE_API_BASE_URL doit être vide pour utiliser le proxy nginx
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=""

# Build l'application pour la production
RUN npm run build

# Étape 2: Serveur de production
FROM nginx:alpine AS production

# Copie les fichiers construits depuis l'étape builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie la configuration nginx personnalisée
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Expose le port 80
EXPOSE 80

# Nginx se lance automatiquement
CMD ["nginx", "-g", "daemon off;"]