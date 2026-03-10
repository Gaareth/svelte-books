set -e;
npm run check;
npm run build && ./docker-build-local.sh && docker buildx build --platform=linux/amd64 .;
npm version patch;
git push;
npm run build;
echo "> Uploading v$(jq -r .version package.json)"
docker buildx build  --platform=linux/amd64 . -t ghcr.io/gaareth/svelte-books:$(jq -r .version package.json) -t ghcr.io/gaareth/svelte-books:latest --push;
