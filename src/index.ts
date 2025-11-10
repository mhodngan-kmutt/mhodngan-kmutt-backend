import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { projectRoutes } from "./routes/project";
import { handleError } from "./utils/errors";
import { openapiConfig } from "./config/openapi";
import { userRoutes } from "./routes/user";

const PORT = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .onError({ as: "global" }, ({ set, error }) => handleError({ set }, error))
  .use(cors())
  .use(openapi(openapiConfig))
  .get("/", () => "hello")
  .use(projectRoutes)
  .use(userRoutes)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port} (docs at /docs)`
);
