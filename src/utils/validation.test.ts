import { describe, expect, test } from "bun:test";
import { IsoString, Uuid, IsoStringOptional } from "./validation";

describe("Validation utilities", () => {
  describe("IsoString", () => {
    test("should accept valid ISO datetime string", () => {
      const validDate = "2024-01-15T10:30:00.000Z";
      expect(() => IsoString.parse(validDate)).not.toThrow();
    });

    test("should accept valid date string", () => {
      const validDate = "2024-01-15";
      expect(() => IsoString.parse(validDate)).not.toThrow();
    });

    test("should reject invalid date string", () => {
      const invalidDate = "not-a-date";
      expect(() => IsoString.parse(invalidDate)).toThrow();
    });

    test("should reject empty string", () => {
      expect(() => IsoString.parse("")).toThrow();
    });

    test("should reject invalid format", () => {
      const invalidDate = "15/01/2024";
      expect(() => IsoString.parse(invalidDate)).toThrow();
    });
  });

  describe("Uuid", () => {
    test("should accept valid UUID v4", () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(() => Uuid.parse(validUuid)).not.toThrow();
    });

    test("should reject invalid UUID", () => {
      const invalidUuid = "not-a-uuid";
      expect(() => Uuid.parse(invalidUuid)).toThrow();
    });

    test("should reject UUID with wrong format", () => {
      const invalidUuid = "550e8400-e29b-41d4-a716";
      expect(() => Uuid.parse(invalidUuid)).toThrow();
    });

    test("should reject empty string", () => {
      expect(() => Uuid.parse("")).toThrow();
    });
  });

  describe("IsoStringOptional", () => {
    test("should accept valid ISO datetime string", () => {
      const validDate = "2024-01-15T10:30:00.000Z";
      expect(() => IsoStringOptional.parse(validDate)).not.toThrow();
    });

    test("should accept undefined", () => {
      expect(() => IsoStringOptional.parse(undefined)).not.toThrow();
      expect(IsoStringOptional.parse(undefined)).toBeUndefined();
    });

    test("should reject invalid date string", () => {
      const invalidDate = "invalid";
      expect(() => IsoStringOptional.parse(invalidDate)).toThrow();
    });
  });
});
