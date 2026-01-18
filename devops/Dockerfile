FROM python:3.12-slim

WORKDIR /app

COPY ./certs/server.cert .
COPY ./certs/server.key .

COPY requirements.txt /app

RUN apt-get update && apt-get install -y gcc dos2unix

RUN pip install --upgrade pip && \
    pip3 install -r requirements.txt

ENV DJANGO_SETTINGS_MODULE=backend.settings

COPY start.sh /
RUN dos2unix /start.sh && chmod +x /start.sh

EXPOSE 8000

ENTRYPOINT ["sh", "/start.sh"]

CMD ["daphne", "-e", "ssl:8000:privateKey=/app/certs/server.key:certKey=/app/certs/server.cert", "backend.asgi:application"]