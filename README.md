# watermelondb-server-prisma

## Local environment

### Database

You need a PostgreSQL Database. You can start one with docker.

```bash
# Start a DB with docker
docker run --name watermelondb-server-prisma-db -p 5432:5432 -e POSTGRES_USER="myuser" -e POSTGRES_PASSWORD="mypass123" -e POSTGRES_DB="wdb" -d postgres:14
```

### Hands-on

The project requires `node` installed and `yarn` insted of `npm`

```bash
# Setup credentials for the project (fill in the file)
cp .env.example .env

# Install dependencies
yarn install

# Start server
yarn watch
```

## Docker environment

The app and the database must be on the same network. This can be achieved manually, ...

```bash
# Build image
docker build -t watermelondb-server-prisma .

# Create network
docker network create wdbs

# Deploy database on the network
docker run --name watermelondb-server-prisma-db -p 5432:5432 -e POSTGRES_USER="myuser" -e POSTGRES_PASSWORD="mypass123" -e POSTGRES_DB="wdb" -d --network wdbs postgres:14

# Test image (not working on local env for network issues)
docker run -e DATABASE_URL="postgres://myuser:mypass123@watermelondb-server-prisma-db:5432/wdb" --name demo -p 5000:5000 --network wdbs watermelondb-server-prisma
```

... or with `docker-compose`

```bash
# Run with docker compose
docker-compose up -d --build
```
