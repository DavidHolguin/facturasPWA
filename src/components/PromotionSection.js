import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PromotionSection = ({ promotions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  const calculateTimeLeft = (endDate) => {
    const difference = new Date(endDate) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  };

  useEffect(() => {
    if (selectedPromotion) {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(selectedPromotion.end_date));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [selectedPromotion]);

  const handlePromotionClick = (promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
    setTimeLeft(calculateTimeLeft(promotion.end_date));
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const formatDiscount = (value) => {
    if (typeof value === 'string') {
      return value.replace('-', '').split('.')[0];
    }
    return Math.abs(Math.floor(value));
  };

  const truncateText = (text, maxLength = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const filteredPromotions = promotions.filter(
    promo => !promo.product && !promo.category
  );

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-4 mb-8">
      {filteredPromotions.map((promotion) => (
        <div 
          key={promotion.id}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer"
          onClick={() => handlePromotionClick(promotion)}
        >
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full shadow-sm">
              <Flame 
                className="w-8 h-8 text-orange-500 animate-pulse" 
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.3))'
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg text-gray-600 font-bold truncate">{promotion.title}</h3>
              <p className="text-gray-600 text-sm leading-4 line-clamp-2">{promotion.description}</p>
            </div>
          </div>
        </div>
      ))}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleModalClick}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/20 shadow-xl"
            >
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    {selectedPromotion.title}
                  </h2>
                  <p className="text-gray-600 mt-2">{selectedPromotion.description}</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-center items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full shadow-lg">
                      <Flame 
                        className="w-8 h-8 text-orange-500 animate-pulse" 
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))'
                        }}
                      />
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-lg">
                      {selectedPromotion.discount_type === 'PERCENTAGE' ? (
                        <span>{formatDiscount(selectedPromotion.discount_display)}% OFF</span>
                      ) : (
                        <span>Ahorra ${formatDiscount(selectedPromotion.discount_value)}</span>
                      )}
                    </div>
                  </div>

                  {Object.keys(timeLeft).length > 0 && (
                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner">
                      <p className="text-center font-semibold mb-4">Tiempo restante:</p>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        {[
                          { value: timeLeft.days, label: 'Días' },
                          { value: timeLeft.hours, label: 'Horas' },
                          { value: timeLeft.minutes, label: 'Min' },
                          { value: timeLeft.seconds, label: 'Seg' }
                        ].map((item, index) => (
                          <div key={index} className="bg-white/70 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                              {item.value}
                            </span>
                            <p className="text-sm text-gray-600">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner">
                    <p className="font-semibold mb-2">Términos y condiciones:</p>
                    <p className="text-sm text-gray-600">
                      {selectedPromotion.terms_conditions}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromotionSection;