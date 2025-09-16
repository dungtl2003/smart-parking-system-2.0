# Smart parking system website

## ⇁ GUIDE TO RUN PROJECT (ONLY WEB PARTS)

- Clone this project<br>
- Run docker compose file:

```bash
docker-compose up -d
```

- Migrate DB and make seed data:

```bash
    docker exec -it sps-express-server-container sh -c "
    npx prisma migrate deploy --schema=./prisma/schema.prisma &&
    npx prisma generate --schema=./prisma/schema.prisma &&
    node dist/prisma/seed.js
    "
```

## PGADMIN TUTORIAL

- Go to [http://localhost:8081]
  <br/>
- Enter the email, password which are specified as environment variables for pgadmin service in [docker-compose file](docker-compose.yml)
  <br/>
  <img src="./a.public/pg-admin-login.png" hspace="10" vspace="10">

- Next, click "Query Tool Workspace"
  <br/>
  <img src="./a.public/pg-admin-query-tools-workspace.png" hspace="10" vspace="10">

- Finally, connect to the database by entering the values you specified as environment variables for postgres service in [docker-compose file](docker-compose.yml)
  <br/>
  <img src="./a.public/pg-admin-connect-db.png" hspace="10" vspace="10">

### Some basic/useful SQL queries:

- List all tables:

```SQL
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

- Get all users:

```SQL
SELECT *
FROM public."User";
```

  <br/>
  <img src="./a.public/pg-admin-query-user-data.png" hspace="10" vspace="10">
