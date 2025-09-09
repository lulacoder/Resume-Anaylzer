'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Clock, CheckCircle } from 'lucide-react';

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/90 to-purple-700/90"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main CTA */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 rounded-full p-4">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Land Your
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Dream Job?
            </span>
          </h2>

          <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
            Transform your job search with AI-powered resume analysis. 
            Get detailed feedback and improve your chances of landing interviews.
          </p>
        </div>

        {/* Benefits List */}
        <div className={`grid md:grid-cols-3 gap-6 mb-10 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-3 text-white">
            <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
            <span className="text-lg">Free to get started</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white">
            <Clock className="w-6 h-6 text-blue-300 flex-shrink-0" />
            <span className="text-lg">Results in 30 seconds</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white">
            <Sparkles className="w-6 h-6 text-purple-300 flex-shrink-0" />
            <span className="text-lg">AI-powered insights</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link href="/auth/signup">
            <Button 
              size="lg" 
              className="group bg-white text-blue-600 hover:bg-gray-100 px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-0"
            >
              Start Free Analysis
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button 
              variant="outline" 
              size="lg"
              className="px-10 py-5 text-xl font-bold border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Trust Indicator */}
        <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-blue-200 text-sm">
            ✨ No credit card required • 🔒 100% secure • 🚀 Instant results
          </p>
        </div>
      </div>
    </section>
  );
}