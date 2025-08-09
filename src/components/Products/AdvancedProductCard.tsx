import { useState } from 'react';
import { Heart, Star, ShoppingCart, Eye, Share2, Clock, Flame, Crown } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description?: string;
  rating?: number;
  is_popular?: boolean;
  is_new?: boolean;
  discount?: number;
  prep_time?: string;
  spice_level?: 'mild' | 'medium' | 'hot' | 'extra-hot';
  is_vegetarian?: boolean;
  calories?: number;
}

interface AdvancedProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onShare?: (product: Product) => void;
  className?: string;
}

const AdvancedProductCard: React.FC<AdvancedProductCardProps> = ({
  product,
  onQuickView,
  onShare,
  className = ''
}) => {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price: number) => {
    const discountedPrice = product.discount 
      ? price * (1 - product.discount / 100) 
      : price;
    
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(discountedPrice);
  };

  const getOriginalPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSpiceLevelColor = (level?: string) => {
    switch (level) {
      case 'mild': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hot': return 'text-orange-500';
      case 'extra-hot': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const handleAddToCart = () => {
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.discount 
        ? product.price * (1 - product.discount / 100)
        : product.price,
      image_url: product.image_url,
      quantity: 1
    });
  };

  const handleQuickView = () => {
    onQuickView?.(product);
  };

  const handleShare = () => {
    onShare?.(product);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div 
      className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <div className="aspect-square relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
          <img
            src={product.image_url || '/api/placeholder/400/400'}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Overlay on Hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_new && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
              <Star className="w-3 h-3" />
              NEW
            </span>
          )}
          {product.is_popular && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
              <Flame className="w-3 h-3" />
              POPULAR
            </span>
          )}
          {product.discount && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
              -{product.discount}% OFF
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={toggleLike}
            className={`p-2 backdrop-blur-sm rounded-full border transition-all duration-300 ${
              isLiked
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-white/90 border-white/20 text-gray-600 hover:bg-red-500 hover:text-white'
            } ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleQuickView}
            className={`p-2 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full text-gray-600 hover:bg-blue-500 hover:text-white transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleShare}
            className={`p-2 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full text-gray-600 hover:bg-green-500 hover:text-white transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add Button - Appears on Hover */}
        <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <button
            onClick={handleAddToCart}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg backdrop-blur-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category and Rating */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-lg">
            {product.category}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Additional Info */}
        <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {product.prep_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{product.prep_time}</span>
              </div>
            )}
            {product.spice_level && (
              <div className="flex items-center gap-1">
                <Flame className={`w-3 h-3 ${getSpiceLevelColor(product.spice_level)}`} />
                <span className={getSpiceLevelColor(product.spice_level)}>
                  {product.spice_level}
                </span>
              </div>
            )}
            {product.is_vegetarian && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-green-600">Veg</span>
              </div>
            )}
          </div>
          {product.calories && (
            <span className="text-gray-400">{product.calories} cal</span>
          )}
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.discount && (
              <span className="text-lg text-gray-400 line-through">
                {getOriginalPrice(product.price)}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all hover:scale-105 shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Premium Badge for High-End Items */}
      {product.price > 1000 && (
        <div className="absolute top-2 left-2">
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold rounded-full shadow-lg">
            <Crown className="w-3 h-3" />
            PREMIUM
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedProductCard;