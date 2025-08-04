-- Campaign Analytics View
CREATE OR REPLACE VIEW campaign_analytics AS
SELECT 
  c.id,
  c.title,
  c.brand_id,
  b.company_name as brand_name,
  c.status,
  c.budget,
  c.created_at,
  c.start_date,
  c.end_date,
  COUNT(DISTINCT ca.id) as total_applications,
  COUNT(DISTINCT CASE WHEN ca.status = 'accepted' THEN ca.id END) as accepted_applications,
  COUNT(DISTINCT CASE WHEN ca.status = 'pending' THEN ca.id END) as pending_applications,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_payments,
  COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount END), 0) as total_spent,
  COUNT(DISTINCT m.id) as total_messages,
  AVG(CASE WHEN ca.status = 'accepted' THEN ca.proposed_budget END) as avg_accepted_budget
FROM campaigns c
LEFT JOIN brand_profiles b ON c.brand_id = b.id
LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
LEFT JOIN transactions t ON c.id = t.campaign_id
LEFT JOIN conversations conv ON c.id = conv.campaign_id
LEFT JOIN messages m ON conv.id = m.conversation_id
GROUP BY c.id, c.title, c.brand_id, b.company_name, c.status, c.budget, c.created_at, c.start_date, c.end_date;

-- Influencer Analytics View
CREATE OR REPLACE VIEW influencer_analytics AS
SELECT 
  i.id,
  i.full_name,
  i.username,
  i.total_earned,
  i.completed_campaigns,
  i.rating,
  i.instagram_followers,
  i.youtube_subscribers,
  i.tiktok_followers,
  COUNT(DISTINCT ca.id) as total_applications,
  COUNT(DISTINCT CASE WHEN ca.status = 'accepted' THEN ca.id END) as accepted_applications,
  COUNT(DISTINCT CASE WHEN ca.status = 'accepted' THEN ca.campaign_id END) as unique_brands_worked_with,
  AVG(CASE WHEN ca.status = 'accepted' THEN ca.proposed_budget END) as avg_campaign_value,
  COUNT(DISTINCT r.id) as total_reviews,
  AVG(r.rating) as avg_rating
FROM influencer_profiles i
LEFT JOIN campaign_applications ca ON i.id = ca.influencer_id
LEFT JOIN campaigns c ON ca.campaign_id = c.id
LEFT JOIN reviews r ON i.id = r.reviewed_user_id
GROUP BY i.id, i.full_name, i.username, i.total_earned, i.completed_campaigns, i.rating, 
         i.instagram_followers, i.youtube_subscribers, i.tiktok_followers;

-- Brand Analytics View
CREATE OR REPLACE VIEW brand_analytics AS
SELECT 
  b.id,
  b.company_name,
  b.industry,
  b.total_spent,
  b.completed_campaigns,
  COUNT(DISTINCT c.id) as total_campaigns,
  COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_campaigns,
  COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as completed_campaigns_count,
  COUNT(DISTINCT ca.influencer_id) as unique_influencers_worked_with,
  AVG(c.budget) as avg_campaign_budget,
  SUM(c.budget) as total_budget_allocated,
  COUNT(DISTINCT m.id) as total_messages_sent
FROM brand_profiles b
LEFT JOIN campaigns c ON b.id = c.brand_id
LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id AND ca.status = 'accepted'
LEFT JOIN conversations conv ON c.id = conv.campaign_id
LEFT JOIN messages m ON conv.id = m.conversation_id AND m.sender_type = 'brand'
GROUP BY b.id, b.company_name, b.industry, b.total_spent, b.completed_campaigns;

-- Platform Overview Stats Function
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_influencers BIGINT,
  total_brands BIGINT,
  total_campaigns BIGINT,
  active_campaigns BIGINT,
  total_applications BIGINT,
  total_transactions BIGINT,
  total_revenue DECIMAL,
  total_platform_fees DECIMAL,
  avg_campaign_budget DECIMAL,
  avg_application_rate DECIMAL,
  top_categories JSON
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      (SELECT COUNT(*) FROM users WHERE account_status = 'active') as total_users,
      (SELECT COUNT(*) FROM influencer_profiles) as total_influencers,
      (SELECT COUNT(*) FROM brand_profiles) as total_brands,
      (SELECT COUNT(*) FROM campaigns) as total_campaigns,
      (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
      (SELECT COUNT(*) FROM campaign_applications) as total_applications,
      (SELECT COUNT(*) FROM transactions WHERE status = 'completed') as total_transactions,
      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed') as total_revenue,
      (SELECT COALESCE(SUM(platform_fee), 0) FROM transactions WHERE status = 'completed') as total_platform_fees,
      (SELECT AVG(budget) FROM campaigns) as avg_campaign_budget,
      (SELECT AVG(application_count) FROM (
        SELECT COUNT(*) as application_count 
        FROM campaigns c 
        JOIN campaign_applications ca ON c.id = ca.campaign_id 
        GROUP BY c.id
      ) subq) as avg_application_rate
  ),
  top_cats AS (
    SELECT json_agg(
      json_build_object(
        'category', category,
        'count', count
      ) ORDER BY count DESC
    ) as top_categories
    FROM (
      SELECT unnest(categories) as category, COUNT(*) as count
      FROM campaigns
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    ) cat_counts
  )
  SELECT 
    stats.*,
    top_cats.top_categories
  FROM stats, top_cats;
END;
$$ LANGUAGE plpgsql;

-- Campaign Performance Function
CREATE OR REPLACE FUNCTION get_campaign_performance(p_campaign_id UUID)
RETURNS TABLE (
  campaign_id UUID,
  views INTEGER,
  applications INTEGER,
  application_rate DECIMAL,
  accepted_applications INTEGER,
  acceptance_rate DECIMAL,
  avg_proposed_budget DECIMAL,
  total_spent DECIMAL,
  messages_exchanged INTEGER,
  avg_response_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as campaign_id,
    c.views,
    COUNT(DISTINCT ca.id)::INTEGER as applications,
    CASE WHEN c.views > 0 THEN COUNT(DISTINCT ca.id)::DECIMAL / c.views * 100 ELSE 0 END as application_rate,
    COUNT(DISTINCT CASE WHEN ca.status = 'accepted' THEN ca.id END)::INTEGER as accepted_applications,
    CASE WHEN COUNT(ca.id) > 0 THEN COUNT(CASE WHEN ca.status = 'accepted' THEN 1 END)::DECIMAL / COUNT(ca.id) * 100 ELSE 0 END as acceptance_rate,
    AVG(ca.proposed_budget) as avg_proposed_budget,
    COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount END), 0) as total_spent,
    COUNT(DISTINCT m.id)::INTEGER as messages_exchanged,
    AVG(m.created_at - ca.created_at) as avg_response_time
  FROM campaigns c
  LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
  LEFT JOIN transactions t ON c.id = t.campaign_id
  LEFT JOIN conversations conv ON c.id = conv.campaign_id
  LEFT JOIN messages m ON conv.id = m.conversation_id
  WHERE c.id = p_campaign_id
  GROUP BY c.id, c.views;
END;
$$ LANGUAGE plpgsql;

-- Influencer Performance Function
CREATE OR REPLACE FUNCTION get_influencer_performance(p_influencer_id UUID, p_date_from DATE DEFAULT NULL, p_date_to DATE DEFAULT NULL)
RETURNS TABLE (
  total_applications INTEGER,
  accepted_applications INTEGER,
  acceptance_rate DECIMAL,
  total_earned DECIMAL,
  avg_campaign_value DECIMAL,
  completed_campaigns INTEGER,
  avg_response_time INTERVAL,
  total_followers BIGINT,
  engagement_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT ca.id)::INTEGER as total_applications,
    COUNT(DISTINCT CASE WHEN ca.status = 'accepted' THEN ca.id END)::INTEGER as accepted_applications,
    CASE WHEN COUNT(ca.id) > 0 THEN COUNT(CASE WHEN ca.status = 'accepted' THEN 1 END)::DECIMAL / COUNT(ca.id) * 100 ELSE 0 END as acceptance_rate,
    COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount - t.platform_fee END), 0) as total_earned,
    AVG(CASE WHEN ca.status = 'accepted' THEN ca.proposed_budget END) as avg_campaign_value,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.campaign_id END)::INTEGER as completed_campaigns,
    AVG(ca.updated_at - ca.created_at) as avg_response_time,
    (i.instagram_followers + i.youtube_subscribers + i.tiktok_followers) as total_followers,
    CASE 
      WHEN (i.instagram_followers + i.youtube_subscribers + i.tiktok_followers) > 0 
      THEN (i.completed_campaigns::DECIMAL / (i.instagram_followers + i.youtube_subscribers + i.tiktok_followers)) * 100
      ELSE 0 
    END as engagement_rate
  FROM influencer_profiles i
  LEFT JOIN campaign_applications ca ON i.id = ca.influencer_id
    AND (p_date_from IS NULL OR ca.created_at >= p_date_from)
    AND (p_date_to IS NULL OR ca.created_at <= p_date_to)
  LEFT JOIN transactions t ON ca.campaign_id = t.campaign_id AND ca.influencer_id = t.influencer_id
  WHERE i.id = p_influencer_id
  GROUP BY i.id, i.instagram_followers, i.youtube_subscribers, i.tiktok_followers, i.completed_campaigns;
END;
$$ LANGUAGE plpgsql;

-- Trending Creators Function
CREATE OR REPLACE FUNCTION get_trending_creators(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  influencer_id UUID,
  full_name TEXT,
  username TEXT,
  profile_image TEXT,
  categories TEXT[],
  total_followers BIGINT,
  recent_campaigns INTEGER,
  avg_rating DECIMAL,
  growth_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id as influencer_id,
    i.full_name,
    i.username,
    i.profile_image,
    i.categories,
    (i.instagram_followers + i.youtube_subscribers + i.tiktok_followers) as total_followers,
    COUNT(DISTINCT ca.campaign_id)::INTEGER as recent_campaigns,
    AVG(r.rating) as avg_rating,
    -- Simple growth metric based on recent campaign success
    (COUNT(DISTINCT CASE WHEN ca.created_at > NOW() - INTERVAL '30 days' THEN ca.id END)::DECIMAL / 
     GREATEST(COUNT(DISTINCT CASE WHEN ca.created_at > NOW() - INTERVAL '60 days' THEN ca.id END), 1)) * 100 as growth_rate
  FROM influencer_profiles i
  LEFT JOIN campaign_applications ca ON i.id = ca.influencer_id AND ca.status = 'accepted'
  LEFT JOIN reviews r ON i.id = r.reviewed_user_id
  WHERE ca.created_at > NOW() - INTERVAL '90 days'
  GROUP BY i.id, i.full_name, i.username, i.profile_image, i.categories, 
           i.instagram_followers, i.youtube_subscribers, i.tiktok_followers
  HAVING COUNT(DISTINCT ca.campaign_id) > 0
  ORDER BY growth_rate DESC, recent_campaigns DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Top Performing Campaigns Function
CREATE OR REPLACE FUNCTION get_top_campaigns(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  campaign_id UUID,
  title TEXT,
  brand_name TEXT,
  budget DECIMAL,
  applications INTEGER,
  application_rate DECIMAL,
  completion_rate DECIMAL,
  avg_influencer_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as campaign_id,
    c.title,
    b.company_name as brand_name,
    c.budget,
    COUNT(DISTINCT ca.id)::INTEGER as applications,
    CASE WHEN c.views > 0 THEN COUNT(DISTINCT ca.id)::DECIMAL / c.views * 100 ELSE 0 END as application_rate,
    CASE WHEN COUNT(DISTINCT ca.id) > 0 
      THEN COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::DECIMAL / COUNT(DISTINCT ca.id) * 100 
      ELSE 0 
    END as completion_rate,
    AVG(ip.rating) as avg_influencer_rating
  FROM campaigns c
  JOIN brand_profiles b ON c.brand_id = b.id
  LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
  LEFT JOIN transactions t ON c.id = t.campaign_id
  LEFT JOIN influencer_profiles ip ON ca.influencer_id = ip.id
  WHERE c.status IN ('active', 'completed')
  GROUP BY c.id, c.title, b.company_name, c.budget, c.views
  HAVING COUNT(DISTINCT ca.id) > 0
  ORDER BY application_rate DESC, completion_rate DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON campaign_analytics TO authenticated;
GRANT SELECT ON influencer_analytics TO authenticated;
GRANT SELECT ON brand_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_campaign_performance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_influencer_performance(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_creators(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_campaigns(INTEGER) TO authenticated;