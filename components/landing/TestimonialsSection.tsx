'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Quote, Star } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    content: "The resume analyzer helped me identify gaps I didn't even know existed. After making the suggested changes, I started getting callbacks from top tech companies within a week.",
    rating: 5,
  },
  {
    name: 'Michael Torres',
    role: 'Product Manager at Meta',
    content: "I've used many resume review services, but this AI-powered tool gave me the most actionable and specific feedback. It literally helped me land my dream job.",
    rating: 5,
  },
  {
    name: 'Emily Johnson',
    role: 'Marketing Director',
    content: "The match scoring feature is brilliant. I could see exactly which keywords I was missing and tailor my resume for each application. Highly recommend!",
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'Data Scientist at Amazon',
    content: "The instant feedback saved me hours of manual review. The ATS optimization tips were particularly valuable - my applications finally started getting through.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
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

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  // Auto-advance
  useEffect(() => {
    if (!api) return;
    const timer = setInterval(() => {
      api.scrollNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [api]);

  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by Job Seekers Everywhere
          </h2>
          <p className="text-lg text-muted-foreground">
            See how our resume analyzer has helped thousands land their dream jobs.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className={`
          max-w-4xl mx-auto transition-all duration-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 relative">
                    {/* Quote icon */}
                    <Quote className="w-12 h-12 text-primary/20 absolute top-8 left-8" />
                    
                    {/* Testimonial content */}
                    <div className="relative z-10">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                        ))}
                      </div>
                      
                      {/* Quote */}
                      <blockquote className="text-xl sm:text-2xl text-foreground leading-relaxed mb-8">
                        &ldquo;{testimonial.content}&rdquo;
                      </blockquote>
                      
                      {/* Author */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
          </Carousel>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${index === current ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-muted-foreground'}
                `}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
