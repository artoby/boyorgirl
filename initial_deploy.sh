git pull

./nginx/symlink-nginx-sites.sh

cd ./backend
sudo docker build -t bog_base:1 -f Dockerfile_base .
./redeploy_backend.sh
cd ..

cd ./client
sudo docker build -t bogclient_base:1 -f Dockerfile_base .
./redeploy_client.sh
