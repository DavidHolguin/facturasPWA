import React, { useState, useEffect } from 'react';
import { Plus, Grid, List, Search, Edit, Trash2, X, Camera, Package } from 'lucide-react';

const ProductManagement = ({ darkMode }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_weight_based: false,
    base_weight: '',
    weight_unit: 'g',
    image: null
  });

  useEffect(() => {
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      setSelectedCompany(JSON.parse(savedCompany));
    }
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchProducts();
      fetchCategories();
    }
  }, [selectedCompany]);

  const fetchProducts = async () => {
    if (!selectedCompany) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/products/?company=${selectedCompany.id}`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError('Error fetching products: ' + error.message);
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/categories/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError('Error fetching categories: ' + error.message);
      console.error('Error fetching categories:', error);
    }
  };

  const validateProductData = (productData) => {
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      throw new Error('Please fill in all required fields');
    }
    if (productData.is_weight_based && (!productData.base_weight || !productData.weight_unit)) {
      throw new Error('Please fill in all weight-based fields');
    }
    if (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
      throw new Error('Please enter a valid price');
    }
    if (productData.is_weight_based && (isNaN(parseFloat(productData.base_weight)) || parseFloat(productData.base_weight) <= 0)) {
      throw new Error('Please enter a valid base weight');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setError(null);
    setIsLoading(true);

    try {
      validateProductData(newProduct);

      const formData = new FormData();
      Object.keys(newProduct).forEach(key => {
        if (newProduct[key] !== null && newProduct[key] !== undefined) {
          formData.append(key, newProduct[key]);
        }
      });
      formData.append('company', selectedCompany.id);

      const response = await fetch('https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/products/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      await fetchProducts();
      setIsNewProductDialogOpen(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        is_weight_based: false,
        base_weight: '',
        weight_unit: 'g',
        image: null
      });
    } catch (error) {
      setError(error.message);
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/products/${productId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchProducts();
    } catch (error) {
      setError('Error deleting product: ' + error.message);
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (!selectedCompany) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Package size={48} className="mb-4 text-gray-400 dark:text-gray-600" />
        <h2 className="text-xl font-semibold mb-2">Select a Company</h2>
        <p className="text-gray-500 dark:text-gray-400">Please select a company to manage its products</p>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 max-w-7xl mx-auto ${darkMode ? 'dark' : ''}`}>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="float-right">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col space-y-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Product Management
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white dark:border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Select */}
          <select
            className="w-full md:w-[180px] px-4 py-2 border rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white dark:border-gray-700"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-1">
            <button
              className={`p-2 rounded-lg ${viewMode === 'grid' 
                ? 'bg-red-600 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={20} />
            </button>
            <button
              className={`p-2 rounded-lg ${viewMode === 'list' 
                ? 'bg-red-600 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Product Button */}
      <button
        className="mb-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center md:justify-start disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setIsNewProductDialogOpen(true)}
        disabled={isLoading}
      >
        <Plus size={20} />
        Add New Product
      </button>

      {/* New Product Modal */}
      {isNewProductDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-white">Add New Product</h2>
                <button
                  onClick={() => setIsNewProductDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} className="dark:text-white" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-white">Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-white">Description</label>
                    <textarea
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-1 dark:text-white">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-1 dark:text-white">Category</label>
                    <select
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Weight-based pricing section */}
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 dark:text-white">
                      <input
                        type="checkbox"
                        className="rounded text-red-600 focus:ring-red-500"
                        checked={newProduct.is_weight_based}
                        onChange={(e) => setNewProduct({...newProduct, is_weight_based: e.target.checked})}
                      />
                      <span className="text-sm font-medium">Weight-based pricing</span>
                    </label>
                  </div>
                  
                  {newProduct.is_weight_based && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Base Weight</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          value={newProduct.base_weight}
                          onChange={(e) => setNewProduct({...newProduct, base_weight: e.target.value})}
                          required={newProduct.is_weight_based}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Weight Unit</label>
                        <select
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          value={newProduct.weight_unit}
                          onChange={(e) => setNewProduct({...newProduct, weight_unit: e.target.value})}
                          required={newProduct.is_weight_based}
                        >
                          <option value="g">Grams (g)</option>
                          <option value="kg">Kilograms (kg)</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-white">Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})}
                      className="w-full dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNewProductDialogOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !isNewProductDialogOpen && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Products Grid/List View */}
      {!isLoading && (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          : "space-y-4"
        }>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className={viewMode === 'grid' 
                ? "flex flex-col h-full"
                : "flex items-center gap-4 p-4"
              }>
                {/* Product Image */}
                <div className={viewMode === 'grid' 
                  ? "relative aspect-video" 
                  : "flex-shrink-0 w-24 h-24"
                }>
                  <img
                    src={product.image_url || "/api/placeholder/400/300"}
                    alt={product.name}
                    className={viewMode === 'grid' 
                      ? "w-full h-full object-cover"
                      : "w-24 h-24 object-cover rounded-lg"
                    }
                  />
                </div>

                {/* Product Info */}
                <div className={viewMode === 'grid' 
                  ? "p-4 flex-grow flex flex-col" 
                  : "flex-grow"
                }>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg dark:text-white line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Edit product"
                      >
                        <Edit size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete product"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="text-red-600 dark:text-red-400 font-semibold">
                      {product.formatted_price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {product.category_name}
                    </span>
                  </div>

                  {/* Weight-based Info (if applicable) */}
                  {product.is_weight_based && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Base weight: {product.base_weight} {product.weight_unit}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className={`col-span-full flex flex-col items-center justify-center p-8 text-center 
              ${viewMode === 'grid' ? 'min-h-[200px]' : 'min-h-[100px]'}`}>
              <Package size={32} className="text-gray-400 dark:text-gray-600 mb-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first product'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;