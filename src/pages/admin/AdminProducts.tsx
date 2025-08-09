import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import ProductForm from '../../components/Admin/ProductForm';
import { Product } from '../../types';
import { apiGet, apiDelete, apiPut, getAuthHeaders, API_CONFIG } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatPreparationTime } from '../../utils/timeUtils';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const { auth } = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      fetchProducts();
    }
  }, [auth.isAuthenticated, auth.token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
  
      if (!auth.token) {
        console.error('No token available');
        return;
      }
      const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, {
        headers: getAuthHeaders(auth.token)
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await apiDelete(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_DETAIL(productId.toString()), {
        headers: getAuthHeaders(auth.token!)
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleAvailability = async (productId: number, currentStatus: boolean) => {
    try {
      const response = await apiPut(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_AVAILABILITY(productId.toString()), {}, {
        headers: getAuthHeaders(auth.token!)
      });

      if (response.ok) {
        toast.success(`Product ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
        fetchProducts();
      } else {
        toast.error('Failed to update product availability');
      }
    } catch (error) {
      console.error('Error updating product availability:', error);
      toast.error('Failed to update product availability');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category_name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category_name))];

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                <div className="h-48 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Manage your menu items</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && !filterCategory && (
              <button
                onClick={handleAddProduct}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.product_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.image_path ? `https://hamilton47.pythonanywhere.com/${product.image_path}` : '/logo.png'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/logo.png';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => handleToggleAvailability(product.product_id, product.is_available)}
                      className={`p-2 rounded-full shadow-lg transition-colors ${
                        product.is_available 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                      title={product.is_available ? 'Disable product' : 'Enable product'}
                    >
                      {product.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.is_available 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-600 text-white'
                    }`}>
                      {product.is_available ? 'Available' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600 font-medium">{product.category_name}</span>
                    <span className="text-sm text-gray-500">
                      {formatPreparationTime(product.preparation_time)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      KSh {product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.product_id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setEditingProduct(null);
              fetchProducts();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;