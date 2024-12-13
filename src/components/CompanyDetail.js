import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import MenuBar from './MenuBar';
import ProductModal from './ProductModal';
import { Send, Instagram, Flame } from 'lucide-react';
import PromotionSection from './PromotionSection';


const ImageWithFallback = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return <img src="/api/placeholder/400/320" alt={alt} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

const PromotionBadge = ({ promotion }) => {
  const isPercentage = promotion.discount_type === 'PERCENTAGE';

  return (
    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
      <div className="relative group">
        <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg animate-bounce-slow">
          <Flame 
            className="w-5 h-5 text-orange-500 animate-pulse" 
            style={{
              filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))'
            }}
          />
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-full right-0 mb-2 whitespace-nowrap">
          <div className="bg-white dark:bg-gray-800 text-xs rounded-lg py-1 px-2 shadow-lg">
            {promotion.title}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-fade-in-right">
        {isPercentage ? (
          <span>{promotion.discount_display} OFF</span>
        ) : (
          <span>Ahorra ${promotion.discount_value}</span>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, onClick }) => {
  const hasPromotion = product.active_promotions && product.active_promotions.length > 0;
  const promotion = hasPromotion ? product.active_promotions[0] : null;

  return (
    <div
      className="flex-none w-[65%] snap-start cursor-pointer"
      style={{ scrollSnapAlign: 'start' }}
      onClick={onClick}
    >
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden relative">
        {hasPromotion && <PromotionBadge promotion={promotion} />}
        <ImageWithFallback 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <h4 className="text-lg font-semibold leading-4 mb-2 dark:text-white">{product.name}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-4 line-clamp-2">{product.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-green-600 dark:text-green-400 font-bold">
              ${product.price}
            </p>
            {hasPromotion && (
              <p className="text-gray-400 line-through text-sm">
                ${(parseFloat(product.price) * (1 + parseFloat(promotion.discount_value)/100)).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryButton = ({ category, isSelected, onClick }) => (
  <button
    onClick={() => onClick(category.id)}
    className={`flex-shrink-0 px-4 py-2 mx-2 rounded-full text-sm font-semibold transition-all duration-300 ${
      isSelected
        ? 'bg-cyan-400 text-white shadow-lg dark:bg-cyan-600'
        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
    } backdrop-filter backdrop-blur-lg bg-opacity-30 shadow-md`}
  >
    {category.name}
  </button>
);

const CompanyDetail = () => {
  const [company, setCompany] = useState(null);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { id } = useParams();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [nextTime, setNextTime] = useState('');

  const categoryCarouselRef = useRef(null);
  const carouselRefs = useMemo(() => ({}), []);

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const checkBusinessHours = useCallback((businessHours) => {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = businessHours[currentDay];
    if (!todayHours) return { isOpen: false, nextTime: 'N/A' };

    const [openHour, openMinute] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    if (currentTime >= openTime && currentTime < closeTime) {
      return { isOpen: true, nextTime: formatTime(todayHours.close) };
    } else {
      let nextDay = currentDay;
      let daysChecked = 0;
      while (daysChecked < 7) {
        const nextDayIndex = (days.indexOf(nextDay) + 1) % 7;
        nextDay = days[nextDayIndex];
        if (businessHours[nextDay]) {
          return { isOpen: false, nextTime: formatTime(businessHours[nextDay].open) };
        }
        daysChecked++;
      }
      return { isOpen: false, nextTime: 'N/A' };
    }
  }, []);

  useEffect(() => {
    const fetchCompanyAndProducts = async () => {
      try {
        const companyResponse = await axios.get(`https://backendfindout-ea692e018a66.herokuapp.com/api/companies/${id}/`);
        setCompany(companyResponse.data);
        
        const { isOpen, nextTime } = checkBusinessHours(companyResponse.data.business_hours);
        setIsOpen(isOpen);
        setNextTime(nextTime);
        
        const productsResponse = await axios.get(`https://backendfindout-ea692e018a66.herokuapp.com/api/products/`);
        const companyProducts = productsResponse.data.filter(product => product.company === parseInt(id));
        
        const categoriesResponse = await axios.get(`https://backendfindout-ea692e018a66.herokuapp.com/api/categories/`);
        
        const grouped = companyProducts.reduce((acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = [];
          }
          acc[product.category].push(product);
          return acc;
        }, {});
        
        setProductsByCategory(grouped);
        
        const categoriesWithProducts = categoriesResponse.data.filter(
          category => grouped[category.id]
        );
        setCategories(categoriesWithProducts);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    
    fetchCompanyAndProducts();
  }, [id, checkBusinessHours]);

  const toggleCategory = useCallback((categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const filteredProductsByCategory = useMemo(() => {
    return selectedCategories.length === 0
      ? productsByCategory
      : Object.fromEntries(
          Object.entries(productsByCategory).filter(([categoryId]) => 
            selectedCategories.includes(parseInt(categoryId))
          )
        );
  }, [productsByCategory, selectedCategories]);

  const startDragging = useCallback((e, ref) => {
    if (ref.current) {
      setIsDragging(true);
      setStartX(e.pageX - ref.current.offsetLeft);
      setScrollLeft(ref.current.scrollLeft);
    }
  }, []);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrag = useCallback((e, ref) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    ref.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const getCarouselProducts = useCallback((products) => {
    if (products.length <= 1) return products;
    if (products.length === 2) return products;
    return [...products, ...products, ...products];
  }, []);

  const openProductModal = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const addToCart = useCallback((product) => {
    console.log('Agregando al carrito:', product);
    closeProductModal();
  }, [closeProductModal]);

  if (!company) return <div className="dark:text-white">Cargando...</div>;

  return (
    <div className="flex flex-col items-center font-poppins dark:bg-gray-900">
      {/* Sección del perfil de la empresa */}
      <section className="w-full mb-8 flex flex-col items-center">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin-slow" style={{
              backgroundImage: 'linear-gradient(0deg, #f7bb17, #66ffff, #ff9dd1, #ff69b4, #f7bb17)',
              backgroundSize: '100% 400%',
              animation: 'rotating 2s linear infinite, gradientRotate 5s linear infinite'
            }}></div>
            <ImageWithFallback 
              src={company.profile_picture_url} 
              alt={company.name} 
              className="w-[88px] h-[88px] absolute rounded-full object-cover border-4 border-inherit border-solid"
            />
            {company.country?.flag_icon_url && (
              <div className="absolute bottom-0 left-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full border-2 shadow-md overflow-hidden">
                <img 
                  src={company.country.flag_icon_url} 
                  alt={`Bandera de ${company.country.name}`}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/32/32";
                  }}
                />
              </div>
            )}
          </div>
          <div className="mt-2 text-center">
            <h3 className="text-gray-600 dark:text-gray-300 text-2xl leading-4 font-extrabold">{company.name}</h3>
            <p className="text-[#f7bb17] dark:text-[#f7bb17] text-base font-medium">
              {company.category && typeof company.category === 'object' 
                ? company.category.name 
                : (company.category || 'Categoría de la empresa')}
            </p>
            <div 
              ref={categoryCarouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide mt-2 pb-4"
              style={{ 
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onMouseDown={(e) => categoryCarouselRef.current && startDragging(e, categoryCarouselRef)}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              onMouseMove={(e) => categoryCarouselRef.current && onDrag(e, categoryCarouselRef)}
            >
              {categories.map(category => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  isSelected={selectedCategories.includes(category.id)}
                  onClick={toggleCategory}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="w-11/12 flex items-center justify-between">
          <div className="text-center">
            <h3 className={`text-xl leading-4 font-bold ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isOpen ? 'ABIERTO' : 'CERRADO'}
            </h3>   
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isOpen ? `Hasta ${nextTime}` : `Abre ${nextTime}`}
            </p>
            <a href="#" className="flex items-center justify-center mt-2 leading-4 text-[#f7bb17] dark:text-cyan-300">
              <span>{company.address}</span>
            </a>
          </div>

          <div className="w-2/3 border-l border-gray-400 dark:border-gray-600 pl-4">
            <p className="text-sm leading-4 text-gray-600 dark:text-gray-300 mb-4">{company.description}</p>
            <div className="flex items-center gap-2">
              
              <a 
                href="#" 
                className="text-white font-bold text-sm px-6 py-2 rounded-full flex items-center gap-2 shadow hover:shadow-md transition-all duration-300 backdrop-blur-lg bg-[#f7bb17] dark:bg-[#f7bb17] hover:shadow-cyan-300"
              >
                <Send className="w-4 h-4" />
                Escribir
              </a>
              <a 
                href={company.instagram_url || '#'} 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#f7bb17] dark:bg-[#f7bb17] rounded-full shadow hover:shadow-md  transition-all duration-300 text-white backdrop-blur-lg bg-opacity-90 dark:from-pink-600 dark:to-purple-600 dark:hover:shadow-pink-600/50"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
      <PromotionSection promotions={company.active_promotions} />

      {/* Sección de productos por categoría */}
      <section className="w-full">
        {Object.entries(filteredProductsByCategory).map(([categoryId, products]) => (
          <div key={categoryId} className="mb-0">
            <h4 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300 px-4">
              {categories.find(cat => cat.id === parseInt(categoryId))?.name || 'Categoría'}
            </h4>
            <div 
              className="overflow-x-hidden"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div
                ref={el => carouselRefs[categoryId] = el}
                className="flex gap-4 px-4 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{
                  scrollBehavior: 'smooth',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                onMouseDown={(e) => carouselRefs[categoryId] && startDragging(e, { current: carouselRefs[categoryId] })}
                onMouseUp={stopDragging}
                onMouseLeave={stopDragging}
                onMouseMove={(e) => carouselRefs[categoryId] && onDrag(e, { current: carouselRefs[categoryId] })}
              >
                {getCarouselProducts(products).map((product, index) => (
                  <ProductCard
                    key={`${product.id}-${index}`}
                    product={product}
                    onClick={() => openProductModal(product)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <MenuBar />

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        onAddToCart={addToCart}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes rotating {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes gradientRotate {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 100% 100%;
          }
        }
        .animate-spin-slow {
          animation: rotating 3s linear infinite;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes fade-in-right {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CompanyDetail;