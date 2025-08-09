import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { Category } from '../../types';
import { API_CONFIG, apiGet } from '../../config/api';
import { toast } from 'react-hot-toast';
import { minutesToTime, timeToMinutes } from '../../utils/timeUtils';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    ingredients: '',
    preparation_hours: '0',
    preparation_minutes: '30'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
    if (product) {
      const { hours, minutes } = minutesToTime(product.preparation_time);
      
      setFormData({
        name: product.name,
        category_id: product.category_id.toString(),
        price: product.price.toString(),
        description: product.description,
        ingredients: product.ingredients || '',
        preparation_hours: hours.toString(),
        preparation_minutes: minutes.toString()
      });
      if (product.image_path) {
        setImagePreview(`${API_CONFIG.BASE_URL}/${product.image_path}`);
      }
    }
  }, [product]);

  useEffect(() => {

  }, [categories]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
  
      const response = await apiGet(API_CONFIG.ENDPOINTS.CATEGORIES);
      
      
      if (response.ok) {
        const data = await response.json();
        
        setCategories(data);
      } else {

        toast.error('Failed to load categories. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Network error loading categories. Please check your connection.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const clearImage = () => {
    setImagePreview('');
    setImageFile(null);
    // Clear the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    
    if (file) {
      
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      // Set the new image file
      setImageFile(file);
      
      
      // Create preview from the new file
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        
      };
      reader.readAsDataURL(file);
      
      // Clear any existing image preview from backend
      if (product && product.image_path) {
        // The new uploaded image will replace the existing one
        
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id || !formData.price || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!product && !imageFile) {
      toast.error('Please select an image for the product');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category_id', formData.category_id);
      submitData.append('price', formData.price);
      submitData.append('description', formData.description);
      submitData.append('ingredients', formData.ingredients);
      
      // Convert hours and minutes to total minutes
      const hours = parseInt(formData.preparation_hours) || 0;
      const minutes = parseInt(formData.preparation_minutes) || 0;
      const totalMinutes = timeToMinutes(hours, minutes);
      submitData.append('preparation_time', totalMinutes.toString());
      
      // Add image if a new one was uploaded
      if (imageFile) {
        submitData.append('image', imageFile);

      } else if (!product) {
        // For new products, image is required
        toast.error('Please select an image for the product');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('adminToken');
      const url = product 
        ? API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_DETAIL(product.product_id.toString())
        : API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS;
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (response.ok) {
        toast.success(`Product ${product ? 'updated' : 'created'} successfully!`);
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${product ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image {!product && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {imageFile && (
                    <div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded">
                      New
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{imagePreview ? 'Change Image' : 'Choose Image'}</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB. Formats: JPEG, PNG, WebP
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categoriesLoading ? (
                  <option value="" disabled>Loading categories...</option>
                ) : categories.length > 0 ? (
                  categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No categories found</option>
                )}
              </select>
              {!categoriesLoading && categories.length === 0 && (
                <button
                  type="button"
                  onClick={fetchCategories}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Retry loading categories
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (KSh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preparation Time
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="preparation_hours"
                  value={formData.preparation_hours}
                  onChange={handleInputChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Hrs"
                  min="0"
                />
                <span>:</span>
                <input
                  type="number"
                  name="preparation_minutes"
                  value={formData.preparation_minutes}
                  onChange={handleInputChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Min"
                  min="0"
                  max="59"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Describe your product..."
              required
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients
            </label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="List the main ingredients..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{product ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{product ? 'Update Product' : 'Create Product'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;