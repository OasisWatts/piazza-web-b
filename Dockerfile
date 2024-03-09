FROM node:21.7-alpine3.18

WORKDIR /app

# run if package.json changes
COPY package.json package-lock.json /tmp/
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

# run if source code changes
COPY . /app
RUN ls -l
RUN npm run build
CMD npm run server
EXPOSE 4416

