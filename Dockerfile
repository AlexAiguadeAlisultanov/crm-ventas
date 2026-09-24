# Construcción en dos etapas: compilamos con las dependencias de desarrollo
# y nos quedamos solo con lo necesario para arrancar en producción.

FROM node:24-slim AS build
WORKDIR /app

COPY server/package*.json server/
COPY web/package*.json web/
RUN npm install --prefix server && npm install --prefix web

COPY server server
COPY web web
RUN npm run build --prefix web && npm run build --prefix server

FROM node:24-slim AS produccion
WORKDIR /app
ENV NODE_ENV=production

COPY server/package*.json server/
RUN npm install --prefix server --omit=dev

COPY --from=build /app/server/dist server/dist
COPY --from=build /app/web/dist web/dist

EXPOSE 8005
CMD ["node", "server/dist/index.js"]
