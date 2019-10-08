FROM node:10

EXPOSE 8080

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY tsconfig.json /app/tsconfig.json
COPY tslint.json /app/tslint.json

COPY src /app/src

RUN apk add python

RUN npm install
RUN npm run lint
RUN npm run build

ENV HTTP_PORT 8080

CMD ["npm", "start"]
