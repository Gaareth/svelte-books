#!/bin/bash
set -e

# Accept a version type argument, default to "patch"
VERSION_TYPE=${1:-patch}  # Usage: ./deploy.sh minor

echo "> Bumping version: $VERSION_TYPE"

# Prisma generate
npx prisma generate

# Run checks
npm run check

# Build locally
npm run build && ./docker-build-local.sh && docker buildx build --platform=linux/amd64 .

# Bump version
npm version "$VERSION_TYPE"

# Push commits/tags
git push --follow-tags

# Build again (optional, ensure latest version is built)
npm run build

# Get the new version from package.json
VERSION=$(jq -r .version package.json)
echo "> Uploading v$VERSION"

# Build and push Docker image
docker buildx build \
  --platform=linux/amd64 \
  -t ghcr.io/gaareth/svelte-books:$VERSION \
  -t ghcr.io/gaareth/svelte-books:latest \
  --push .