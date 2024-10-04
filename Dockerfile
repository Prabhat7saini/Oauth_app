FROM node

WORKDIR /currentApp

COPY  . .

RUN  npm install
CMD [ "npm","run","start:dev" ]