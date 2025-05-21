FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache make g++ python3 && npm install

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]