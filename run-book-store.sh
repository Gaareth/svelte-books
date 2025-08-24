docker run -it  -d -e DATABASE_URL=file:/database/prod.db -v book-store:/database -p 4000:3000 --name book-store ghcr.io/gaareth/svelte-books
