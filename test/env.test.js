import test from "node:test";
import assert from "node:assert/strict";
import { getSchedulerUrl, validateEnv } from "../src/config/env.js";

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

test("getSchedulerUrl utilise le contrat local du scheduler par défaut", () => {
  assert.equal(
    getSchedulerUrl({}),
    "http://localhost:3001/api/ai/process",
  );
});

test("validateEnv autorise le port Angular local par défaut", () => {
  const config = validateEnv({
    DATABASE_URL: "mysql://localhost/grm",
    JWT_SECRET: "secret-de-test",
  });

  assert.ok(config.corsOrigins.includes("http://localhost:4200"));
});

test("getSchedulerUrl reste compatible avec l'ancien nom de variable", () => {
  assert.equal(
    getSchedulerUrl({ autochedule_api_url: "http://scheduler:3001/api/ai/process" }),
    "http://scheduler:3001/api/ai/process",
  );
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
