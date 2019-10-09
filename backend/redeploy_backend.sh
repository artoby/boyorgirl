git pull
sudo docker container stop bog
sudo docker container rm bog
sudo docker build -t bog:1 -f Dockerfile . 
sudo docker run \
  -d \
  -p 3100:3100 \
  -v "$(pwd)/uploads":/app/uploads \
  --name bog \
  --restart unless-stopped \
  bog:1



