# Exécution conteneurisée

## Services

| Service | Rôle | Accès hôte |
|---|---|---|
| `frontend` | Angular servi par Nginx | <http://localhost:8080> |
| `api` | API Express et Swagger | <http://localhost:5000/api-docs> |
| `scheduler` | Planification interne gRPC | réseau Docker uniquement |
| `database` | MySQL 8.4 persistant | `localhost:3307` |
| `database-init` | migrations Prisma et seed | tâche ponctuelle |
| `mailpit` | capture des courriels locaux | <http://localhost:8025> |

Le frontend transmet `/api` à l’API. L’API communique avec le scheduler sur
`scheduler:50051`. Les deux backends utilisent la même base MySQL.

## Démarrage

Depuis le dépôt `grm` :

```powershell
Copy-Item .env.docker.example .env.docker
# Modifier toutes les valeurs signalées comme devant être remplacées.
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
```

Au premier démarrage, `database-init` applique les migrations, initialise les
spécialités et symptômes, puis crée le compte administrateur défini dans
`.env.docker`. La tâche doit terminer avec le code `0`.

## Commandes d’exploitation

```powershell
docker compose --env-file .env.docker logs -f api scheduler
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker down
```

`down` conserve la base dans le volume `mysql_data`. Pour réinitialiser
volontairement toutes les données :

```powershell
docker compose --env-file .env.docker down --volumes
```

Cette dernière commande supprime définitivement la base conteneurisée.
