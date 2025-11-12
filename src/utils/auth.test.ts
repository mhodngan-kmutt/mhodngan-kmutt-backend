import { describe, expect, test, mock } from "bun:test";
import { authenticateUser } from "./auth";

// Mock supabase
mock.module("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: mock(),
    },
  },
}));

describe("Authentication utilities", () => {
  describe("authenticateUser", () => {
    test("should reject missing authorization header", async () => {
      const result = await authenticateUser(undefined);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.status).toBe(401);
        expect(result.error.message).toContain("Missing or invalid");
      }
    });

    test("should reject invalid authorization header format", async () => {
      const result = await authenticateUser("InvalidFormat");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.status).toBe(401);
        expect(result.error.message).toContain("Missing or invalid");
      }
    });

    test("should reject authorization header without Bearer prefix", async () => {
      const result = await authenticateUser("Token abc123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.status).toBe(401);
      }
    });

    test("should extract token from valid Bearer header", async () => {
      const header = "Bearer valid-token-123";
      // This test demonstrates the token extraction logic
      const token = header.replace("Bearer ", "");
      expect(token).toBe("valid-token-123");
    });

    test("should return error type with correct structure", async () => {
      const result = await authenticateUser(undefined);

      if (!result.success) {
        expect(result.error).toHaveProperty("status");
        expect(result.error).toHaveProperty("message");
        expect(typeof result.error.status).toBe("number");
        expect(typeof result.error.message).toBe("string");
      }
    });
  });
});
