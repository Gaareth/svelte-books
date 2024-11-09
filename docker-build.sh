set -e;

npm run build && ./docker-build-local.sh;
npm version patch --force;
docker buildx build  --platform=linux/amd64 . -t ghcr.io/gaareth/svelte-books:$(jq -r .version package.json) -t ghcr.io/gaareth/svelte-books:latest --push;
