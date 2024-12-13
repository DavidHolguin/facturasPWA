import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, ListFilter, Grid, ArrowUpDown } from 'lucide-react';

const ProductBadge = ({ product, onAdd }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [weight, setWeight] = useState(500);
  const [finalPrice, setFinalPrice] = useState(0);

  const weightPresets = [1000, 1500, 2000];

  const formatPrice = (price) => {
    return price.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateFinalPrice = (basePrice, selectedWeight, baseWeight) => {
    return (selectedWeight / baseWeight) * basePrice;
  };

  useEffect(() => {
    const calculated = calculateFinalPrice(product.price, weight, product.base_weight);
    setFinalPrice(calculated);
  }, [weight, product.price, product.base_weight]);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col items-center p-3 bg-white/90 dark:bg-gray-800/90 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
      >
        <span className="text-sm font-medium truncate w-full text-center">{product.name}</span>
        <span className="text-sm text-red-600 mt-1">${formatPrice(product.price)}</span>
      </div>

      {isExpanded && (
        <div className="absolute z-10 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            {/* Weight control */}
            <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <button 
                onClick={() => setWeight(Math.max(500, weight - 100))}
                className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 text-lg font-bold"
              >
                -
              </button>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Math.max(500, Math.min(2000, parseInt(e.target.value) || 500)))}
                className="flex-1 text-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm font-medium">g</span>
              <button 
                onClick={() => setWeight(Math.min(2000, weight + 100))}
                className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 text-lg font-bold"
              >
                +
              </button>
            </div>

            {/* Weight presets */}
            <div className="grid grid-cols-3 gap-2">
              {weightPresets.map(preset => (
                <button 
                  key={preset}
                  onClick={() => setWeight(preset)}
                  className="py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
                >
                  {preset === 1000 ? '1 Kg' : preset === 1500 ? '1.5 Kg' : '2 Kg'}
                </button>
              ))}
            </div>

            {/* Price display */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <input
                type="text"
                value={`$${formatPrice(finalPrice)}`}
                readOnly
                className="w-full text-center bg-transparent font-bold text-lg text-red-600"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-between space-x-3">
              <button 
                onClick={() => setIsExpanded(false)}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onAdd({
                    ...product,
                    finalPrice: finalPrice,
                    selectedWeight: { weight, unit: 'g' }
                  });
                  setIsExpanded(false);
                }}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductListItem = ({ product, onAdd }) => {
  const formatPrice = (price) => {
    return price.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <img 
        src={product.image_url || '/api/placeholder/100/100'} 
        alt={product.name} 
        className="w-16 h-16 object-cover rounded-lg"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">{product.name}</h3>
          <span className="text-red-600 font-semibold">
            ${formatPrice(product.price)}
          </span>
        </div>
        <button
          onClick={() => onAdd(product)}
          className="mt-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Agregar
        </button>
      </div>
    </div>
  );
};

const ProductSelection = ({ onProductAdd, selectedProducts: parentSelectedProducts, setSelectedProducts: parentSetSelectedProducts }) => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewMode, setViewMode] = useState('badge');

  useEffect(() => {
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      try {
        setSelectedCompany(JSON.parse(savedCompany));
      } catch (e) {
        console.error('Error parsing saved company:', e);
        localStorage.removeItem('selectedCompany');
      }
    }
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchProducts();
      loadRecentProducts();
    }
  }, [selectedCompany]);

  const fetchProducts = async () => {
    if (!selectedCompany) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://facturaspwa-954cb3785e4a.herokuapp.com/api/marketplace/products/?company=${selectedCompany.id}`,
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
        const uniqueCategories = [...new Set(data
          .map(product => product.category)
          .filter(category => category != null)
          .map(String)
        )];
        setCategories(uniqueCategories);
      } else {
        setError('No se encontraron productos para esta compañía');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentProducts = () => {
    if (!selectedCompany) return;
    
    const recent = localStorage.getItem(`recent_products_${selectedCompany.id}`);
    if (recent) {
      try {
        setRecentProducts(JSON.parse(recent));
      } catch (e) {
        console.error('Error loading recent products:', e);
        localStorage.removeItem(`recent_products_${selectedCompany.id}`);
      }
    }
  };

  const updateRecentProducts = (product) => {
    const updated = [
      product,
      ...recentProducts.filter(p => p.id !== product.id)
    ].slice(0, 5);
    
    setRecentProducts(updated);
    try {
      localStorage.setItem(
        `recent_products_${selectedCompany.id}`,
        JSON.stringify(updated)
      );
    } catch (e) {
      console.error('Error saving recent products:', e);
    }
  };

  const handleProductAdd = (product) => {
    const updatedProducts = parentSelectedProducts ? [...parentSelectedProducts] : [];
    const existingProduct = updatedProducts.find(p => p.id === product.id);
    
    if (existingProduct) {
      const newProducts = updatedProducts.map(p =>
        p.id === product.id
          ? { ...p, quantity: p.quantity + 1, ...(product.selectedWeight && { selectedWeight: product.selectedWeight }) }
          : p
      );
      parentSetSelectedProducts(newProducts);
    } else {
      const newProducts = [...updatedProducts, { ...product, quantity: 1 }];
      parentSetSelectedProducts(newProducts);
    }
    
    updateRecentProducts(product);
    if (onProductAdd) {
      onProductAdd(product);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          (product.category != null && product.category.toString() === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full px-4 py-3 pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode('badge')}
              className={`p-2 rounded-lg ${viewMode === 'badge' ? 'bg-red-600 text-white' : 'bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700'}`}
            >
              <ListFilter className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900">No se encontraron productos</h3>
            <p className="text-blue-700">
              {searchQuery 
                ? 'No hay productos que coincidan con tu búsqueda. Intenta con otros términos.'
                : 'No hay productos disponibles en este momento.'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'badge' 
            ? "grid grid-cols-4 gap-2" 
            : "space-y-4"
          }>
            {filteredProducts.map(product => 
              viewMode === 'badge' ? (
                <ProductBadge 
                  key={product.id} 
                  product={product} 
                  onAdd={handleProductAdd} 
                />
              ) : (
                <ProductListItem 
                  key={product.id} 
                  product={product} 
                  onAdd={handleProductAdd} 
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSelection;