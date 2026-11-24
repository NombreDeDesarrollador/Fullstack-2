# Etapa 1: construye la app React (las URLs de la API se fijan al compilar)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG REACT_APP_API_USUARIOS=http://localhost:8081
ARG REACT_APP_API_PRODUCTOS=http://localhost:8082
ARG REACT_APP_API_PEDIDOS=http://localhost:8083
ENV REACT_APP_API_USUARIOS=$REACT_APP_API_USUARIOS \
    REACT_APP_API_PRODUCTOS=$REACT_APP_API_PRODUCTOS \
    REACT_APP_API_PEDIDOS=$REACT_APP_API_PEDIDOS
RUN npm run build

# Etapa 2: sirve los archivos estáticos con Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
