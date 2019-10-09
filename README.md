# boyorgirl
A web application + neural net to distinguish baby boys and girls. The service is available here https://boyorgirl.artoby.me .
You can fork this repository to speed-up deployment of your own image classification models to the Internet.

# Repository structure
`/backend` - API for image classification. Written in Python + Starlette + Uvicorn.
`/client` - web client. Written in React.
`/nginx` - configuration of the NGINX site and Bash script for site automatic deployment in NGINX.
`/notebooks` - iPython notebook for model training and export.
`/sample_images` - some sample images for model testing.

# Deployment
The service is conteinerized in Docker. In order to deploy it you need a machine with Docker daemon.
First you should clone the repository to your machine
```
git clone https://github.com/artoby/boyorgirl
```
Then to make deployment first time run
```
cd boyorgirl
./initial_deploy.sh
```
It'll take ~5-15 minutes. You'll need 3GB RAM on the machine in order for the containers to be built. After the initial deployment 2GB RAM will be enough for the service to work properly.

In order to redeploy the backend with the latest changes from Git run
```
cd backend
./redeploy_backend.sh
```

In order to redeploy the client with the latest changes from Git run
```
cd client
./redeploy_client.sh
```

In order to change the NGINX site configuration edit the `/nginx/sites/boyorgirl.artoby.me` file contents and make sure the site is written in `sites-available` and `sites-enabled` folders (`./nginx/symlink-nginx-sites.sh` script does it for you).

# Updating the model
If you want to update the neural network model - put it in the `/backend/ai_models/export.pkl`
