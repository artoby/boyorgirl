# base image
FROM bogclient_base:1

# set working directory
WORKDIR /app

ADD src ./src
ADD public ./public

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install --silent

# commented as presented in bogclient_base
# RUN npm install react-scripts@3.0.1 -g --silent

# start app
CMD ["npm", "start"]