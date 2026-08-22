
if IMAGES_FOLDER=$(grep '^IMAGES_FOLDER=' .env.production | cut -d '=' -f2-) && [ -n "$IMAGES_FOLDER" ]; then
    VOLUME_ARGS+=(-v "./$IMAGES_FOLDER:/app/$IMAGES_FOLDER")
fi

docker run -it -d \
    --env-file .env.production \
    -v book-store:/database \
    "${VOLUME_ARGS[@]}" \
    -p 4000:3000 \
    --name book-store ghcr.io/gaareth/svelte-books
# docker compose --env-file .env.production up