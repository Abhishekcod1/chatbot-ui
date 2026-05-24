-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-update trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- links table
CREATE TABLE IF NOT EXISTS links (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL UNIQUE
                          CHECK (slug ~ '^[a-zA-Z0-9_-]{1,100}$'),
  destination TEXT        NOT NULL
                          CHECK (char_length(destination) >= 1 AND char_length(destination) <= 2048),
  title       TEXT        CHECK (char_length(title) <= 200),
  click_count BIGINT      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_links_slug    ON links (slug);
CREATE INDEX        IF NOT EXISTS idx_links_user_id ON links (user_id);

CREATE TRIGGER trg_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Link owners can do everything; anon can SELECT for redirects
CREATE POLICY "links: owner full access"
  ON links FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "links: anon read for redirect"
  ON links FOR SELECT
  USING (true);

-- link_clicks table
CREATE TABLE IF NOT EXISTS link_clicks (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id     UUID        NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referrer    TEXT        CHECK (char_length(referrer) <= 2048),
  user_agent  TEXT        CHECK (char_length(user_agent) <= 512),
  country     TEXT        CHECK (char_length(country) <= 2)
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id    ON link_clicks (link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks (clicked_at DESC);

ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Only link owners can read their click data
CREATE POLICY "link_clicks: owner can select"
  ON link_clicks FOR SELECT
  USING (
    link_id IN (SELECT id FROM links WHERE user_id = auth.uid())
  );

-- Atomic click tracking — called with service-role key from redirect handler
CREATE OR REPLACE FUNCTION increment_link_click(p_link_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO link_clicks (link_id) VALUES (p_link_id);
  UPDATE links SET click_count = click_count + 1 WHERE id = p_link_id;
END;
$$;
