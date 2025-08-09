import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { apiGet } from '../../config/api';

interface TodaysSpecial {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  is_active: boolean;
}

const TodaysSpecialsDisplay: React.FC = () => {
  const [specials, setSpecials] = useState<TodaysSpecial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecials();
  }, []);

  const fetchSpecials = async () => {
    try {
      const response = await apiGet('/api/todays-specials');
      if (response.ok) {
        const data = await response.json();
        setSpecials(data.filter((special: TodaysSpecial) => special.is_active));
      }
    } catch (error) {
      console.error('Error fetching specials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (specials.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chef's Special</h3>
          <p className="text-gray-600 mb-4">Check back soon for today's special dishes!</p>
          <Link 
            to="/admin/specials" 
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Star className="w-4 h-4" />
            View Specials
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {specials.map((special) => (
        <div key={special.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
          {/* Image */}
          <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            {special.image_url ? (
              <img 
                src={special.image_url} 
                alt={special.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl">🍽️</div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{special.title}</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Star className="w-3 h-3 mr-1" />
                  {special.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  KSh {special.price.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{special.description}</p>

            <Link 
              to={`/products?category=${special.category.toLowerCase()}`}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Order Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodaysSpecialsDisplay;




