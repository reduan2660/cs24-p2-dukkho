FROM python:3.8-slim

ENV DEPLOYMENT_ENV "dev"
ENV EXPOSE_PORT 8000
ENV GUNICORN_WORKERS 2

RUN apt-get update && apt-get install libpq-dev gcc -y
WORKDIR /app

COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY wait-for-it.sh /app/
RUN chmod +x wait-for-it.sh

COPY run.sh /app/
RUN chmod +x run.sh

COPY alembic.ini /
COPY app .

EXPOSE 8000
CMD [ "/app/run.sh" ]