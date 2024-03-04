FROM node:21-alpine

# run if package.json changes
COPY package.json package-lock.json /tmp/
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

# run if source code changes
WORKDIR /app
COPY . /app
RUN npm run build-back
CMD npm run server-dev
EXPOSE 4416

