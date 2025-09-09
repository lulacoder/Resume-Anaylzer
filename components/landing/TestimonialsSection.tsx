'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Alex M.',
    role: 'Software Engineer',
    company: 'Tech Company',
    image: '/avatars/alex.jpg',
    rating: 5,
    content: 'The AI analysis helped me identify areas for improvement I hadn\'t considered. The feedback was detailed and actionable.',
    metrics: {
      interviews: 'More',
      offers: 'Better',
      timeToHire: 'Faster'
    }
  },
  {
    id: 2,
    name: 'Jordan S.',
    role: 'Product Manager',
    company: 'Growing Startup',
    image: '/avatars/jordan.jpg',
    rating: 5,
    content: 'The skill analysis feature provided valuable insights into how to better position my experience for the roles I was targeting.',
    metrics: {
      interviews: 'Quality',
      offers: 'Relevant',
      timeToHire: 'Efficient'
    }
  },
  {
    id: 3,
    name: 'Taylor R.',
    role: 'Data Analyst',
    company: 'Analytics Firm',
    image: '/avatars/taylor.jpg',
    rating: 5,
    content: 'The detailed feedback helped me understand how to better showcase my technical skills and project experience.',
    metrics: {
      interviews: 'Targeted',
      offers: 'Improved',
      timeToHire: 'Streamlined'
    }
  }
];

const stats = [
  { label: 'AI-Powered', value: 'Analysis' },
  { label: 'Instant', value: 'Feedback' },
  { label: 'Detailed', value: 'Insights' },
  { label: 'Secure', value: 'Platform' }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            See how our AI-powered resume analysis has helped job seekers improve their applications
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 md:p-12">
            <Quote className="h-8 w-8 text-blue-500 mb-6" />
            
            <blockquote className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 leading-relaxed mb-8">
              &quot;{currentTestimonial.content}&quot;
            </blockquote>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {currentTestimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentTestimonial.role} at {currentTestimonial.company}
                  </div>
                  <div className="flex items-center mt-1">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {currentTestimonial.metrics.interviews}
                  </div>
                  <div>Interviews</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {currentTestimonial.metrics.offers}
                  </div>
                  <div>Job Offers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {currentTestimonial.metrics.timeToHire}
                  </div>
                  <div>Process</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}