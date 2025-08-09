import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  category: string;
  ctaText: string;
  ctaLink: string;
}

const FoodCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselItems: CarouselItem[] = [
    {
      id: 1,
      title: "Traditional Kenyan Delights",
      subtitle: "Heritage Flavors",
      description: "Savor the authentic taste of Kenya's most beloved traditional dishes",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop",
      category: "Traditional",
      ctaText: "Discover Heritage",
      ctaLink: "/products?category=traditional"
    },
    {
      id: 2,
      title: "Artisan Cakes & Pastries",
      subtitle: "Sweet Creations",
      description: "Handcrafted cakes and pastries made with love and premium ingredients",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=500&fit=crop",
      category: "Cakes",
      ctaText: "Explore Cakes",
      ctaLink: "/products?category=cakes"
    },
    {
      id: 3,
      title: "Fresh Chapati & Ugali",
      subtitle: "Daily Staples",
      description: "Freshly made chapati and ugali, the heart of Kenyan cuisine",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop",
      category: "Staples",
      ctaText: "Order Now",
      ctaLink: "/products?category=staples"
    },
    {
      id: 4,
      title: "Rice & Pilau Specials",
      subtitle: "Grain Delights",
      description: "Aromatic rice dishes and flavorful pilau that will transport you to Kenya",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop",
      category: "Rice",
      ctaText: "Try Pilau",
      ctaLink: "/products?category=rice"
    },
    {
      id: 5,
      title: "Today's Special",
      subtitle: "Chef's Pick",
      description: "Discover our chef's specially curated dish of the day",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=500&fit=crop",
      category: "Special",
      ctaText: "View Special",
      ctaLink: "/products?category=special"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl shadow-2xl">
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        {carouselItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${item.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 via-red-800/70 to-orange-800/60"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-6">
                <div className="max-w-2xl">
                  {/* Category Tag */}
                  <div className="inline-flex items-center space-x-2 bg-amber-100/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6">
                    <span className="text-2xl">🍽️</span>
                    <span className="text-amber-900 font-medium text-sm">{item.subtitle}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    {item.title.split(' ').map((word, i) => (
                      <span key={i} className={i > 0 ? 'ml-4' : ''}>
                        {word}
                      </span>
                    ))}
                  </h1>

                  {/* Description */}
                  <p className="text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
                    {item.description}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => window.location.href = item.ctaLink}
                      className="inline-flex items-center space-x-3 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <span>🛒</span>
                      <span>{item.ctaText}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <button className="inline-flex items-center space-x-3 bg-red-800/80 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <Play className="w-5 h-5" />
                      <span>Watch Story</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FoodCarousel;