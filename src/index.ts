import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";

// Cloud Run จะส่ง PORT environment variable มาให้
// ถ้าไม่มี ให้ใช้ default port 3000 (สำหรับ local development)
const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(openapi())
  .get("/", () => "hello")
  .post("/hello", () => "OpenAPI")
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
