import React, { useEffect, useState } from 'react';
import { ChevronDown, Tag } from 'lucide-react';

const Badge = ({ children, className = '' }) => (
  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ${className}`}>
    {children}
  </div>
);

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [activePromotions, setActivePromotions] = useState([]);

  useEffect(() => {
    let timeout;
    if (isOpen) {
      setIsAnimating(true);
      timeout = setTimeout(() => setContentVisible(true), 300);
      // Fetch active promotions when modal opens
      fetchActivePromotions();
    } else {
      setContentVisible(false);
      timeout = setTimeout(() => setIsAnimating(false), 500);
    }
    return () => clearTimeout(timeout);
  }, [isOpen]);

  const fetchActivePromotions = async () => {
    if (product?.company_id) {
      try {
        const response = await fetch(`/api/companies/${product.company_id}/active_promotions/`);
        const data = await response.json();
        // Filter promotions that apply to this product
        const productPromotions = data.filter(promo => 
          promo.products.includes(product.id) || 
          promo.categories.includes(product.category_id)
        );
        setActivePromotions(productPromotions);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      }
    }
  };

  const calculateDiscountedPrice = () => {
    if (!activePromotions.length) return product.price;
    
    // Find the best discount
    const bestDiscount = activePromotions.reduce((best, promo) => {
      const discountAmount = promo.discount_type === 'PERCENTAGE' 
        ? product.price * (promo.discount_value / 100)
        : promo.discount_value;
      return discountAmount > best ? discountAmount : best;
    }, 0);

    return (product.price - bestDiscount).toFixed(2);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end justify-center
        ${isOpen 
          ? 'animate-in fade-in duration-500' 
          : 'animate-out fade-out duration-300'
        }`}
      onClick={onClose}
    >
      <div className={`absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm
        ${isOpen 
          ? 'animate-in fade-in duration-500' 
          : 'animate-out fade-out duration-300'
        }`}
      />

      <div 
        className={`relative bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl overflow-hidden shadow-2xl
          ${isOpen 
            ? 'animate-modal-open' 
            : 'animate-modal-close'
          }`}
        style={{
          animation: isOpen 
            ? 'modal-open 0.6s cubic-bezier(0.33, 1, 0.68, 1) forwards'
            : 'modal-close 0.5s cubic-bezier(0.32, 0, 0.67, 0) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full 
              shadow-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 
              hover:rotate-180 hover:scale-110 active:scale-95 z-10"
          >
            <ChevronDown size={24} />
          </button>
          
          {activePromotions.length > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="flex items-center gap-1">
                <Tag size={14} />
                Oferta Especial
              </Badge>
            </div>
          )}
          
          <div className="overflow-hidden">
            <img 
              src={product.image_url || "/api/placeholder/400/320"} 
              alt={product.name} 
              className={`w-full h-auto object-cover transition-all duration-700
                ${contentVisible ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}
            />
          </div>
        </div>

        <div className={`p-6 space-y-4 transition-all duration-500
          ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h2 className="text-2xl font-bold dark:text-white">{product.name}</h2>
          
          <div className="flex items-center gap-2">
            {activePromotions.length > 0 && (
              <span className="text-gray-500 dark:text-gray-400 line-through">${product.price}</span>
            )}
            <p className="text-green-600 dark:text-green-400 font-bold text-xl">
              ${calculateDiscountedPrice()}
            </p>
          </div>

          {activePromotions.length > 0 && (
            <div className="space-y-2">
              {activePromotions.map((promo) => (
                <div key={promo.id} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                    {promo.name}
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-xs">
                    {promo.description}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-gray-600 dark:text-gray-300 leading-5">{product.description}</p>
          
          <button
            onClick={() => onAddToCart({
              ...product,
              final_price: calculateDiscountedPrice(),
              applied_promotions: activePromotions
            })}
            className="w-full bg-cyan-400 dark:bg-cyan-600 text-white py-3 rounded-full font-bold
              transition-all duration-300 
              hover:bg-cyan-500 dark:hover:bg-cyan-700 hover:shadow-lg hover:scale-105 
              active:scale-95 active:shadow-inner"
          >
            Agregar al carrito
          </button>
        </div>

        <style jsx>{`
          @keyframes modal-open {
            0% {
              transform: translateY(100%) scale(0.95);
              opacity: 0;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }

          @keyframes modal-close {
            0% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateY(100%) scale(0.95);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProductModal;