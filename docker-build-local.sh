#!/bin/bash

print_error() {
    echo -e "\033[31m$1\033[0m"
}

cleanup() {
    echo "> Cleanup: stopping and removing container/image"
    docker stop book-store 2>/dev/null || true
    docker rm book-store 2>/dev/null || true
}

# Build the Docker image
docker build . -t book-store

# Stop and remove any existing container named 'book-store'
docker stop book-store 2>/dev/null || true
docker rm book-store 2>/dev/null || true

echo "> Starting container"
# Run the Docker container in detached mode
docker run --name book-store -p 3000:3000 -d book-store

# Wait a moment for the server to start
sleep 3

echo "> Checking return code"
# Check if the URL returns a 200 status
url="localhost:3000"
status_code=$(curl -o /dev/null -s -w "%{http_code}" "$url")

if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 400 ]; then
    echo "URL returned 200 OK or any 300"
else
    print_error "URL did not return 200 OK or any 300. Status code: $status_code"

    cleanup
    exit 1
fi

cleanup