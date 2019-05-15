FROM node:8.15.0-slim AS base

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 3000
CMD [ "npm", "start" ]
