import { DbLive } from "./db";
import { Layer } from "effect";
import { BunRuntime, BunHttpServer } from "@effect/platform-bun";
import { HttpLive } from "./server";

const MainLive = Layer.provide(
  HttpLive,
  Layer.provideMerge(DbLive, BunHttpServer.server.layer({ port: process.env.PORT }))
);

BunRuntime.runMain(Layer.launch(MainLive));