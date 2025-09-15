# Smart parking system website

## ⇁ GUIDE TO RUN PROJECT

- Clone this project<br>
- Run docker compose file:

```bash
docker-compose up -d
```

- Migrate DB and make seed data:

```bash
    docker exec -it huygia12/sps-express-server sh -c "
    npx prisma migrate deploy --schema=./prisma/schema.prisma &&
    npx prisma generate --schema=./prisma/schema.prisma &&
    node dist/prisma/seed.js
    "
```
