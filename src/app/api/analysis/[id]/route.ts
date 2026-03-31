import { createClient } from '@/lib/supabase/server';
import { getAnalysisById } from '@/lib/supabase/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const analysis = await getAnalysisById(id, user.id);
    return new Response(JSON.stringify({
      id: analysis.id,
      job_title: analysis.job_title,
      job_description: analysis.job_description,
      match_score: analysis.match_score,
      created_at: analysis.created_at,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Analysis not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
