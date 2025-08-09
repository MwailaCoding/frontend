import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Clock, Star, Eye, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../../contexts/CartContext';
import Card3D from '../UI/Card3D';
import GlowingButton from '../UI/GlowingButton';
import { Product } from '../../types';
import { API_CONFIG } from '../../config/api';
import { formatPreparationTime } from '../../utils/timeUtils';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image_path: product.image_path
    });
    
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        background: '#10B981',
        color: 'white',
      },
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites!', {
      icon: isLiked ? '💔' : '❤️',
    });
  };

  const handleAddToCartWrapper = () => {
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image_path: product.image_path
    });
    
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        background: '#10B981',
        color: 'white',
      },
    });
  };

  const handleLikeWrapper = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites!', {
      icon: isLiked ? '💔' : '❤️',
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add the item to cart first
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image_path: product.image_path
    });

    // Navigate directly to checkout
    navigate('/checkout');
    
    toast.success(`${product.name} added to cart and proceeding to checkout!`, {
      icon: '🛒',
      style: {
        background: '#10B981',
        color: 'white',
      },
    });
  };

  const handleBuyNowWrapper = () => {
    // Add the item to cart first
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image_path: product.image_path
    });

    // Navigate directly to checkout
    navigate('/checkout');
    
    toast.success(`${product.name} added to cart and proceeding to checkout!`, {
      icon: '🛒',
      style: {
        background: '#10B981',
        color: 'white',
      },
    });
  };

  const imageUrl = product.image_path 
                  ? `${API_CONFIG.BASE_URL}/${product.image_path}`
    : 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';

  // Debug logging
  

  if (viewMode === 'list') {
    return (
      <Link to={`/product/${product.product_id}`}>
        <Card3D className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover-lift">
          <div className="flex">
            <div className="w-48 h-32 flex-shrink-0 relative overflow-hidden">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              <div className="absolute top-2 left-2">
                <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                  Fresh
                </span>
              </div>
            </div>
            
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-600 font-medium">
                  {product.category_name}
                </span>
                <div className="flex items-center space-x-1 text-orange-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {formatPreparationTime(product.preparation_time)}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>

              <p className="text-gray-600 text-sm mb-4 overflow-hidden">
                <span className="block truncate">{product.description}</span>
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-green-600">
                    KSh {product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    + KSh 200 delivery
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      isLiked 
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-bounce' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:animate-pulse'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <GlowingButton
                    variant="secondary"
                    onClick={handleAddToCartWrapper}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </GlowingButton>
                  <GlowingButton
                    variant="primary"
                    onClick={handleBuyNowWrapper}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    <span>Buy Now</span>
                  </GlowingButton>
                </div>
              </div>
            </div>
          </div>
        </Card3D>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.product_id}`}>
      <Card3D
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';
            }}
          />
          
          {/* Overlay with actions */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center space-x-4 transition-all duration-500 ${isHovered ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}>
            <button
              onClick={handleAddToCartWrapper}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-all duration-300 shadow-2xl transform hover:scale-125 animate-bounce-in"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button
              onClick={handleLikeWrapper}
              className={`p-3 rounded-full transition-all duration-300 shadow-2xl transform hover:scale-125 animate-bounce-in ${
                isLiked 
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
              style={{ animationDelay: '0.1s' }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <div className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-full transition-all duration-300 shadow-2xl transform hover:scale-125 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              <Eye className="w-5 h-5" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2">
            <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse shadow-lg">
              Fresh
            </span>
          </div>
          
          <div className="absolute top-2 right-2">
            <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
              <Star className="w-3 h-3 text-yellow-500 fill-current animate-bounce" />
              <span className="text-xs font-semibold">4.8</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-600 font-medium">
              {product.category_name}
            </span>
            <div className="flex items-center space-x-1 text-orange-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {formatPreparationTime(product.preparation_time)}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 overflow-hidden">
            <span className="block truncate">{product.name}</span>
          </h3>

          <p className="text-gray-600 text-sm mb-4 overflow-hidden">
            <span className="block truncate">{product.description}</span>
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-red-600">
                KSh {product.price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">
                Free delivery
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <GlowingButton
                variant="secondary"
                size="sm"
                onClick={handleAddToCartWrapper}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:block">Add</span>
              </GlowingButton>
              <GlowingButton
                variant="primary"
                size="sm"
                onClick={handleBuyNowWrapper}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                <span className="hidden sm:block">Buy</span>
              </GlowingButton>
            </div>
          </div>

          {/* Popularity indicator */}
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex -space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-r from-red-400 to-red-600 border-2 border-white animate-pulse shadow-lg"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 animate-bounce">
              12 people viewing this
            </span>
          </div>
        </div>
      </Card3D>
    </Link>
  );
};

export default ProductCard;
