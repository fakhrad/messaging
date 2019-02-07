FROM node:alpine AS messaging

WORKDIR /app
COPY . /app 
RUN npm install



