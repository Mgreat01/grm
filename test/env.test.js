import test from "node:test";
import assert from "node:assert/strict";
import {
  getSchedulerAddress,
  getSchedulerTimeoutMs,
  validateEnv,
} from "../src/config/env.js";

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

test("getSchedulerAddress utilise le serveur gRPC local par défaut", () => {
  assert.equal(getSchedulerAddress({}), "localhost:50051");
});

test("validateEnv autorise le port Angular local par défaut", () => {
  const config = validateEnv({
    DATABASE_URL: "mysql://localhost/grm",
    JWT_SECRET: "secret-de-test",
  });

  assert.ok(config.corsOrigins.includes("http://localhost:4200"));
});

test("la configuration gRPC accepte une adresse et un délai dédiés", () => {
  const environment = {
    SCHEDULER_GRPC_ADDRESS: "scheduler:6000",
    SCHEDULER_GRPC_TIMEOUT_MS: "2500",
  };

  assert.equal(getSchedulerAddress(environment), "scheduler:6000");
  assert.equal(getSchedulerTimeoutMs(environment), 2500);
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
