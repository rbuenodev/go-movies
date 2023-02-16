FROM node:18-alpine3.15

RUN apk add --no-cache bash git

RUN touch /home/node/.bashrc | echo "PS1=´\w\$ ´" >> /home/node.bash

RUN npm config set cach /home/node/app/.npm-cache --global

USER node

WORKDIR /home/node/app