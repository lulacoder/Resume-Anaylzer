'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Sparkles, Star } from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-gradient-warm"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-rose/15 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
      
      {/* Floating decorative shapes */}
      <div className="absolute top-32 left-[15%] w-4 h-4 rounded-full bg-primary/40 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-48 right-[20%] w-3 h-3 rounded-full bg-accent/50 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-[25%] w-5 h-5 rounded-full bg-rose/30 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-primary text-sm font-medium mb-8 shadow-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Resume Analysis
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-xs">New</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.1] mb-6">
              Land Your Dream Job with a{' '}
              <span className="text-gradient-coral">Perfect Resume</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Get instant, AI-powered feedback on your resume. Optimize for any job description and increase your interview chances by up to 3x.
            </p>
            
            {/* Feature bullets */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-10">
              {['Free to get started', 'Results in 30 seconds', 'No credit card required'].map((feature, i) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-14 rounded-xl font-semibold group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-14 rounded-xl font-semibold hover:bg-secondary">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            {/* Social proof */}
            <div className="flex items-center gap-6 pt-8 border-t border-border/50">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 border-2 border-background flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                  <span className="text-sm font-semibold text-foreground ml-1">4.9</span>
                </div>
                <p className="text-sm text-muted-foreground">Loved by 50,000+ job seekers</p>
              </div>
            </div>
          </div>
          
          {/* Right Content - Visual */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              {/* Main card - Abstract resume illustration */}
              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl shadow-2xl shadow-primary/10 p-8 sm:p-10">
                {/* Resume document visual */}
                <div className="space-y-6">
                  {/* Header section */}
                  <div className="flex items-center gap-4">
                    <LogoIcon size={56} />
                    <div className="flex-1">
                      <div className="h-4 bg-foreground/15 rounded-lg w-2/3 mb-2"></div>
                      <div className="h-3 bg-foreground/10 rounded-lg w-1/3"></div>
                    </div>
                  </div>
                  
                  {/* Content lines - mimicking resume sections */}
                  <div className="space-y-4 pt-4 border-t border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="h-3 bg-foreground/10 rounded w-full"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <div className="h-3 bg-foreground/10 rounded w-4/5"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      <div className="h-3 bg-foreground/10 rounded w-5/6"></div>
                    </div>
                  </div>
                  
                  {/* Skills section */}
                  <div className="space-y-3 pt-4 border-t border-border/30">
                    <div className="h-3 bg-foreground/8 rounded w-1/4 mb-3"></div>
                    <div className="flex flex-wrap gap-2">
                      {['Skills', 'Experience', 'Education', 'Projects'].map((tag) => (
                        <div key={tag} className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                          <div className="h-2 w-12 bg-primary/30 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Bottom section */}
                  <div className="space-y-2 pt-4 border-t border-border/30">
                    <div className="h-3 bg-foreground/8 rounded w-full"></div>
                    <div className="h-3 bg-foreground/6 rounded w-3/4"></div>
                    <div className="h-3 bg-foreground/6 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating accent card - AI analysis indicator */}
              <div className={`absolute -top-4 -right-4 bg-gradient-to-r from-primary to-accent text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl shadow-primary/30 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: '400ms' }}>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered
                </span>
              </div>
              
              <div className={`absolute -bottom-3 -left-3 bg-card border border-border/50 px-4 py-3 rounded-2xl shadow-xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Instant Analysis</div>
                    <div className="text-sm font-semibold text-foreground">Ready in 30 seconds</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
