import test from "node:test";
import assert from "node:assert/strict";
import { swaggerSpec } from "../swagger.js";

test("Swagger déclare une authentification Bearer JWT", () => {
  assert.deepEqual(swaggerSpec.security, [{ bearerAuth: [] }]);
  assert.deepEqual(swaggerSpec.components.securitySchemes.bearerAuth, {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Saisissez uniquement le JWT retourné par /utilisateurs/login.",
  });
});

test("les routes d'inscription et de connexion restent publiques", () => {
  assert.deepEqual(swaggerSpec.paths["/utilisateurs/register"].post.security, []);
  assert.deepEqual(swaggerSpec.paths["/utilisateurs/login"].post.security, []);
});
