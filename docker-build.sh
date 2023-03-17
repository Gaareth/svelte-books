npm run build;
docker buildx build --platform=linux/arm64,linux/amd64 . -t ghcr.io/gaareth/svelte-books --push