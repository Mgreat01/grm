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

export const getSchedulerAddress = (environment = process.env) =>
  environment.SCHEDULER_GRPC_ADDRESS || "localhost:50051";

export const getSchedulerTimeoutMs = (environment = process.env) => {
  const timeout = Number.parseInt(environment.SCHEDULER_GRPC_TIMEOUT_MS || "10000", 10);
  return Number.isInteger(timeout) && timeout > 0 ? timeout : 10000;
};
