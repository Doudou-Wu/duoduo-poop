import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

// A private connection keeps unrelated queries out of this transaction.
// Set foreign_keys BEFORE BEGIN; SQLite ignores changes during a transaction.
export async function transaction(
  db: SQLiteDatabase,
  task: (tx: SQLiteDatabase) => Promise<void>,
) {
  // Expo expects a filename and directory separately, not an absolute filename.
  const path = db.databasePath.replace(/\\/g, "/");
  const separator = path.lastIndexOf("/");
  const tx = await openDatabaseAsync(
    path.slice(separator + 1),
    { useNewConnection: true },
    separator >= 0 ? path.slice(0, separator) : undefined,
  );
  try {
    await tx.execAsync("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
    await tx.withTransactionAsync(() => task(tx));
  } finally {
    await tx.closeAsync();
  }
}
