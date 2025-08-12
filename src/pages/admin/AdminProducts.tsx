import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import ProductForm from '../../components/Admin/ProductForm';
import { Product } from '../../types';
import { apiGet, apiDelete, apiPut, getAuthHeaders, API_CONFIG, getImageUrl } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatPreparationTime } from '../../utils/timeUtils';

// Cache for products data
const productsCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { auth } = useAuth();

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = debouncedSearchTerm === '' || 
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === '' || product.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchTerm, filterCategory]);

  // Memoized unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.sort();
  }, [products]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      fetchProducts();
    }
  }, [auth.isAuthenticated, auth.token]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
  
      if (!auth.token) {
        console.error('No token available');
        toast.error('Authentication token missing. Please login again.');
        return;
      }

      // Check cache first
      const now = Date.now();
      if (productsCache.data && (now - productsCache.timestamp) < productsCache.ttl) {
        setProducts(productsCache.data);
        setLoading(false);
        return;
      }

      const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, {
        headers: getAuthHeaders(auth.token)
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        
        // Update cache
        productsCache.data = data;
        productsCache.timestamp = now;
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
        window.location.href = '/admin/login';
      } else if (response.status === 502) {
        toast.error('Backend server is currently unavailable. Please try again later.');
      } else {
        toast.error(`Failed to fetch products: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await apiDelete(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_DETAIL(productId.toString()), {
        headers: getAuthHeaders(auth.token!)
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        // Invalidate cache and refetch
        productsCache.data = null;
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleAvailability = async (productId: number, currentAvailability: boolean) => {
    try {
      const response = await apiPut(
        API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_AVAILABILITY(productId.toString()),
        { available: !currentAvailability },
        { headers: getAuthHeaders(auth.token!) }
      );

      if (response.ok) {
        toast.success(`Product ${currentAvailability ? 'hidden' : 'made available'} successfully`);
        // Invalidate cache and refetch
        productsCache.data = null;
        fetchProducts();
      } else {
        toast.error('Failed to update product availability');
      }
    } catch (error) {
      console.error('Error updating product availability:', error);
      toast.error('Failed to update product availability');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = () => {
    handleFormClose();
    // Invalidate cache and refetch
    productsCache.data = null;
    fetchProducts();
  };

  // Memoized product card component to prevent unnecessary re-renders
  const ProductCard = React.memo(({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/logo.png';
          }}
        />
        <div className="absolute top-2 right-2">
          <button
            onClick={() => handleToggleAvailability(product.id, product.available)}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              product.available 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={product.available ? 'Hide product' : 'Make available'}
          >
            {product.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
            {product.name}
          </h3>
          <span className="text-lg font-bold text-red-600">
            ${product.price}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
          <span>{formatPreparationTime(product.preparation_time)}</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleEditProduct(product)}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  ));

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">Manage your menu items</p>
            </div>
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Product
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-300 rounded flex-1"></div>
                    <div className="h-8 bg-gray-300 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your menu items</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Product
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && !filterCategory && (
              <button
                onClick={handleAddProduct}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-white rounded-lg shadow-xl">
              <ProductForm
                product={editingProduct}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;