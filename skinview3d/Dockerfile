FROM gplane/pnpm:node18-alpine as node

WORKDIR /app
COPY . /app/
RUN pnpm i

FROM caddy:2-alpine
COPY --from=node /app /app

ENTRYPOINT [ "/bin/sh", "-c" ]
CMD [ "caddy file-server --browse --root /app" ]