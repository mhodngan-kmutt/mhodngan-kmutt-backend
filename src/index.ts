import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { projectRoutes } from "./routes/projects";

const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(openapi())
  .get("/", () => "hello")
  .use(projectRoutes)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
