import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { projectRoutes } from "./routes/project.route";
import { handleError } from "./utils/errors";

const PORT = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .use(openapi({ path: "/docs" }))
  .use(cors())
  .get("/favicon.ico", () => new Response(null, { status: 204 }))
  .get("/health", () => "ok")
  .get("/", () => "hello")
  .post("/hello", () => "OpenAPI")
  .use(projectRoutes)
  .onError(({ set, error }) => handleError({ set } as any, error))
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port} (docs at /docs)`
);
