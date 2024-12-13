import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, MapPin, Phone, ChevronDown, X, MessageCircle, LayoutGrid, List, ScrollText } from 'lucide-react';

const CompanyLanding = () => {
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'carousel'

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const selectedCompany = JSON.parse(localStorage.getItem('selectedCompany'));
        if (!selectedCompany) return;

        const baseUrl = 'https://facturaspwa-954cb3785e4a.herokuapp.com/api/marketplace';
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [companyData, productsData, categoriesData] = await Promise.all([
          fetch(`${baseUrl}/companies/`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/products/`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/categories/`, { headers }).then(r => r.json())
        ]);

        setCompany(companyData.find(c => c.id === selectedCompany.id));
        setProducts(productsData.filter(p => p.company === selectedCompany.id));
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCall = () => {
    if (company?.phone) {
      window.location.href = `tel:${company.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (company?.phone) {
      const message = encodeURIComponent(`Hola ${company.name}, me gustaría obtener más información sobre sus productos.`);
      window.open(`https://wa.me/${company.phone}?text=${message}`, '_blank');
    }
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <button
      onClick={() => setSelectedProduct(product)}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden text-left"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-sm md:text-base line-clamp-2">{product.name}</h3>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
          <span className="text-red-600 font-bold text-sm md:text-base mt-1">
            {product.formatted_price}
          </span>
        </div>
        
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {categories.find(c => c.id === product.category)?.name}
          </span>
        </div>
      </div>
    </button>
  );

  // Product List Item Component
  const ProductListItem = ({ product }) => (
    <button
      onClick={() => setSelectedProduct(product)}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden text-left w-full"
    >
      <div className="flex">
        <div className="w-32 h-32">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-base">{product.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {product.description}
              </p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-fit">
                {categories.find(c => c.id === product.category)?.name}
              </span>
            </div>
            <span className="text-red-600 font-bold text-base">
              {product.formatted_price}
            </span>
          </div>
        </div>
      </div>
    </button>
  );

  // Product Carousel Component
  const ProductCarousel = ({ products, category }) => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.map(product => (
            <div key={product.id} className="w-64 flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Product Modal Component
  const ProductModal = ({ product, onClose }) => {
    if (!product) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl overflow-hidden relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-black/20 rounded-full hover:bg-black/30"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full aspect-square object-cover"
          />
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{product.name}</h3>
              <span className="text-xl font-bold text-red-600">{product.formatted_price}</span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
            
            <div className="flex gap-3">
              <button
                onClick={handleWhatsApp}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600"
              >
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-80">
        <div className="absolute inset-0">
          <img 
            src={company.cover_photo_url} 
            alt={company.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <img 
              src={company.profile_picture_url} 
              alt={company.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
            />
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{company.name}</h1>
              <p className="mt-2 text-gray-200">{company.description}</p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center text-sm bg-black/20 rounded-full px-3 py-1.5">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {company.address}
                </div>
                <div className="flex items-center text-sm bg-black/20 rounded-full px-3 py-1.5">
                  <Clock className="w-4 h-4 mr-1.5" />
                  8:00 AM - 6:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-30">
        <button
          onClick={handleCall}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600"
        >
          <Phone className="w-6 h-6" />
        </button>
        <button
          onClick={handleWhatsApp}
          className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Search, Filters, and View Mode */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  <span>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Categorías'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoriesOpen && (
                <div className="absolute top-full left-0 right-0 md:right-auto md:w-64 mt-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setIsCategoriesOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    <span>Todas las categorías</span>
                    {!selectedCategory && <span className="w-2 h-2 bg-red-500 rounded-full"/>}
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsCategoriesOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <span>{category.name}</span>
                      {selectedCategory === category.id && <span className="w-2 h-2 bg-red-500 rounded-full"/>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('carousel')}
                className={`p-2 rounded-lg ${viewMode === 'carousel' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <ScrollText className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="container mx-auto px-4 py-8">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">
            {filteredProducts.map(product => (
              <ProductListItem key={product.id} product={product} />
            ))}
          </div>
        )}

        {viewMode === 'carousel' && (
          <div className="space-y-8">
            {categories.map(category => {
              const categoryProducts = filteredProducts.filter(product => product.category === category.id);
              if (categoryProducts.length === 0) return null;
              
              return (
                <ProductCarousel 
                  key={category.id} 
                  products={categoryProducts} 
                  category={category} 
                />
              );
            })}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron productos que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default CompanyLanding;