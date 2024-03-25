How to run?

To test:

Go to root directory containing the docker-compose.yaml file.

```
sudo docker compose up -d --build
```

Backend is configured to run at port `8000`.

To develop:

1. Run a postgres db:

```
sudo docker run --detach \
--name cs24-p2-local-postgres  \
-p 5432:5432 \
-e POSTGRES_DB=postgres \
-e POSTGRES_USER=admin \
-e POSTGRES_PASSWORD=password \
-d postgres:16.1
```

2. Run the server

```
uvicorn app.main:app --reload
```
