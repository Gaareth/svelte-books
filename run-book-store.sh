docker run -it  -d -e DATABASE_URL=file:/database/prod.db -v book-store:/database -p 3001:3000 --name book-store ghcr.io/gaareth/svelte-books
