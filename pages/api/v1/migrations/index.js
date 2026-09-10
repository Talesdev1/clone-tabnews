import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorsHandlers);

async function getHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationsOptions = getDefaultMigrationsOptions(dbClient);

    let pendingMigrations = await migrationRunner(defaultMigrationsOptions);
    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationsOptions = getDefaultMigrationsOptions(
      dbClient,
      false,
    );

    const migratedMigrations = await migrationRunner(defaultMigrationsOptions);

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
}

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
