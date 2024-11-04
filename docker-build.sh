set -e;
npm version patch --force;
npm run build && docker buildx build  --platform=linux/amd64 . -t ghcr.io/gaareth/svelte-books:$(jq -r .version package.json) -t ghcr.io/gaareth/svelte-books:latest --push;
