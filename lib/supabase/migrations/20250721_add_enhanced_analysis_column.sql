-- Add enhanced_analysis column to analyses table
-- This will store the full enhanced analysis result alongside the legacy format

ALTER TABLE analyses 
ADD COLUMN enhanced_analysis JSONB;

-- Add index for enhanced_analysis queries if needed
CREATE INDEX IF NOT EXISTS idx_analyses_enhanced_analysis_gin 
ON analyses USING gin (enhanced_analysis);

-- Add comment for documentation
COMMENT ON COLUMN analyses.enhanced_analysis IS 'Full enhanced analysis result with detailed skill mapping, experience analysis, and industry insights';