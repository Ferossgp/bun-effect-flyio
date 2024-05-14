# Bun + Effect

An example project that creates a simple Bun server with sqlite3 database. The server implementation uses Effect and Kysely.

Everything is deployed on Fly.io using Litefs for Sqlite database.

## Configure Litefs

Create a volume for the Litefs database.

```bash
$ fly volume create litefs -r ams -n 1
$ fly consul attach
```
