import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database";

function getDefaultMigrationsOptions(dbClient, dryRun = true) {
  return {
    dbClient: dbClient,
    dryRun: dryRun,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationsOptions = getDefaultMigrationsOptions(dbClient);

    let pendingMigrations = await migrationRunner(defaultMigrationsOptions);
    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationsOptions = getDefaultMigrationsOptions(
      dbClient,
      false,
    );

    const migratedMigrations = await migrationRunner(defaultMigrationsOptions);

    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
