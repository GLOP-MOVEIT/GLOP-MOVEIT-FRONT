# Dockerfile pour la production (multi-stage build)

# Étape 1: Build de l'application
FROM node:22-alpine AS builder

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installe toutes les dépendances (nécessaires pour le build)
RUN npm ci

# Copie le code source
COPY . .

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