import { Effect } from "effect";
import { Db } from "./db";
import * as Http from "@effect/platform/HttpServer";
import { Schema } from "@effect/schema";

const GetRoute = Http.router.get(
  "/",
  Effect.gen(function* () {
    const db = yield* Db;

    const resp = yield* Effect.promise(() =>
      db.selectFrom("table").selectAll().execute()
    );

    return yield* Http.response.json(resp);
  })
);

const PostRoute = Http.router.post(
  "/create",
  Effect.gen(function* () {
    const db = yield* Db;

    const data = yield* Http.request.schemaBodyForm(
      Schema.Struct({
        userId: Schema.String,
      })
    );

    yield* Effect.promise(() =>
      db
        .insertInto("table")
        .values({
          userId: data.userId,
          timestamp: new Date().toISOString(),
        })
        .execute()
    );

    return yield* Http.response.text("ok");
  })
);

export const HttpLive = Http.router.empty.pipe(
  GetRoute,
  PostRoute,
  Http.router.get("/ping", Effect.succeed(Http.response.text("pong"))),
  Effect.catchTag("RouteNotFound", (_) =>
    Effect.succeed(Http.response.empty({ status: 404 }))
  ),
  Http.server.serve(Http.middleware.logger),
  Http.server.withLogAddress
);
