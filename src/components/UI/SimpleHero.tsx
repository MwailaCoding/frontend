import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Play, ArrowRight, Sparkles } from 'lucide-react';


interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  category: string;
  cta: string;
  color: string;
}

interface SimpleHeroProps {
  slides: HeroSlide[];
}

const SimpleHero: React.FC<SimpleHeroProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);



  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[60vh] overflow-hidden">

      {/* Simple background with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].color} opacity-90`}></div>
      
      {/* Simple overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Hero Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                {slides[currentSlide].subtitle}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {slides[currentSlide].title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
              {slides[currentSlide].description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-base hover:bg-gray-100 transition-colors shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                {slides[currentSlide].cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-base hover:bg-white/30 transition-colors border border-white/30">
                <Play className="w-5 h-5" />
                Watch Story
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default SimpleHero; 