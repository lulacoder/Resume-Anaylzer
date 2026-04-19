import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/auth/signup" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to sign up
        </Link>

        <article className="space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">
            By using Resume Analyzer, you agree to use the service lawfully and not upload content you do not have rights to process.
          </p>
          <p className="text-sm text-muted-foreground">
            The AI suggestions are advisory and may be incomplete. You remain responsible for final resume accuracy.
          </p>
          <p className="text-sm text-muted-foreground">
            We may update these terms over time. Continued use of the app indicates acceptance of changes.
          </p>
        </article>
      </div>
    </div>
  );
}
