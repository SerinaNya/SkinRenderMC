FROM python:3.10-alpine

WORKDIR /app
COPY . /app/server

RUN apk update && \
    apk add imagemagick-dev

RUN pip3 install -r /app/server/requirements.txt

ENV browserWSEndpoint ws://chrome:3000
ENV backendSkinView3D http://skinview3d/

EXPOSE 57680

CMD [ "uvicorn", "server:app","--host", "0.0.0.0", "--port", "57680" ]