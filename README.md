# OneMenu

[![Build](https://github.com/AnnieLeonia/OneMenu/workflows/Build/badge.svg)](https://github.com/AnnieLeonia/OneMenu/actions?query=workflow%3ABuild+branch%3Amaster)


## Prerequisite

- Node v12
- Postgres v11

## Environment variables

Create the env-file in root dir (path: `.env`) locally

> You can copy the `.env.example` to `.env` and modify the variables as needed

## Database Setup

```
createdb onemenu
```

### Database migrations

```
npm run db:migrate
```

### Database clone production (optional)

```
npm run db:pull
```

## Node Setup

```
npm install
npm start
```
