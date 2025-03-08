FROM node:22.13.1-alpine3.21 as build

ENV WORKDIR_APP /var/app

WORKDIR ${WORKDIR_APP}
COPY package.json .
RUN npm install
COPY . .

RUN npx prisma generate

RUN npm run build


FROM node:22.13.1-alpine3.21
ENV APP_PORT 3001
ENV APP_ENV production

WORKDIR /var/app
COPY --from=build /var/app/dist /var/app

EXPOSE ${APP_PORT}

CMD ["node","src/main"]


