'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, FileText, Target } from 'lucide-react';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-float">
          <FileText className="w-8 h-8 text-blue-400/30" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-delayed">
          <Target className="w-6 h-6 text-indigo-400/30" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-float-slow">
          <Sparkles className="w-7 h-7 text-purple-400/30" />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headline */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Get{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            Resume Feedback
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-600 dark:text-gray-300">
              in Seconds
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your resume, paste any job description, and get instant, detailed feedback 
            to maximize your chances of landing your dream job.
          </p>
        </div>

        {/* Key Benefits */}
        <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm sm:text-base">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Target className="w-5 h-5 text-indigo-500" />
              <span>Job Match Scoring</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>Detailed Feedback</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Analyzing Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Trusted by job seekers worldwide
            </p>
            <div className="flex justify-center items-center gap-8 text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">AI-Powered</div>
                <div className="text-xs">Analysis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">Instant</div>
                <div className="text-xs">Results</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Secure</div>
                <div className="text-xs">& Private</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}