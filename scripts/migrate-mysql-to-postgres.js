import "dotenv/config";
import mysql from "mysql2/promise";
import pg from "pg";

const { Client } = pg;
const sourceUrl = process.env.MYSQL_SOURCE_URL;
const targetUrl = process.env.POSTGRES_TARGET_URL;
const confirmed = process.env.MIGRATION_CONFIRM === "YES";

if (!sourceUrl || !targetUrl) {
  throw new Error("MYSQL_SOURCE_URL et POSTGRES_TARGET_URL sont obligatoires.");
}

if (!sourceUrl.startsWith("mysql://") || !targetUrl.startsWith("postgres")) {
  throw new Error("La source doit être MySQL et la cible PostgreSQL.");
}

const source = await mysql.createConnection(sourceUrl);
const targetHost = new URL(targetUrl).hostname;
const target = new Client({
  connectionString: targetUrl,
  ssl: ["localhost", "127.0.0.1"].includes(targetHost)
    ? false
    : { rejectUnauthorized: false },
});

const tables = [
  { source: "Specialite", target: "Specialite", columns: ["id", "nom"] },
  { source: "Symptome", target: "Symptome", columns: ["id", "nom"] },
  {
    source: "Utilisateur",
    target: "Utilisateur",
    columns: ["id", "noms_complet", "email", "motdepasse", "type", "specialiteId", "estActif"],
    booleans: ["estActif"],
  },
  {
    source: "Disponibilite",
    target: "Disponibilite",
    columns: ["id", "medecinId", "date", "heure_debut", "heure_fin"],
  },
  {
    source: "RendezVous",
    target: "RendezVous",
    columns: [
      "id", "uuid", "nom_patient", "email_patient", "numero_patient", "statut",
      "presence", "date_rdv", "heure_rdv", "specialiteId", "medecinId", "date_creation",
    ],
    booleans: ["presence"],
  },
  { source: "_SymptomeToSpecialite", target: "_SymptomeToSpecialite", columns: ["A", "B"] },
  { source: "_RdvToSymptomes", target: "_RdvToSymptomes", columns: ["A", "B"] },
];

const quotePostgres = (identifier) => `"${identifier.replaceAll('"', '""')}"`;
const quoteMysql = (identifier) => `\`${identifier.replaceAll("`", "``")}\``;

async function readRows(table) {
  const columns = table.columns.map(quoteMysql).join(", ");
  const [rows] = await source.query(`SELECT ${columns} FROM ${quoteMysql(table.source)}`);
  return rows;
}

async function insertRows(table, rows) {
  const columns = table.columns.map(quotePostgres).join(", ");
  const parameters = table.columns.map((_, index) => `$${index + 1}`).join(", ");
  const sql = `INSERT INTO ${quotePostgres(table.target)} (${columns}) VALUES (${parameters})`;

  for (const row of rows) {
    const values = table.columns.map((column) => {
      const value = row[column];
      return table.booleans?.includes(column) && value !== null ? Boolean(value) : value;
    });
    await target.query(sql, values);
  }
}

try {
  const snapshots = [];
  for (const table of tables) {
    snapshots.push({ table, rows: await readRows(table) });
  }

  console.table(snapshots.map(({ table, rows }) => ({ table: table.source, lignes: rows.length })));
  if (!confirmed) {
    console.log("Simulation terminée. Relancez avec MIGRATION_CONFIRM=YES pour écrire dans PostgreSQL.");
    process.exitCode = 2;
  } else {
    await target.connect();
    await target.query("BEGIN");
    await target.query(`TRUNCATE TABLE
      "_RdvToSymptomes", "_SymptomeToSpecialite", "RendezVous", "Disponibilite",
      "Utilisateur", "Symptome", "Specialite" RESTART IDENTITY CASCADE`);

    for (const snapshot of snapshots) {
      await insertRows(snapshot.table, snapshot.rows);
    }

    for (const table of ["Specialite", "Symptome", "Utilisateur", "Disponibilite", "RendezVous"]) {
      await target.query(
        `SELECT setval(pg_get_serial_sequence($1, 'id'), COALESCE(MAX("id"), 1), COUNT(*) > 0) FROM ${quotePostgres(table)}`,
        [quotePostgres(table)],
      );
    }

    await target.query("COMMIT");
    console.log("Migration MySQL vers PostgreSQL terminée avec succès.");
  }
} catch (error) {
  if (target._connected) await target.query("ROLLBACK").catch(() => undefined);
  console.error("Migration annulée :", error.message);
  process.exitCode = 1;
} finally {
  await source.end().catch(() => undefined);
  await target.end().catch(() => undefined);
}
