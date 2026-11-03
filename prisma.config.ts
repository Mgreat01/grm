import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    // Keep the former MySQL history untouched in prisma/migrations.
    path: "prisma/migrations-postgresql",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL
  },
});
