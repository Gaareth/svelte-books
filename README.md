# svelte book store

## Installation

### Docker

Use on of the docker images:

`docker pull ghcr.io/gaareth/svelte-books`

`docker run -it  -d -e DATABASE_URL=file:/database/prod.db -v book-store:/database -p 3001:3000 --name book-store ghcr.io/gaareth/svelte-books`

However you need to supply the db file with a user yourself. You probably should run seed.js and add your credentials to .env, then copy the db file to /var/lib/docker/volumes/book-store/\_data/

### Source

`git clone https://github.com/Gaareth/svelte-books`

Create .env file similar to `env.example`.

1. Build: `npm run build`
2. Run: node -r dotenv/config build

## Todos

- private books
- spannend stats draw yourself
- auto google api connection
- add or remove google api
