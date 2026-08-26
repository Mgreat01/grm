import test from "node:test";
import assert from "node:assert/strict";
import { validateEnv } from "../src/config/env.js";

test("validateEnv normalise le port et les origines CORS", () => {
  const config = validateEnv({
    DATABASE_URL: "mysql://localhost/grm",
    JWT_SECRET: "secret-de-test",
    PORT: "8080",
    CORS_ORIGINS: "https://app.example, https://admin.example",
  });

  assert.deepEqual(config, {
    port: 8080,
    corsOrigins: ["https://app.example", "https://admin.example"],
  });
});

test("validateEnv refuse une variable obligatoire absente", () => {
  assert.throws(
    () => validateEnv({ DATABASE_URL: "mysql://localhost/grm" }),
    /JWT_SECRET/,
  );
});

test("validateEnv refuse un port hors limites", () => {
  assert.throws(
    () => validateEnv({
      DATABASE_URL: "mysql://localhost/grm",
      JWT_SECRET: "secret-de-test",
      PORT: "70000",
    }),
    /PORT/,
  );
});
