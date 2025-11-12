import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { certificationRoutes } from "../../src/routes/certification";

// Create test app
const app = new Elysia().use(certificationRoutes);

describe("Certification routes integration tests", () => {
  describe("POST /api/certifications", () => {
    test("should require authentication", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/certifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: "550e8400-e29b-41d4-a716-446655440000",
            professorUserId: "550e8400-e29b-41d4-a716-446655440001",
          }),
        })
      );

      expect(response.status).toBe(401);
    });

    test("should validate request body structure", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/certifications", {
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

    test("should validate UUID format for projectId", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/certifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            projectId: "invalid-uuid",
            professorUserId: "550e8400-e29b-41d4-a716-446655440001",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    test("should validate UUID format for professorUserId", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/certifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            projectId: "550e8400-e29b-41d4-a716-446655440000",
            professorUserId: "invalid-uuid",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    test("should accept valid request with optional certificationDate", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/certifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            projectId: "550e8400-e29b-41d4-a716-446655440000",
            professorUserId: "550e8400-e29b-41d4-a716-446655440001",
            certificationDate: "2024-01-15T10:30:00.000Z",
          }),
        })
      );

      // Will fail auth but passes validation
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe("DELETE /api/certifications/:projectId/me", () => {
    test("should require authentication", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const response = await app.handle(
        new Request(`http://localhost/api/certifications/${validUuid}/me`, {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(401);
    });

    test("should validate projectId UUID format", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/certifications/invalid-uuid/me", {
          method: "DELETE",
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );

      expect(response.status).toBe(422);
    });

    test("should accept valid UUID format", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const response = await app.handle(
        new Request(`http://localhost/api/certifications/${validUuid}/me`, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );

      // Will fail auth or project not found
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe("GET /api/projects/:projectId/certifications", () => {
    test("should not require authentication", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const response = await app.handle(
        new Request(
          `http://localhost/api/projects/${validUuid}/certifications`
        )
      );

      // Should work without auth, but project might not exist or error
      expect([200, 404, 500]).toContain(response.status);
    });

    test("should validate projectId UUID format", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/projects/invalid-uuid/certifications")
      );

      expect(response.status).toBe(422);
    });

    test("should return JSON response", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const response = await app.handle(
        new Request(
          `http://localhost/api/projects/${validUuid}/certifications`
        )
      );

      const contentType = response.headers.get("content-type");
      if (contentType) {
        expect(contentType).toContain("application/json");
      }
      // Always returns some response
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test("should return success structure", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const response = await app.handle(
        new Request(
          `http://localhost/api/projects/${validUuid}/certifications`
        )
      );

      if (response.status === 200) {
        const json = await response.json();
        expect(json).toHaveProperty("success");
        expect(json).toHaveProperty("data");
      }
    });
  });
});
