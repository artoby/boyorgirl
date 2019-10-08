git pull
sudo docker container stop bogclient
sudo docker container rm bogclient
sudo docker build -t bogclient:1 -f Dockerfile . 
sudo docker run \
  -d \
  -p 3000:3000 \
  --name bogclient \
  --restart unless-stopped \
  bogclient:1


