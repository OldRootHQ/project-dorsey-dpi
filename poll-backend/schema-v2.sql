-- Reader's Choice 2026 lineup migration (safe and non-destructive).
-- Run on the EXISTING oldroot-votes D1 database while POLL_OPEN=false.
-- The previous votes table is retained for archival/rollback purposes.
-- All current Reader's Choice submissions and private counts use votes_v2.
CREATE TABLE IF NOT EXISTS votes_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voter_hash TEXT NOT NULL UNIQUE,
  ip_hash TEXT NOT NULL,
  choice TEXT NOT NULL CHECK(choice IN (
    'Gila Monster', 'Agent Emerald', 'Kincast',
    'Isiah Ivory', 'Liontone', 'Remedie'
  )),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_votes_v2_ip_time ON votes_v2(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_votes_v2_choice ON votes_v2(choice);
