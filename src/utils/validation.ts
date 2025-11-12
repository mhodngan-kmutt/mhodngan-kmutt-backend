import * as z from "zod";

/**
 * Validates a string that can be parsed into a valid ISO datetime.
 * Use .optional() where needed.
 */
export const IsoString = z.string().refine(
  (v) => {
    return !Number.isNaN(Date.parse(v));
  },
  {
    message: "Must be a valid ISO datetime string",
  },
);

// UUID validator shortcut
export const Uuid = z.string().uuid();

// Optional ISO string (used for optional timestamps)
export const IsoStringOptional = IsoString.optional();
