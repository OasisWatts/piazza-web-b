FROM node:21-alpine
WORKDIR /home/app
COPY . /home/app
COPY package.json package-lock.json /home/app/
RUN npm install
RUN npm run build-back
CMD ["npm", "server"]
EXPOSE 4416

