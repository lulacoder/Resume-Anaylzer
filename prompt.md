# Mission: Full-Stack Next.js Application Generation

## 1. Your Role & Objective

You are an expert senior full-stack developer specializing in Next.js, TypeScript, Supabase, and Tailwind CSS. Your objective is to generate the complete source code for a "Resume Analyzer" application based on the detailed specifications provided below. Adhere strictly to the provided file structure and implementation details.

## 2. Core Technologies

-   **Framework**: Next.js 14+ (App Router)
-   **Language**: TypeScript
-   **Database & Auth**: Supabase
-   **Styling**: Tailwind CSS
-   **AI**: Google Gemini API
-   **File Parsing**: `pdfjs-dist` (You will assume text is extracted and available for the server action)
-   **Data Validation**: Zod
-   **Key Libraries**: `@supabase/auth-helpers-nextjs`, `zod`, `pdfjs-dist`

## 3. The Complete Project File Structure

You will generate code for the following file structure. You MUST adhere to this structure precisely. All code should reside within the `src/` directory.

src/
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ │ └── page.tsx
│ │ ├── signup/
│ │ │ └── page.tsx
│ │ └── callback/
│ │ └── route.ts # <-- Handles OAuth callback
│ ├── dashboard/
│ │ ├── loading.tsx
│ │ └── page.tsx
│ ├── analyze/
│ │ ├── error.tsx
│ │ ├── loading.tsx
│ │ └── page.tsx
│ ├── globals.css
│ ├── layout.tsx # Root Layout
│ └── page.tsx # Landing Page
│
├── components/
│ ├── AnalysisResult.tsx
│ ├── JobInputForm.tsx
│ ├── Navbar.tsx
│ ├── UploadForm.tsx
│ └── ui/
│ ├── Button.tsx
│ ├── Card.tsx
│ ├── Input.tsx
│ └── Spinner.tsx
│
├── lib/
│ ├── actions.ts # Server Actions
│ ├── geminiClient.ts # Gemini API helper
│ ├── parsePdf.ts # PDF text extraction (Provide a placeholder function)
│ ├── supabaseClient.ts # Supabase client setup (Browser client)
│ └── validators.ts # Zod schemas
│
└── types/
└── index.ts # TypeScript types

## 4. Supabase Database Schema & RLS

The database is already migrated with the following SQL. Your code, especially the server action and types, must align with this schema.

```sql
-- Resumes Table
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  parsed_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Analyses Table
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT,
  job_description TEXT NOT NULL,
  analysis_result JSONB, -- The structured result from Gemini
  match_score INT CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS Policies (ensuring users only access their own data)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own analyses" ON public.analyses FOR ALL USING (auth.uid() = user_id);

Now, generate the complete, production-ready code for each file listed in the project structure. Provide the code file by file, starting with the lib and types directories as they are dependencies for the rest of the app. Use Markdown code blocks with the correct language identifier (e.g., ```tsx).
Follow this generation order:
Types (src/types/index.ts): Define AnalysisResult and AnalysisRecord based on the database schema.
Validators (src/lib/validators.ts): Create a Zod schema for the analysis form input.
Supabase Client (src/lib/supabaseClient.ts): Create the browser client using createBrowserClient.
Auth Callback (src/app/(auth)/callback/route.ts): Implement the server-side code exchange using createRouteHandlerClient.
Root Layout (src/app/layout.tsx): Set up the main layout, including the Navbar.
Navbar (src/components/Navbar.tsx): Create a navbar that shows login/signup buttons or a link to the dashboard if the user is authenticated.
UI Components (src/components/ui/*): Create basic, unstyled functional components for Button, Card, Input, Spinner.
Login Page (src/app/(auth)/login/page.tsx): Create a client component form for email/password and social login (Google).
Server Actions (src/lib/actions.ts): This is the core logic.
Create signInWithEmail, signUpNewUser, signOut actions.
Create the main analyzeResumeAction function. This function must:
a. Accept form data validated by Zod.
b. Use createServerActionClient from @supabase/auth-helpers-nextjs.
c. Perform the database operations (inserting records).
d. Contain a placeholder call to the Gemini API.
e. Return a structured response or error.
Analyze Page (src/app/analyze/page.tsx): Build the main form that uses the analyzeResumeAction. It should handle file uploads and text area input.
Dashboard Page (src/app/dashboard/page.tsx): A server component that fetches and displays a user's past analyses from Supabase.
Loading & Error UI (loading.tsx, error.tsx): Create simple loading and error components for the dashboard and analyze routes.
Begin generation now.
