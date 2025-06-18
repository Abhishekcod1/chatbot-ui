--------------- DOUBTS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS doubts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    question TEXT NOT NULL CHECK (char_length(question) <= 10000),
    answer TEXT CHECK (char_length(answer) <= 10000),
    solved BOOLEAN NOT NULL DEFAULT FALSE,
    mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    solved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX idx_doubts_user_id ON doubts (user_id);
CREATE INDEX idx_doubts_workspace_id ON doubts (workspace_id);

-- RLS --

ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own doubts"
    ON doubts
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow read access to all doubts"
    ON doubts
    FOR SELECT
    USING (TRUE);

-- TRIGGERS --

CREATE TRIGGER update_doubts_updated_at
BEFORE UPDATE ON doubts
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

