import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
    const databaseName = process.env.POSTGRES_DB;
    const result = await database.query({
      text: `SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname= $1;`,
      values: [databaseName],
    });
    const result2 = await database.query(
      "SELECT * FROM pg_settings where name = 'server_version' or name='max_connections';",
    );
    const opened_connections = result.rows[0].count;
    const max_connections = result2.rows
      .filter((line) => line.name == "max_connections")
      .map((line) => line.setting)[0];
    const server_version = result2.rows
      .filter((line) => line.name == "server_version")
      .map((line) => line.setting)[0];
    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: server_version,
          max_connections: parseInt(max_connections),
          opened_connections,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\n Error dentro do catch do controler:");
    console.error(publicErrorObject);
    response.status(500).json({ publicErrorObject });
  }
}

export default status;
