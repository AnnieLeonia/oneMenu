FROM --platform=$BUILDPLATFORM node:22-alpine AS build-client

WORKDIR /app/client

COPY client/package.json client/package-lock.json client/.npmrc ./
RUN npm ci

COPY client/ ./
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

FROM --platform=$BUILDPLATFORM node:22-alpine AS build-server

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:22-alpine

WORKDIR /app

COPY --from=build-server /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY --from=build-client /app/client/build ./client/build

ENV NODE_ENV=production
EXPOSE 3000

WORKDIR /app/server
CMD ["node", "index"]