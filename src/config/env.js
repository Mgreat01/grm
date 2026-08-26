const requiredVariables = ["DATABASE_URL", "JWT_SECRET"];

export const validateEnv = (environment = process.env) => {
  const missing = requiredVariables.filter((name) => !environment[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Variables d'environnement manquantes : ${missing.join(", ")}`);
  }

  const port = Number.parseInt(environment.PORT || "5000", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT doit être un entier compris entre 1 et 65535");
  }

  return {
    port,
    corsOrigins: (environment.CORS_ORIGINS || "http://localhost:4200,http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
};

export const getSchedulerUrl = (environment = process.env) =>
  environment.AUTO_SCHEDULE_API_URL ||
  environment.autochedule_api_url ||
  "http://localhost:3001/api/ai/process";
