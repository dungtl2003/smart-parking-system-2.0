# SPS apis

<img src="./src/assets/logokma.png" align="left"
width="150" hspace="10" vspace="10">

||

BE server for [Smart parking system website](./templates/.env.template). This project uses Expressjs, Typescript and Socket.io

**_CT6_**

||

---

## ⇁ List of environment variables

| Variable          | Required | Purpose                                                                                      |
| ----------------- | -------- | -------------------------------------------------------------------------------------------- |
| DATABASE_URL      | YES      | your choosen database url                                                                    |
| AT_SECRET_KEY     | YES      | use to generate, verify accesstoken                                                          |
| RT_SECRET_KEY     | YES      | use to generate, verify refreshtoken                                                         |
| PORT              | NO       | port to run project, it is set to `8000` by default                                          |
| NODE_ENV          | NO       | environment, can take value of `development` or `production`, default value is `development` |
| CLIENT_DOMAIN     | NO       | client domain, need to specify to pass CORS                                                  |
| CLIENT_PORT       | NO       | client port, like `CLIENT_DOMAIN` but used to develop in local                               |
| CAMERA_SERVER_API | YES      | server that connects with camera to detect license plate                                     |

For the full .env file example, check
out [this template](./templates/.env.template) <br>

## ⇁ Development

first, clone this project<br>
next, config your .env file<br>
then setup prisma:

```shell
npm run db-generate
```

you can check the invalid code with this command:

```shell
npm run lint
```

you can run the development server in local by this command:

```shell
npm run dev
```

ngrok:

```shell
ngrok http --url=https://deciding-present-cattle.ngrok-free.app 4000
```

you can test app in production environment by running:

```shell
npm run build
npm run start
```

## ⇁ Database schema

<img src="./src/assets/schema.svg">

## ⇁ Deploy

```shell
make build
make server
```
