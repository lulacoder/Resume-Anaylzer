# Resume Analyzer

An AI-powered web application that analyzes resumes against job descriptions to provide detailed feedback, match scoring, and improvement suggestions.

## Features

- **AI-Powered Analysis**: Uses Google Gemini AI for comprehensive resume evaluation
- **Job Matching**: Compare resumes against specific job titles and descriptions
- **Detailed Feedback**: Get professional summaries, strengths, areas for improvement, and extracted skills
- **Match Scoring**: Receive a 0-100% compatibility score
- **Secure Authentication**: Email-based login with Supabase
- **Data Persistence**: Store and retrieve past analyses
- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **AI**: Google Gemini AI (gemini-2.5-flash-preview-04-17)
- **PDF Processing**: PDF.js for text extraction
- **Charts**: Recharts for data visualization
- **UI Components**: shadcn/ui with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm or yarn
- Supabase account
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Set up Supabase:
   - Follow the instructions in `SETUP.md` for database setup
   - Configure the storage bucket for resume uploads
   - Set up Row Level Security (RLS) policies

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run type-check` - Check TypeScript types
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container
- `npm run docker:compose` - Run with Docker Compose

## Project Structure

```
├── src/app/                 # Next.js App Router pages
├── components/              # Reusable React components
├── lib/                     # Utility functions and configurations
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
├── __tests__/               # Test files
└── .kiro/                   # Kiro AI assistant configuration
```

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions including:
- Vercel deployment (recommended)
- Docker deployment
- Traditional server deployment
- Environment configuration
- Performance optimizations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the troubleshooting section in `DEPLOYMENT.md`
- Open an issue on GitHub
