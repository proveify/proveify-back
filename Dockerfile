FROM node:22.13.1-alpine3.21

ENV APP_PORT 3000
ENV NODE_ENV prod
ENV WORKDIR_APP /var/app

WORKDIR ${WORKDIR_APP}
COPY package.json .
RUN npm install
COPY . .

RUN npx prisma generate

RUN npm run build

RUN apk add --no-cache --upgrade bash
RUN chmod +x run.sh

EXPOSE ${APP_PORT}

CMD ["bash","run.sh"]