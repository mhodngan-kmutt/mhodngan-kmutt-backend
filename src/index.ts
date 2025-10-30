import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";

const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(openapi())
  .get("/", () => "hello")
  .post("/hello", () => "OpenAPI")
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
