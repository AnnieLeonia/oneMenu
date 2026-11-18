FROM --platform=$BUILDPLATFORM node:22-alpine AS build-client

WORKDIR /app/client

COPY client/package.json client/package-lock.json client/.npmrc ./
RUN npm ci

COPY client/ ./
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev --ignore-scripts

COPY server/ ./server/
COPY --from=build-client /app/client/build ./client/build

ENV NODE_ENV=production
EXPOSE 8080

WORKDIR /app/server
CMD ["node", "index"]
