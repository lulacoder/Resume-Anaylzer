-- Create a database function to efficiently calculate average match score
-- This reduces data transfer by performing the calculation in the database
CREATE OR REPLACE FUNCTION get_user_average_score(user_id_param UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT AVG(match_score)
    FROM analyses
    WHERE user_id = user_id_param
    AND created_at > (CURRENT_DATE - INTERVAL '90 days')
  );
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the function
COMMENT ON FUNCTION get_user_average_score IS 'Efficiently calculates the average match score for a user over the last 90 days';