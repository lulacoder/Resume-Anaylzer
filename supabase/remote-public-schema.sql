


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "job_title" "text",
    "job_description" "text" NOT NULL,
    "analysis_result" "jsonb",
    "match_score" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "enhanced_analysis" "jsonb",
    "improved_sections" "jsonb",
    CONSTRAINT "analyses_match_score_check" CHECK ((("match_score" >= 0) AND ("match_score" <= 100)))
);


ALTER TABLE "public"."analyses" OWNER TO "postgres";


COMMENT ON TABLE "public"."analyses" IS 'Stores the AI analysis results for a given resume and job description.';



COMMENT ON COLUMN "public"."analyses"."user_id" IS 'Denormalized user_id for simplified RLS and queries.';



COMMENT ON COLUMN "public"."analyses"."analysis_result" IS 'Structured JSON output from the Gemini AI analysis.';



COMMENT ON COLUMN "public"."analyses"."enhanced_analysis" IS 'Full enhanced analysis result with detailed skill mapping, experience analysis, and industry insights';



CREATE TABLE IF NOT EXISTS "public"."analysis_chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "analysis_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "analysis_chat_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."analysis_chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analysis_chat_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "analysis_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."analysis_chat_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analysis_rewrite_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "analysis_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "sections" "jsonb" NOT NULL,
    "generation_context" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."analysis_rewrite_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resumes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "parsed_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."resumes" OWNER TO "postgres";


COMMENT ON TABLE "public"."resumes" IS 'Stores uploaded resumes linked to users.';



COMMENT ON COLUMN "public"."resumes"."file_path" IS 'The path to the resume file in Supabase Storage.';



ALTER TABLE ONLY "public"."analyses"
    ADD CONSTRAINT "analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analysis_chat_messages"
    ADD CONSTRAINT "analysis_chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analysis_chat_sessions"
    ADD CONSTRAINT "analysis_chat_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analysis_rewrite_versions"
    ADD CONSTRAINT "analysis_rewrite_versions_analysis_id_version_number_key" UNIQUE ("analysis_id", "version_number");



ALTER TABLE ONLY "public"."analysis_rewrite_versions"
    ADD CONSTRAINT "analysis_rewrite_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_analyses_enhanced_analysis_gin" ON "public"."analyses" USING "gin" ("enhanced_analysis");



CREATE INDEX "idx_chat_messages_analysis_created" ON "public"."analysis_chat_messages" USING "btree" ("analysis_id", "created_at");



CREATE INDEX "idx_chat_messages_session_created" ON "public"."analysis_chat_messages" USING "btree" ("session_id", "created_at");



CREATE INDEX "idx_chat_sessions_analysis_created" ON "public"."analysis_chat_sessions" USING "btree" ("analysis_id", "created_at" DESC);



CREATE INDEX "idx_rewrite_versions_analysis_created" ON "public"."analysis_rewrite_versions" USING "btree" ("analysis_id", "created_at" DESC);



CREATE INDEX "idx_rewrite_versions_analysis_version" ON "public"."analysis_rewrite_versions" USING "btree" ("analysis_id", "version_number" DESC);



ALTER TABLE ONLY "public"."analyses"
    ADD CONSTRAINT "analyses_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analyses"
    ADD CONSTRAINT "analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analysis_chat_messages"
    ADD CONSTRAINT "analysis_chat_messages_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "public"."analyses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analysis_chat_messages"
    ADD CONSTRAINT "analysis_chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."analysis_chat_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analysis_chat_messages"
    ADD CONSTRAINT "analysis_chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analysis_chat_sessions"
    ADD CONSTRAINT "analysis_chat_sessions_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "public"."analyses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analysis_chat_sessions"
    ADD CONSTRAINT "analysis_chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analysis_rewrite_versions"
    ADD CONSTRAINT "analysis_rewrite_versions_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "public"."analyses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analysis_rewrite_versions"
    ADD CONSTRAINT "analysis_rewrite_versions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can fully manage their own analyses" ON "public"."analyses" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can fully manage their own chat messages" ON "public"."analysis_chat_messages" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can fully manage their own chat sessions" ON "public"."analysis_chat_sessions" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can fully manage their own resumes" ON "public"."resumes" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can fully manage their own rewrite versions" ON "public"."analysis_rewrite_versions" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analysis_chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analysis_chat_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analysis_rewrite_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resumes" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."analyses" TO "anon";
GRANT ALL ON TABLE "public"."analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."analyses" TO "service_role";



GRANT ALL ON TABLE "public"."analysis_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."analysis_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."analysis_chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."analysis_chat_sessions" TO "anon";
GRANT ALL ON TABLE "public"."analysis_chat_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."analysis_chat_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."analysis_rewrite_versions" TO "anon";
GRANT ALL ON TABLE "public"."analysis_rewrite_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."analysis_rewrite_versions" TO "service_role";



GRANT ALL ON TABLE "public"."resumes" TO "anon";
GRANT ALL ON TABLE "public"."resumes" TO "authenticated";
GRANT ALL ON TABLE "public"."resumes" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







