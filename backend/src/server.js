import "dotenv/config";

import app from "./app.js";
import pool from "./config/database.js";

const PORT =
  process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query(
      "SELECT 1"
    );

    console.log(
      "PostgreSQL connection successful"
    );

    const server =
      app.listen(
        PORT,
        "0.0.0.0",
        () => {
          console.log(
            `AzureDrop API running on port ${PORT}`
          );
        }
      );

    const shutdown =
      async (
        signal
      ) => {
        console.log(
          `${signal} received. Shutting down...`
        );

        server.close(
          async () => {
            try {
              await pool.end();

              console.log(
                "PostgreSQL connection closed"
              );

              process.exit(
                0
              );
            } catch (
              error
            ) {
              console.error(
                "Error during shutdown:",
                error
              );

              process.exit(
                1
              );
            }
          }
        );
      };

    process.on(
      "SIGTERM",
      () =>
        shutdown(
          "SIGTERM"
        )
    );

    process.on(
      "SIGINT",
      () =>
        shutdown(
          "SIGINT"
        )
    );
  } catch (error) {
    console.error(
      "Unable to start AzureDrop:",
      error
    );

    process.exit(1);
  }
}

startServer();