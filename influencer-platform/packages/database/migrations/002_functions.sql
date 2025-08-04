-- Function to increment campaign applications count
CREATE OR REPLACE FUNCTION increment_campaign_applications(campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET total_applications = total_applications + 1
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment campaign view count
CREATE OR REPLACE FUNCTION increment_campaign_views(campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET view_count = view_count + 1
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get campaign statistics
CREATE OR REPLACE FUNCTION get_campaign_stats(brand_id_param UUID)
RETURNS TABLE (
  total_campaigns INT,
  active_campaigns INT,
  total_applications INT,
  pending_applications INT,
  total_spent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT c.id)::INT AS total_campaigns,
    COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END)::INT AS active_campaigns,
    COUNT(ca.id)::INT AS total_applications,
    COUNT(CASE WHEN ca.status = 'pending' THEN ca.id END)::INT AS pending_applications,
    COALESCE(SUM(t.amount), 0) AS total_spent
  FROM campaigns c
  LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
  LEFT JOIN transactions t ON c.brand_id = t.brand_id AND t.status = 'completed'
  WHERE c.brand_id = brand_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get influencer earnings
CREATE OR REPLACE FUNCTION get_influencer_earnings(influencer_id_param UUID)
RETURNS TABLE (
  total_earned DECIMAL,
  pending_payments DECIMAL,
  completed_campaigns INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount END), 0) AS total_earned,
    COALESCE(SUM(CASE WHEN t.status = 'pending' THEN t.amount END), 0) AS pending_payments,
    COUNT(DISTINCT CASE WHEN ca.status = 'accepted' AND c.status = 'completed' THEN c.id END)::INT AS completed_campaigns
  FROM campaign_applications ca
  JOIN campaigns c ON ca.campaign_id = c.id
  LEFT JOIN transactions t ON t.influencer_id = influencer_id_param
  WHERE ca.influencer_id = influencer_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;