-- OR-WEB-0101: Run once with wrangler d1 execute oldroot-votes --remote --file=./schema.sql
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voter_hash TEXT NOT NULL UNIQUE,
  ip_hash TEXT NOT NULL,
  choice TEXT NOT NULL CHECK(choice IN ('Gila Monster','Latch','Anchorage','Flying Saucer')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_vote_ip_time ON votes(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_vote_choice ON votes(choice);
