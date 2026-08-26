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

test("Swagger couvre toutes les routes Express", () => {
  const routesAttendues = [
    "/admin/users",
    "/receptionnistes/medecins",
    "/receptionnistes/symptomes",
    "/auto-schedule",
  ];

  for (const route of routesAttendues) {
    assert.ok(swaggerSpec.paths[route], `Route Swagger manquante : ${route}`);
  }
});

test("le rendez-vous utilise le contrat symptomeIds", () => {
  const schema = swaggerSpec.paths["/receptionnistes/rendezvous"]
    .post.requestBody.content["application/json"].schema;

  assert.ok(schema.properties.symptomeIds);
  assert.equal(schema.properties.symptome, undefined);
  assert.ok(schema.required.includes("symptomeIds"));
});
