FROM node:21-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS final
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT [ "nginx", "-g",  "daemon off;"]