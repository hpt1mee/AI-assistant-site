FROM node:lts-alpine
WORKDIR /app
COPY package.json server.js index.html style.css site.js account.html account.css account.js ./
COPY assets/ ./assets/
ENV NODE_ENV=production
USER node
CMD ["node", "server.js"]
