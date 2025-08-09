import { useState } from 'react';
import { Heart, Star, ShoppingCart, Eye, Share2, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { API_CONFIG } from '../../config/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_path: string;
  category_name: string;
  description?: string;
  rating?: number;
  is_popular?: boolean;
  is_new?: boolean;
  discount?: number;
}

interface SimpleProductCardProps {
  product: Product;
  className?: string;
}

const SimpleProductCard: React.FC<SimpleProductCardProps> = ({
  product,
  className = ''
}) => {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();



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

  const handleAddToCart = () => {
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.discount 
        ? product.price * (1 - product.discount / 100)
        : product.price,
      image_path: product.image_path,
      quantity: 1
    });
    
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        background: '#10B981',
        color: 'white',
      },
    });
  };

  const handleBuyNow = () => {
    // Add the item to cart first
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.discount 
        ? product.price * (1 - product.discount / 100)
        : product.price,
      image_path: product.image_path,
      quantity: 1
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

  const handleQuickView = () => {
    // Show product details in a toast notification
    toast.success(
      <div className="text-left">
        <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
        <p className="text-gray-600 mb-2">{product.description || 'No description available'}</p>
        <div className="flex items-center justify-between">
          <span className="text-green-600 font-bold">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500">{product.category_name}</span>
        </div>
      </div>,
      {
        duration: 4000,
        icon: '👁️',
        style: {
          background: '#10B981',
          color: 'white',
        },
      }
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} - ${formatPrice(product.price)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!', {
          icon: '📤',
        });
      } else {
        // Fallback: copy to clipboard
        const shareText = `${product.name} - ${formatPrice(product.price)}\n${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Product link copied to clipboard!', {
          icon: '📋',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share product', {
        icon: '❌',
      });
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast.success(
      isLiked ? 'Removed from favorites' : 'Added to favorites!',
      {
        icon: isLiked ? '💔' : '❤️',
        style: {
          background: isLiked ? '#EF4444' : '#F59E0B',
          color: 'white',
        },
      }
    );
  };

  // Construct image URL the same way as ProductCard
  const imageUrl = product.image_path 
    ? `${API_CONFIG.BASE_URL}/${product.image_path}`
    : 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <div className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
            Fresh
          </span>
          {product.is_new && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
              NEW
            </span>
          )}
          {product.is_popular && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
              POPULAR
            </span>
          )}
          {product.discount && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={toggleLike}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleQuickView}
            className="p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-blue-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-green-500 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
            {product.category_name}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.discount ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {getOriginalPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-green-600">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </button>
            
            <button
              onClick={handleBuyNow}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-colors text-sm"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleProductCard; 