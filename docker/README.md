# Docker Configuration

Ce dossier contient les configurations Docker pour l'application GLOP-MOVEIT-FRONT.

## Fichiers

- **Dockerfile** : Configuration pour la production (multi-stage avec Nginx)
- **Dockerfile.dev** : Configuration pour le développement (avec hot-reload)
- **nginx.conf** : Configuration Nginx pour la production

## Usage

### Développement
```bash
# Depuis la racine du projet
docker-compose --profile dev up --build

# Ou directement avec Docker
docker build -f docker/Dockerfile.dev -t glop-moveit-dev .
docker run -p 5173:5173 -v ${PWD}:/app -v /app/node_modules glop-moveit-dev
```

### Production
```bash
# Depuis la racine du projet
docker-compose --profile prod up --build

# Ou directement avec Docker
docker build -f docker/Dockerfile -t glop-moveit-prod .
docker run -p 80:80 glop-moveit-prod
```

## Ports

- **Développement** : http://localhost:5173
- **Production** : http://localhost