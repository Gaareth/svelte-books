#!/bin/sh
set -e

# Accept a version type argument, default to "patch"
VERSION_TYPE=${1:-patch}  # Usage: ./deploy.sh minor

echo "> Deploying version: $VERSION_TYPE"

sh docker-build.sh ${VERSION_TYPE};
ssh wintermute sh /home/gareth/book-store/update-book-store.sh;