import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (_sql) return _sql;

  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    // Normalize: postgres:// → postgresql://
    const url = connectionString.startsWith("postgres://")
      ? "postgresql://" + connectionString.slice("postgres://".length)
      : connectionString;
    _sql = postgres(url, {
      ssl: "require",
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    return _sql;
  }

  // Fallback: build from individual env vars
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "5432";
  const database = process.env.DB_NAME || "postgres";
  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!host || !username) {
    throw new Error("No database configuration found. Set DATABASE_URL or DB_HOST+DB_USER+DB_PASSWORD");
  }

  _sql = postgres({
    host,
    port: parseInt(port),
    database,
    username,
    password: password || "",
    ssl: "require",
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return _sql;
}
