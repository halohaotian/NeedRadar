import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

/**
 * Returns a shared postgres connection (singleton).
 * Do NOT call sql.end() — the connection is reused across requests.
 */
export function getDb() {
  if (_sql) return _sql;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  _sql = postgres(connectionString, {
    ssl: "require",
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return _sql;
}
