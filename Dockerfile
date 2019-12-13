FROM node:alpine

MAINTAINER snaruto7

WORKDIR /tic-tac-toe

COPY ./package*.json ./
RUN npm install

COPY . .

CMD [ "npm","start" ]
