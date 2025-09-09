-- Add composite index for user_id and created_at columns in analyses table
CREATE INDEX IF NOT EXISTS idx_analyses_user_id_created_at ON analyses (user_id, created_at DESC);

-- Add index for match_score to optimize sorting and filtering
CREATE INDEX IF NOT EXISTS idx_analyses_match_score ON analyses (match_score);

-- Add index for resume_id for faster joins
CREATE INDEX IF NOT EXISTS idx_analyses_resume_id ON analyses (resume_id);

-- Add index for job_title to optimize text searches
CREATE INDEX IF NOT EXISTS idx_analyses_job_title ON analyses (job_title);

-- Comment explaining the purpose of these indexes
COMMENT ON INDEX idx_analyses_user_id_created_at IS 'Optimizes queries that filter by user_id and sort by created_at, which is the common pattern for fetching user analysis history';
COMMENT ON INDEX idx_analyses_match_score IS 'Optimizes queries that sort or filter by match score';
COMMENT ON INDEX idx_analyses_resume_id IS 'Optimizes joins between analyses and resumes tables';
COMMENT ON INDEX idx_analyses_job_title IS 'Optimizes text searches and filters on job titles';

-- Add partial index for recent analyses to further optimize dashboard queries
CREATE INDEX IF NOT EXISTS idx_analyses_recent ON analyses (user_id, created_at DESC) 
WHERE created_at > (CURRENT_DATE - INTERVAL '30 days');

-- Optimize storage of large JSON data
-- This helps with I/O performance when dealing with large analysis_result JSON objects
ALTER TABLE analyses ALTER COLUMN analysis_result SET STORAGE EXTERNAL;

-- Add comment explaining the optimization strategy
COMMENT ON TABLE analyses IS 'Contains resume analysis results with optimized indexes for user_id + created_at and other common query patterns';