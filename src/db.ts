import { Effect, Context, Layer } from "effect";
import { Database as Sqlite } from "bun:sqlite";
import path from "path";
import { Kysely } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";

export interface Database {
  readonly table: Table;
}

interface Table {
  readonly userId: string;
  readonly timestamp: string;
}

export type Db = Kysely<Database>;
export const Db = Context.GenericTag<Db>("@services/Db");

export const createDb = (fileName: string) => Effect.gen(function* () {
  const db = new Kysely<Database>({
    dialect: new BunSqliteDialect({
      database: new Sqlite(path.join(process.cwd(), "/", fileName)),
    }),
  });

  yield* Effect.promise(async () => {
    await db.schema
      .createTable("table")
      .ifNotExists()
      .addColumn("timestamp", "text")
      .addColumn("userId", "text")
      .execute();
  })

  return db
});

export const DbLive = Layer.effect(Db, createDb("db.sqlite"));