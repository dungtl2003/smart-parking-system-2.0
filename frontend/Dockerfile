FROM node:21-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_API_VERSION
ARG VITE_API_SERVER_PORT
ARG VITE_EXPRESS_SERVER_API

ENV VITE_API_VERSION=$VITE_API_VERSION
ENV VITE_API_SERVER_PORT=$VITE_API_SERVER_PORT
ENV VITE_EXPRESS_SERVER_API=$VITE_EXPRESS_SERVER_API

COPY . .
RUN npm run build

FROM nginx:alpine AS final
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT [ "nginx", "-g",  "daemon off;"]