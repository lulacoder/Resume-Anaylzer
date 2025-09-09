# Resume Analyzer Setup Guide

## Supabase Storage Configuration

To fix the "Failed to fetch" error when analyzing PDFs, you need to configure the Supabase storage bucket:

### 1. Create Storage Bucket
1. Go to your Supabase dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **Create Bucket**
4. Set the following:
   - **Name**: `resumes`
   - **Public**: `false` (recommended for privacy)
   - **File size limit**: `5MB` (or adjust as needed)

### 2. Set Bucket Policies
Create these policies for the `resumes` bucket:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resumes');
```

**Policy 2: Allow users to read their own files**
```sql
CREATE POLICY "Allow users to read own files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### 3. Environment Variables
Ensure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Database Tables
Ensure these tables exist in your Supabase database:

**resumes table:**
```sql
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  parsed_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
```

**analyses table:**
```sql
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  job_title TEXT,
  job_description TEXT,
  analysis_result JSONB,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_resume_id ON analyses(resume_id);
```

## Troubleshooting

### Common Issues:

1. **"Failed to fetch" error**: Usually indicates the storage bucket doesn't exist
2. **"Storage service unavailable"**: Check your Supabase connection
3. **"File too large"**: Reduce file size or increase bucket limit
4. **"Could not extract text from PDF"**: Try a different PDF or check if it's corrupted

### Debug Steps:
1. Check browser console for detailed error messages
2. Verify all environment variables are set
3. Ensure you're logged in before uploading
4. Try with a small PDF file first (< 1MB)

## Testing

1. Log in to the application
2. Navigate to the analyze page
3. Upload a small PDF file (< 1MB)
4. Check browser console for any error messages
5. Verify the file appears in Supabase Storage