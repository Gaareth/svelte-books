#!/bin/sh
set -e

# Run Prisma migrations
npx prisma migrate deploy

# Run the CMD passed to the container
exec "$@"