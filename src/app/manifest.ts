import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Resume Analyzer - AI-Powered Resume Analysis',
    short_name: 'Resume Analyzer',
    description: 'Get AI-powered feedback on your resume with detailed analysis, match scoring, and improvement suggestions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#10B981',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}