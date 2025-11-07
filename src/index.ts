import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import * as z from "zod";
import { projectRoutes } from "./routes/project";
import { handleError } from "./utils/errors";

const PORT = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .onError({ as: "global" }, ({ set, error }) => handleError({ set }, error))
  .use(cors())
  .use(
    openapi({
      path: "/docs",
      mapJsonSchema: {
        zod: (schema: z.ZodTypeAny) =>
          z.toJSONSchema(schema, {
            unrepresentable: "any",
          }),
      },
    })
  )
  .get("/favicon.ico", () => new Response(null, { status: 204 }))
  .get("/health", () => "ok")
  .get("/", () => "hello")
  .post("/hello", () => "OpenAPI")
  .use(projectRoutes)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port} (docs at /docs)`
);
