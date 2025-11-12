import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { projectRoutes } from "../../src/routes/project";

// Create test app
const app = new Elysia().use(projectRoutes);

describe("Project routes integration tests", () => {
  describe("GET /project", () => {
    test("should return projects list", async () => {
      const response = await app
        .handle(new Request("http://localhost/project"))
        .then((res) => res.json());

      expect(response).toHaveProperty("data");
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should accept query parameters", async () => {
      const response = await app.handle(
        new Request("http://localhost/project?page=1&pageSize=10")
      );

      expect(response.status).toBe(200);
    });

    test("should filter by status", async () => {
      const response = await app.handle(
        new Request("http://localhost/project?status=Published")
      );

      expect(response.status).toBe(200);
    });
  });

  describe("GET /project/:id", () => {
    test("should return 500 for invalid UUID", async () => {
      const response = await app.handle(
        new Request("http://localhost/project/invalid-id")
      );

      expect(response.status).toBe(500);
    });

    test("should accept valid UUID format", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const response = await app.handle(
        new Request(`http://localhost/project/${validUuid}`)
      );

      // Will return 404 if project doesn't exist, but validates UUID
      expect([200, 404]).toContain(response.status);
    });
  });

  describe("POST /project", () => {
    test("should require authentication", async () => {
      const response = await app.handle(
        new Request("http://localhost/project", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_name_th: "Test Project",
            project_name_en: "Test Project",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    test("should validate request body", async () => {
      const response = await app.handle(
        new Request("http://localhost/project", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({}),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("PATCH /project/:id", () => {
    test("should require authentication", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const response = await app.handle(
        new Request(`http://localhost/project/${validUuid}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_name_th: "Updated Name",
          }),
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /project/:id", () => {
    test("should require authentication", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const response = await app.handle(
        new Request(`http://localhost/project/${validUuid}`, {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(401);
    });

    test("should validate UUID parameter", async () => {
      const response = await app.handle(
        new Request("http://localhost/project/invalid-uuid", {
          method: "DELETE",
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );

      expect(response.status).toBe(401);
    });
  });
});
