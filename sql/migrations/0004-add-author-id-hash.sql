--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
ALTER TABLE messages ADD author_id_hash TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS index_author_id_hash ON messages (author_id_hash);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
ALTER TABLE messages DROP COLUMN author_id_hash;