# Blocker

Write blocks and transactions to DB and send to SC.

## Run Postgres

```
docker run --name postgres-db -e POSTGRES_PASSWORD=electrocoin123 -v /docker/postgre-volume-db:/var/lib/postgresql/data -p 5432:5432 --restart=always -d postgres:14.0
```

### Execute Database schema


```
sql/create-table.sql
```

## Run app


```
npm install
npm run dev
```

## Author

* **Filip Kaić** - *Initial work*

**Happy Coding! <3**
