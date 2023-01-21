FROM caddy:2-alpine

WORKDIR /app

COPY . /app/

ENTRYPOINT [ "/bin/sh", "-c" ]
CMD [ "caddy file-server --browse --root /app" ]