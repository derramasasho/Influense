-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES campaign_applications(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  brand_unread_count INT DEFAULT 0,
  influencer_unread_count INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, brand_id, influencer_id)
);

-- Messages table (updated)
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('brand', 'influencer', 'system')),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'deal_proposal', 'file', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal proposals table
CREATE TABLE deal_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  proposed_by TEXT NOT NULL CHECK (proposed_by IN ('brand', 'influencer')),
  budget DECIMAL(10, 2) NOT NULL CHECK (budget >= 0),
  deliverables JSONB NOT NULL,
  timeline JSONB,
  terms TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_brand_id ON conversations(brand_id);
CREATE INDEX idx_conversations_influencer_id ON conversations(influencer_id);
CREATE INDEX idx_conversations_campaign_id ON conversations(campaign_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_deal_proposals_conversation_id ON deal_proposals(conversation_id);

-- Update conversation stats trigger
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last message info
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    brand_unread_count = CASE 
      WHEN NEW.sender_type = 'influencer' THEN brand_unread_count + 1 
      ELSE brand_unread_count 
    END,
    influencer_unread_count = CASE 
      WHEN NEW.sender_type = 'brand' THEN influencer_unread_count + 1 
      ELSE influencer_unread_count 
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_stats_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_stats();

-- Mark messages as read function
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID,
  p_user_type TEXT
)
RETURNS void AS $$
BEGIN
  -- Mark messages as read
  UPDATE messages
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE 
    conversation_id = p_conversation_id
    AND sender_type != p_user_type
    AND is_read = FALSE;
  
  -- Reset unread count
  IF p_user_type = 'brand' THEN
    UPDATE conversations
    SET brand_unread_count = 0
    WHERE id = p_conversation_id;
  ELSE
    UPDATE conversations
    SET influencer_unread_count = 0
    WHERE id = p_conversation_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create conversation when application is accepted
CREATE OR REPLACE FUNCTION create_conversation_on_application_accept()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_id UUID;
  v_brand_id UUID;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Get campaign and brand info
    SELECT c.id, c.brand_id INTO v_campaign_id, v_brand_id
    FROM campaigns c
    WHERE c.id = NEW.campaign_id;
    
    -- Create conversation if doesn't exist
    INSERT INTO conversations (
      campaign_id,
      brand_id,
      influencer_id,
      application_id
    )
    VALUES (
      v_campaign_id,
      v_brand_id,
      NEW.influencer_id,
      NEW.id
    )
    ON CONFLICT (campaign_id, brand_id, influencer_id) 
    DO UPDATE SET application_id = NEW.id;
    
    -- Send system message
    INSERT INTO messages (
      conversation_id,
      sender_id,
      sender_type,
      message_type,
      content
    )
    SELECT 
      c.id,
      NEW.influencer_id,
      'system',
      'system',
      'Application accepted! You can now discuss campaign details.'
    FROM conversations c
    WHERE c.application_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_conversation_on_accept
AFTER UPDATE ON campaign_applications
FOR EACH ROW
EXECUTE FUNCTION create_conversation_on_application_accept();

-- RLS Policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM brand_profiles WHERE id = brand_id
      UNION
      SELECT user_id FROM influencer_profiles WHERE id = influencer_id
    )
  );

CREATE POLICY "Conversations are created automatically"
  ON conversations FOR INSERT
  WITH CHECK (TRUE); -- Only through triggers/functions

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM brand_profiles WHERE id = brand_id
      UNION
      SELECT user_id FROM influencer_profiles WHERE id = influencer_id
    )
  );

-- RLS Policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      LEFT JOIN brand_profiles bp ON c.brand_id = bp.id
      LEFT JOIN influencer_profiles ip ON c.influencer_id = ip.id
      WHERE bp.user_id = auth.uid() OR ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT c.id FROM conversations c
      LEFT JOIN brand_profiles bp ON c.brand_id = bp.id
      LEFT JOIN influencer_profiles ip ON c.influencer_id = ip.id
      WHERE bp.user_id = auth.uid() OR ip.user_id = auth.uid()
    )
  );

-- RLS Policies for deal proposals
ALTER TABLE deal_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deal proposals in their conversations"
  ON deal_proposals FOR SELECT
  USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      LEFT JOIN brand_profiles bp ON c.brand_id = bp.id
      LEFT JOIN influencer_profiles ip ON c.influencer_id = ip.id
      WHERE bp.user_id = auth.uid() OR ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create deal proposals"
  ON deal_proposals FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT c.id FROM conversations c
      LEFT JOIN brand_profiles bp ON c.brand_id = bp.id
      LEFT JOIN influencer_profiles ip ON c.influencer_id = ip.id
      WHERE bp.user_id = auth.uid() OR ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their deal proposals"
  ON deal_proposals FOR UPDATE
  USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      LEFT JOIN brand_profiles bp ON c.brand_id = bp.id
      LEFT JOIN influencer_profiles ip ON c.influencer_id = ip.id
      WHERE bp.user_id = auth.uid() OR ip.user_id = auth.uid()
    )
  );