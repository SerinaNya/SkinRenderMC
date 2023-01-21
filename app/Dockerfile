FROM python:3.10-slim

WORKDIR /app
COPY . /app/

RUN sed -i "s@http://deb.debian.org@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
    apt update

RUN pip3 config set global.index-url https://repo.huaweicloud.com/repository/pypi/simple && \
    pip3 install -r requirements.txt

ENV browserWSEndpoint ws://chrome:3000
ENV backendSkinView3D http://skinview3d/

EXPOSE 57680

CMD [ "uvicorn", "main:app","--host", "0.0.0.0", "--port", "57680" ]