import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { openapiConfig } from "./config/openapi";
import { certificationRoutes } from "./routes/certification";
import { projectRoutes } from "./routes/project";
import { userRoutes } from "./routes/user";
import { commentRoutes } from "./routes/comment";
import { handleError } from "./utils/errors";

const PORT = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .onError({ as: "global" }, ({ set, error }) => handleError({ set }, error))
  .use(cors())
  .use(openapi(openapiConfig))
  .get("/", () => "hello")
  .use(projectRoutes)
  .use(certificationRoutes)
  .use(userRoutes)
  .use(commentRoutes)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port} (docs at /docs)`,
);
