import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Package, Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductModal from './ProductModal'; // Asegúrate de que la ruta de importación sea correcta

const FrasesDeBusqueda = [
  "¿Buscas un hotel cerca?...",
  "Encuentra el mejor bar...",
  "Descubre restaurantes locales...",
  "¿Necesitas un hostal?...",
  "Explora parques cercanos...",
  "Encuentra lugares para comer...",
  "Descubre lugares para descansar...",
  "Lugares para divertirte..."
];

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState("up");
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      setIsAtTop(scrollY < 10);
      
      const direction = scrollY > lastScrollY ? "down" : "up";
      if (direction !== scrollDirection && 
          (Math.abs(scrollY - lastScrollY) > 10)) {
        setScrollDirection(direction);
      }
      setLastScrollY(scrollY > 0 ? scrollY : 0);
    };

    window.addEventListener("scroll", updateScrollDirection);
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [scrollDirection, lastScrollY]);

  return { scrollDirection, isAtTop };
};

const ImageFromS3 = ({ imageUrl, alt }) => {
  const [error, setError] = useState(false);

  if (error || !imageUrl) {
    return <img src="/api/placeholder/400/320" alt={alt} className="w-full h-48 object-cover" />;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="w-full h-48 object-cover"
      onError={() => setError(true)}
    />
  );
};

const CompanyLogo = ({ logo, companyName = '', className = "" }) => {
  const [error, setError] = useState(false);

  if (error || !logo) {
    return (
      <div className={`w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-2 border-[#f7bb17] ${className}`}>
        <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
          {companyName ? companyName.charAt(0).toUpperCase() : '?'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={`Logo de ${companyName || 'la empresa'}`}
      className={`w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-lg ${className}`}
      onError={() => setError(true)}
    />
  );
};

const ProductCarousel = ({ products, companyId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 === products.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? products.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full h-48">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ImageFromS3
            imageUrl={product.image_url}
            alt={product.name}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <p className="text-sm font-medium truncate">{product.name}</p>
            <p className="text-xs">{product.price}</p>
          </div>
        </div>
      ))}
      {products.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
};

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('companies');
  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredResults, setFilteredResults] = useState({ companies: [], products: [] });
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [placeholderText, setPlaceholderText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const searchContainerRef = useRef(null);
  const { scrollDirection, isAtTop } = useScrollDirection();
  const shouldShowSearch = scrollDirection === "up" || isAtTop;
  const [companyLogos, setCompanyLogos] = useState({});
  
  // Nuevo estado para manejar el modal de producto
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar parámetros de URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('q');
    const tab = params.get('tab');
    const cats = params.get('categories');

    if (searchQuery) setQuery(searchQuery);
    if (tab && (tab === 'companies' || tab === 'products')) setActiveTab(tab);
    if (cats) {
      try {
        const categoriesArray = JSON.parse(cats);
        if (Array.isArray(categoriesArray)) {
          setSelectedCategories(categoriesArray);
        }
      } catch (e) {
        console.error('Error al procesar categorías de la URL:', e);
      }
    }
  }, [location.search]);

  // Actualizar URL con los filtros actuales
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (activeTab !== 'companies') params.set('tab', activeTab);
    if (selectedCategories.length > 0) {
      params.set('categories', JSON.stringify(selectedCategories));
    }
    
    const newUrl = `${location.pathname}?${params.toString()}`;
    navigate(newUrl, { replace: true });
  }, [query, activeTab, selectedCategories, navigate, location.pathname]);

  // Animación del placeholder
  useEffect(() => {
    const animatePlaceholder = async () => {
      if (isInputHovered) return;

      const currentCategory = FrasesDeBusqueda[currentCategoryIndex];
      
      if (isTyping) {
        for (let i = 0; i <= currentCategory.length; i++) {
          if (isInputHovered) break;
          setPlaceholderText(currentCategory.slice(0, i));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        setIsTyping(false);
      } else {
        for (let i = currentCategory.length; i >= 0; i--) {
          if (isInputHovered) break;
          setPlaceholderText(currentCategory.slice(0, i));
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        setIsTyping(true);
        setCurrentCategoryIndex((prevIndex) => (prevIndex + 1) % FrasesDeBusqueda.length);
      }
    };

    animatePlaceholder();
  }, [isTyping, currentCategoryIndex, isInputHovered]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [companiesResponse, productsResponse, categoriesResponse] = await Promise.all([
          axios.get('https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/companies/', config),
          axios.get('https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/products/', config),
          axios.get('https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/categories/', config),
        ]);

        setCompanies(companiesResponse.data);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);

        const logoMap = {};
        companiesResponse.data.forEach(company => {
          logoMap[company.id] = company.profile_picture_url;
        });
        setCompanyLogos(logoMap);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(
          error.response?.status === 403
            ? 'No tienes permiso para acceder a esta información. Por favor, inicia sesión o contacta al administrador.'
            : 'Ha ocurrido un error al cargar los datos. Por favor, intenta de nuevo más tarde.'
        );
      }
    };

    fetchData();
  }, []);


  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };
  
  const isBusinessOpen = (businessHours) => {
    if (!businessHours) return null;
  
    const now = new Date();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = daysOfWeek[now.getDay()];
    const currentHours = businessHours[currentDay];
  
    if (!currentHours || !currentHours.open || !currentHours.close) return null;
  
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    const isOpen = currentTime >= currentHours.open && currentTime <= currentHours.close;
    
    return {
      isOpen,
      openTime: formatTime(currentHours.open),
      closeTime: formatTime(currentHours.close)
    };
  };

  // Función mejorada de filtrado
  const filterResults = useCallback(() => {
    const lowercaseQuery = query.toLowerCase();

    const matchesSearchTerm = (text) => text?.toLowerCase().includes(lowercaseQuery);
    
    // Función auxiliar para verificar si una empresa tiene productos en las categorías seleccionadas
    const companyHasProductsInSelectedCategories = (companyId) => {
      return products.some(product => 
        product.company === companyId && 
        (!selectedCategories.length || selectedCategories.includes(product.category))
      );
    };

    // Filtrar productos
    const filteredProducts = products.filter(product => {
      const productCompany = companies.find(c => c.id === product.company);
      
      const matches = 
        matchesSearchTerm(product.name) ||
        matchesSearchTerm(product.description) ||
        matchesSearchTerm(productCompany?.name) ||
        matchesSearchTerm(productCompany?.description);

      return matches && (!selectedCategories.length || selectedCategories.includes(product.category));
    });

    // Filtrar empresas
    const filteredCompanies = companies.filter(company => {
      // Si hay término de búsqueda o categorías seleccionadas
      if (query || selectedCategories.length > 0) {
        // Si hay categorías seleccionadas, verificar si la empresa tiene productos en esas categorías
        if (selectedCategories.length > 0) {
          return companyHasProductsInSelectedCategories(company.id);
        }

        // Si solo hay término de búsqueda
        const companyMatches = 
          matchesSearchTerm(company.name) ||
          matchesSearchTerm(company.description);

        const hasMatchingProducts = products
          .filter(product => product.company === company.id)
          .some(product => 
            matchesSearchTerm(product.name) || 
            matchesSearchTerm(product.description)
          );

        return companyMatches || hasMatchingProducts;
      }

      // Si no hay búsqueda ni categorías seleccionadas, mostrar todas las empresas
      return true;
    });

    setFilteredResults({ companies: filteredCompanies, products: filteredProducts });
  }, [query, companies, products, selectedCategories]);

  // Actualizar resultados cuando cambian los filtros
  useEffect(() => {
    filterResults();
  }, [filterResults, query, selectedCategories]);

  const handleCategoryToggle = useCallback((categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handleInputHover = useCallback((isHovered) => {
    setIsInputHovered(isHovered);
    if (isHovered) {
      setPlaceholderText(FrasesDeBusqueda[currentCategoryIndex]);
    }
  }, [currentCategoryIndex]);

  const getMatchingProducts = useCallback((company) => {
    if (!query && selectedCategories.length === 0) {
      return [];
    }
    return filteredResults.products.filter(product => product.company === company.id);
  }, [filteredResults.products, query, selectedCategories]);

  // Nueva función para manejar la apertura del modal
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Nueva función para manejar el cierre del modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Nueva función para manejar la adición al carrito (puedes implementar la lógica real más tarde)
  const handleAddToCart = (product) => {
    console.log('Producto añadido al carrito:', product);
    // Implementa la lógica real de añadir al carrito aquí
    handleCloseModal();
  };

  const renderCompanies = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {filteredResults.companies.map(company => {
        const matchingProducts = getMatchingProducts(company);
        const shouldShowProducts = (query || selectedCategories.length > 0) && matchingProducts.length > 0;
        const businessStatus = isBusinessOpen(company.business_hours);
        
        return (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative overflow-hidden border border-[#f7bb17] dark:border-[#f7bb17] hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 rounded-lg ${
              businessStatus && !businessStatus.isOpen ? 'opacity-60' : ''
            }`}
          >
            <Link to={`/company/${company.id}`}>
              <div className="relative">
                {shouldShowProducts ? (
                  <ProductCarousel products={matchingProducts} companyId={company.id} />
                ) : (
                  <ImageFromS3
                    imageUrl={company.cover_photo_url}
                    alt={`${company.name} foto de portada`}
                  />
                )}
                <CompanyLogo 
                  logo={company.profile_picture_url}
                  companyName={company.name}
                  className="absolute top-2 right-2 w-[55px] h-[55px]"
                />
                {company.business_hours && businessStatus && (
                  <div className="absolute top-2 left-2 min-w-[130px]">
                    <div className={`
                      rounded-full text-sm font-bold shadow-lg
                      ${businessStatus.isOpen 
                        ? 'bg-gradient-to-r bg-[#f7bb17a1] to-cyan-300 text-white' 
                        : 'bg-gradient-to-r from-red-500 to-red-400 text-white'}
                    `}>
                      <div className="flex items-center">
                        <span className={`
                          px-3 py-1 rounded-full
                          ${businessStatus.isOpen ? 'bg-[#f7bb17]' : 'bg-red-600'}
                        `}>
                          {businessStatus.isOpen ? 'ABIERTO' : 'CERRADO'}
                        </span>
                        <span className="px-2 whitespace-nowrap">
                          {businessStatus.isOpen 
                            ? `HASTA ${businessStatus.closeTime}`
                            : `OPEN ${businessStatus.openTime}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold leading-4 dark:text-white">{company.name}</h3>
                <Link 
                  to={`/company-categories/${company.category?.id}`}
                  className="text-base text-[#f7bb17] hover:text-[#00d8d8] transition-colors duration-300"
                >
                  {company.category?.name}
                </Link>
                <p className="text-sm leading-4 text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{company.description}</p>
                {shouldShowProducts && (
                  <p className="text-sm text-[#f7bb17] mt-2">
                    {matchingProducts.length} producto{matchingProducts.length !== 1 ? 's' : ''} encontrado{matchingProducts.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

  const renderProducts = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredResults.products.map(product => {
        const productCompany = companies.find(c => c.id === product.company);
        const productCategory = categories.find(c => c.id === product.category);
        
        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-[#f7bb17] dark:border-[#f7bb17] cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            <div className="relative">
              <ImageFromS3 imageUrl={product.image_url} alt={product.name} />
              <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start">
                <CompanyLogo 
                  logo={companyLogos[product.company]}
                  companyName={productCompany?.name}
                />
                <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                  $ {product.price}
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold dark:text-white">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-4 line-clamp-2">{product.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-[#f7bb17]">{productCompany?.name}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">{productCategory?.name}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg shadow-md"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {shouldShowSearch && (
          <motion.div 
            ref={searchContainerRef}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 dark:border-gray-700/50"
            style={{ top: '56px' }}
          >
            <div className="container mx-auto px-4 pt-4 pb-3">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={placeholderText}
                      onMouseEnter={() => handleInputHover(true)}
                      onMouseLeave={() => handleInputHover(false)}
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-700
                                bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-lg
                                focus:outline-none focus:ring-2 focus:ring-[#f7bb17]
                                placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white
                                transition-all duration-300"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('companies')}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      activeTab === 'companies'
                        ? 'bg-[#f7bb17] text-white shadow-lg'
                        : 'bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Building2 size={20} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('products')}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      activeTab === 'products'
                        ? 'bg-[#f7bb17] text-white shadow-lg'
                        : 'bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Package size={20} />
                  </motion.button>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {categories.map(category => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`
                        py-1 px-4 rounded-full whitespace-nowrap text-sm
                        ${selectedCategories.includes(category.id)
                          ? 'bg-[#f7bb17] text-white shadow-md'
                          : 'bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                        border border-gray-200 dark:border-gray-700 backdrop-blur-sm transition-all duration-300
                      `}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 dark:from-gray-900/80 to-transparent pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="container mx-auto px-4" 
        style={{ 
          marginTop: shouldShowSearch ? '140px' : '80px',
          transition: 'margin-top 0.3s ease-in-out'
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'companies' && renderCompanies()}
          {activeTab === 'products' && renderProducts()}

          {((activeTab === 'companies' && filteredResults.companies.length === 0) ||
            (activeTab === 'products' && filteredResults.products.length === 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No se encontraron resultados para tu búsqueda.
                {selectedCategories.length > 0 && " Prueba ajustando los filtros de categoría."}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Search;
          