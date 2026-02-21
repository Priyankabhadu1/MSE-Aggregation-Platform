FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

HEALTHCHECK CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node","app.js"]