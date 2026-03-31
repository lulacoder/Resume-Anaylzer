'use client';

import { useState, useEffect, useRef } from 'react';
import { Target, Zap, BarChart3, Shield, FileCheck, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Job Match Scoring',
    description: 'Get a precise match score showing how well your resume aligns with specific job requirements.',
  },
  {
    icon: Zap,
    title: 'Instant Analysis',
    description: 'Receive comprehensive feedback in under 30 seconds with our advanced AI processing.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Metrics',
    description: 'Track your resume performance across skills, experience, keywords, and formatting.',
  },
  {
    icon: FileCheck,
    title: 'ATS Optimization',
    description: 'Ensure your resume passes Applicant Tracking Systems with keyword optimization.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data is encrypted and never shared. Full control over your information.',
  },
  {
    icon: TrendingUp,
    title: 'Actionable Insights',
    description: 'Receive prioritized recommendations to improve your resume and boost interview chances.',
  },
];

export default function FeaturesSection() {
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
    <section id="features" ref={sectionRef} className="section-padding bg-muted/30">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Perfect Your Resume
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI-powered platform provides comprehensive analysis and actionable recommendations to help you stand out to employers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`
                feature-card
                transition-all duration-500
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`
          mt-16 text-center transition-all duration-700 delay-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <p className="text-muted-foreground mb-4">
            Ready to see how your resume scores?
          </p>
          <a 
            href="/auth/signup" 
            className="inline-flex items-center text-primary font-medium hover:underline"
          >
            Start your free analysis
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
