import * as z from "zod";

export const openapiConfig = {
  path: "/docs",
  documentation: {
    info: {
      title: "Mhodngan API",
      version: "1.0.0",
      description: "API documentation for Mhodngan backend",
      contact: {
        name: "Mhodngan Team",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
      {
        url: "https://mhodngan-backend-785868412143.asia-southeast1.run.app",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Projects",
        description: "Project management endpoints",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http" as const,
          scheme: "bearer" as const,
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
    },
  },
  mapJsonSchema: {
    zod: (schema: z.ZodTypeAny) =>
      z.toJSONSchema(schema, {
        unrepresentable: "any",
      }),
  },
};
