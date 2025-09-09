# Project Structure & Organization

## Root Directory Layout
```
├── src/app/                 # Next.js App Router pages
├── components/              # Reusable React components
├── lib/                     # Utility functions and configurations
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
└── .kiro/                   # Kiro AI assistant configuration
```

## App Router Structure (`src/app/`)
- **App Router pattern** - File-based routing with layout.tsx
- **Route organization**:
  - `/` - Landing page
  - `/auth/` - Authentication pages (login, signup, callback)
  - `/dashboard/` - User dashboard
  - `/analyze/` - Resume analysis interface

## Components Organization (`components/`)
- **Top-level components** - Page-specific components
- **`ui/` subdirectory** - shadcn/ui components (Button, etc.)
- **Component naming** - PascalCase, descriptive names
- **File structure**:
  - `AnalysisResult.tsx` - Display analysis results
  - `JobInputForm.tsx` - Job description input
  - `Navbar.tsx` - Navigation component
  - `UploadForm.tsx` - File upload (legacy/unused)

## Library Organization (`lib/`)
- **`actions.ts`** - Next.js Server Actions (auth, analysis)
- **`geminiClients.ts`** - AI client and analysis logic
- **`parsePdf.ts`** - PDF text extraction utilities
- **`prompts.ts`** - AI prompt templates
- **`validators.ts`** - Zod schemas for form validation
- **`supabase/`** - Database client configurations

## Type Definitions (`types/`)
- **`index.ts`** - Centralized type exports
- **Naming convention** - Descriptive interfaces (AnalysisResult, AnalysisRecord)

## Import Path Conventions
- **Absolute imports** using TypeScript paths:
  - `@/*` → `./src/*`
  - `@/components/*` → `./components/*`
  - `@/lib/*` → `./lib/*`
  - `@/types/*` → `./types/*`

## File Naming Patterns
- **Components** - PascalCase.tsx
- **Utilities** - camelCase.ts
- **Pages** - lowercase (App Router convention)
- **Types** - camelCase with descriptive suffixes

## Architecture Principles
- **Server Actions** for form handling and data mutations
- **Client Components** only when necessary (user state, interactivity)
- **Separation of concerns** - UI, business logic, data access
- **Type safety** - Zod validation at boundaries
- **Error handling** - Graceful degradation with user feedback