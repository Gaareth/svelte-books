# svelte book store

A personal book tracking app focused on your reading activity, habits and progress, rather than social interaction.

## Installation

You can either use a docker image or build from source.
However, first you have to create `.env.production` file similar to `env.example`.
Make sure to:

- not use quotes around the values as they are sometimes taken literally.
- get a google books api key.
- validate the host and port of the ORIGIN variable

This will create an admin account with the specified credentials. Note: this happens on every startup.

### Docker

Use on of the docker images:

`docker pull ghcr.io/gaareth/svelte-books`

Then run one of:

- `./run-book-store.sh`

- `docker run -it  -d -e DATABASE_URL=file:/database/prod.db -v book-store:/database -p 4000:3000 --name book-store ghcr.io/gaareth/svelte-books`

- `docker compose up -d`

### Source

1. `git clone https://github.com/Gaareth/svelte-books`
2. `npm run ci`. DEV: `npm run install`
3. `npx prisma generate`
4. `npx prisma migrate deploy`. DEV: `npx prisma migrate dev`
5. `npm run build`. DEV: `npm run dev`
6. `node build`

## Todos

- rework readme

- when adding new reading activity, if there is already an active one, ask if they want to transform the active one to the new status (e.g., from to-read to reading)

<!-- - currently reading filter to only the latest ones -->

<!-- - display name for reading activity status, eg in admin or lists panel -->

- shelves

- color bar, similar color for similar books

  - revisit some time

- more finegrained privacy/visibility settings:

  - private books

- tension stats draw yourself - check

  - let user add more graphs

- add or remove google api

- update googleapi values

  - especially categories

- crud for lists

- statistics page
- books read over time or github like graph
- per month, year, day etc
- min/avg/max time for started reading to finished.

  - similarly for to-read to started! or finished?
  - avg time from to-read to acquired

- did i fix them already?

  - fix last month selector when is january?
  - fix optionaldate unique

- reading activity icons?
- acquired -> reading, maybe only count if book was wanted (ie. was in to-read)

- rework dark mode colors, more consistent styles

# Tech-Stack

- SvelteKit
- Prisma
- Docker
- TypeScript
- Tailwind
