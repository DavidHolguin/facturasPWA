import React, { useMemo } from 'react';

const InvoiceBar = ({ step, setStep, products, total, canProceed }) => {
  const steps = ['Productos', 'Cliente', 'Resumen'];

  // Calculate total using useMemo to optimize performance
  const calculatedTotal = useMemo(() => {
    return products.reduce((acc, product) => {
      const itemPrice = product.finalPrice || product.price;
      const quantity = product.quantity || 1;
      return acc + (itemPrice * quantity);
    }, 0);
  }, [products]);

  const handleNext = () => {
    if (step < 4 && canProceed) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Calculate total items considering quantities
  const totalItems = useMemo(() => {
    return products.reduce((acc, product) => {
      return acc + (product.quantity || 1);
    }, 0);
  }, [products]);

  return (
    <div className="fixed bottom-[64px] left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="font-medium">
              Total: ${calculatedTotal.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Atrás
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`px-6 py-2 rounded-lg ${
                canProceed
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === 3 ? 'Finalizar' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBar;