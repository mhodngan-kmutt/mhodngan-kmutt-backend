import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

describe("API health checks", () => {
  test("should respond to basic GET request", async () => {
    const app = new Elysia().get("/", () => "hello");

    const response = await app.handle(new Request("http://localhost/"));

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("hello");
  });

  test("should handle 404 for unknown routes", async () => {
    const app = new Elysia().get("/", () => "hello");

    const response = await app.handle(
      new Request("http://localhost/unknown-route")
    );

    expect(response.status).toBe(404);
  });

  test("should return JSON for API endpoints", async () => {
    const app = new Elysia().get("/api/test", () => ({ status: "ok" }));

    const response = await app.handle(
      new Request("http://localhost/api/test")
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
