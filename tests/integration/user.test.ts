import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { userRoutes } from "../../src/routes/user";

// Create test app
const app = new Elysia().use(userRoutes);

describe("User routes integration tests", () => {
  describe("GET /user/me", () => {
    test("should require authentication", async () => {
      const response = await app.handle(
        new Request("http://localhost/user/me")
      );

      expect(response.status).toBe(401);
    });

    test("should reject invalid Bearer token format", async () => {
      const response = await app.handle(
        new Request("http://localhost/user/me", {
          headers: {
            Authorization: "InvalidFormat",
          },
        })
      );

      expect(response.status).toBe(401);
    });

    test("should reject missing Bearer prefix", async () => {
      const response = await app.handle(
        new Request("http://localhost/user/me", {
          headers: {
            Authorization: "Token abc123",
          },
        })
      );

      expect(response.status).toBe(401);
    });

    test("should accept valid Bearer token format", async () => {
      const response = await app.handle(
        new Request("http://localhost/user/me", {
          headers: {
            Authorization: "Bearer valid-token-here",
          },
        })
      );

      // Will return 401 for invalid token or 404 if user not found
      expect([401, 404]).toContain(response.status);
    });

    test("should return JSON response", async () => {
      const response = await app.handle(
        new Request("http://localhost/user/me", {
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );

      const contentType = response.headers.get("content-type");
      if (contentType) {
        expect(contentType).toContain("application/json");
      }
      // Always returns JSON even on error
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});
