import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { PerformanceProvider } from '@/components/PerformanceProvider';
import { OptimizedPageTransition } from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Resume Analyzer - AI-Powered Resume Analysis',
    template: '%s | Resume Analyzer'
  },
  description: 'Get AI-powered feedback on your resume with detailed analysis, match scoring, and improvement suggestions. Optimize your resume for specific job descriptions.',
  keywords: ['resume analyzer', 'AI resume review', 'job matching', 'career optimization', 'resume feedback'],
  authors: [{ name: 'Resume Analyzer Team' }],
  creator: 'Resume Analyzer',
  publisher: 'Resume Analyzer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://resume-analyzer.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://resume-analyzer.vercel.app',
    title: 'Resume Analyzer - AI-Powered Resume Analysis',
    description: 'Get AI-powered feedback on your resume with detailed analysis, match scoring, and improvement suggestions.',
    siteName: 'Resume Analyzer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Analyzer - AI-Powered Resume Analysis',
    description: 'Get AI-powered feedback on your resume with detailed analysis, match scoring, and improvement suggestions.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PerformanceProvider>
          <Navbar />
          <main>
            <OptimizedPageTransition>
              {children}
            </OptimizedPageTransition>
          </main>
        </PerformanceProvider>
      </body>
    </html>
  );
}