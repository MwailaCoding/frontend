import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';

interface ProductFiltersProps {
  categories: Category[];
  priceRange: { min: number; max: number };
  onPriceRangeChange: (range: { min: number; max: number }) => void;
  selectedCategory?: string;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  priceRange,
  onPriceRangeChange,
  selectedCategory
}) => {
  const categoryMap: { [key: string]: string } = {
    'cakes': 'Cakes',
    'main-dishes': 'Main Dishes'
  };

  const categoryRoutes = [
    { name: 'All Products', path: '/products', key: '' },
    { name: 'Cakes', path: '/products/cakes', key: 'cakes' },
    { name: 'Main Dishes', path: '/products/main-dishes', key: 'main-dishes' }
  ];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          {categoryRoutes.map((cat) => (
            <Link
              key={cat.key}
              to={cat.path}
              className={`block px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === cat.key || (!selectedCategory && cat.key === '')
                  ? 'bg-green-100 text-green-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price: KSh {priceRange.min.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={priceRange.min}
              onChange={(e) => onPriceRangeChange({
                ...priceRange,
                min: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price: KSh {priceRange.max.toLocaleString()}
            </label>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={priceRange.max}
              onChange={(e) => onPriceRangeChange({
                ...priceRange,
                max: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>KSh {priceRange.min.toLocaleString()}</span>
            <span>-</span>
            <span>KSh {priceRange.max.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h3>
        <div className="space-y-2">
          <button
            onClick={() => onPriceRangeChange({ min: 0, max: 1000 })}
            className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Under KSh 1,000
          </button>
          <button
            onClick={() => onPriceRangeChange({ min: 1000, max: 3000 })}
            className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            KSh 1,000 - 3,000
          </button>
          <button
            onClick={() => onPriceRangeChange({ min: 3000, max: 10000 })}
            className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Above KSh 3,000
          </button>
        </div>
      </div>

      {/* Popular Tags */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular</h3>
        <div className="flex flex-wrap gap-2">
          {['Vegetarian', 'Spicy', 'Traditional', 'Sweet', 'Healthy'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-green-100 hover:text-green-800 cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;