import path from "node:path";
import { fileURLToPath } from "node:url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { getSchedulerAddress, getSchedulerTimeoutMs } from "../config/env.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const definition = protoLoader.loadSync(
  path.join(currentDirectory, "..", "..", "proto", "scheduler.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true },
);
const schedulerPackage = grpc.loadPackageDefinition(definition).grm.scheduler.v1;

let client;

const getClient = () => {
  if (!client) {
    client = new schedulerPackage.SchedulerService(
      getSchedulerAddress(),
      grpc.credentials.createInsecure(),
    );
  }
  return client;
};

const normalizeAppointment = (appointment) => {
  const { specialite_id, medecin_id, ...fields } = appointment;
  return {
    ...fields,
    specialiteId: specialite_id,
    medecinId: medecin_id,
  };
};

export const scheduleAppointment = (payload) => new Promise((resolve, reject) => {
  const deadline = new Date(Date.now() + getSchedulerTimeoutMs());
  getClient().scheduleAppointment(
    {
      nom_patient: payload.nom_patient,
      email_patient: payload.email_patient,
      numero_patient: payload.numero_patient,
      symptome_ids: payload.symptomeIds,
    },
    { deadline },
    (error, response) => {
      if (error) return reject(error);
      return resolve(normalizeAppointment(response.appointment));
    },
  );
});

export { grpc };
