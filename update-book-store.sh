echo "Pulling docker image svelte-books";
docker pull ghcr.io/gaareth/svelte-books;
echo "[!] Completed docker pull :)";
echo "> Stopping old docker container";
sudo docker stop book-store;
sudo docker rm book-store;
echo "> Starting new docker container";
sudo sh ./run-book-store.sh;
echo "You are good to go :)"
