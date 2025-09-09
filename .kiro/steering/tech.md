# Technology Stack & Build System

## Framework & Runtime
- **Next.js 15.3.5** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.8.3** - Type safety and development experience
- **Node.js** - Runtime environment

## Styling & UI
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **shadcn/ui** - Component library (New York style)
- **Lucide React** - Icon library
- **Class Variance Authority (CVA)** - Component variant management

## Backend & Database
- **Supabase** - Backend-as-a-Service
  - Authentication (email/password)
  - PostgreSQL database
  - File storage for PDF uploads
- **Server Actions** - Next.js server-side form handling

## AI & Processing
- **Google Gemini AI** - Resume analysis (gemini-2.5-flash-preview-04-17)
- **PDF.js** - PDF text extraction
- **Zod** - Schema validation and type safety

## Development Tools
- **ESLint** - Code linting with Next.js config
- **PostCSS** - CSS processing
- **TypeScript paths** - Import aliases (@/components, @/lib, @/types)

## Common Commands

### Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Setup
- Copy `.env.local.example` to `.env.local`
- Configure Supabase URL, anon key, and Gemini API key
- Follow SETUP.md for Supabase storage bucket configuration

## Configuration Notes
- Server actions body size limit: 10MB (for PDF uploads)
- PDF file size recommended: < 5MB
- Storage bucket: `resumes` (private, user-scoped folders)