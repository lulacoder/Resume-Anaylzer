import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Resume Analyzer - AI-Powered Resume Analysis',
    short_name: 'Resume Analyzer',
    description: 'Get AI-powered feedback on your resume with detailed analysis, match scoring, and improvement suggestions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}