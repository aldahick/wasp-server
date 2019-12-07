FROM node:12.13.1-alpine

EXPOSE 8080

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY tsconfig.json /app/tsconfig.json
COPY .eslintrc.json /app/.eslintrc.json

COPY src /app/src
COPY scripts /app/scripts

# need this to build native modules like bcrypt
RUN apk add python make g++

RUN npm install
RUN npm run lint
RUN npm run build

ENV HTTP_PORT 8080

CMD npm start
