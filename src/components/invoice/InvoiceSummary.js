// InvoiceSummary.js
import React from 'react';
import TaxSelector from './TaxSelector';
import ProductList from './ProductList';

const InvoiceSummary = ({
  products,
  setProducts,
  customer,
  taxes,
  setTaxes,
  total,
  onBack,
  onSubmit,
  isLoading,
  error
}) => {
  const subtotal = products.reduce((acc, item) => {
    return acc + (item.quantity * (item.finalPrice || item.price));
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="space-y-8">
        {/* Customer Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Nombre</label>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{customer.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Documento</label>
              <p className="font-medium">{customer.idType}: {customer.idNumber}</p>
            </div>
            {customer.phone && (
              <div>
                <label className="text-sm text-gray-500">Teléfono</label>
                <p className="font-medium">{customer.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          <ProductList
            products={products}
            setProducts={setProducts}
            showPrice={true}
          />
        </div>

        {/* Tax Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <TaxSelector
            subtotal={subtotal}
            onTaxesChange={setTaxes}
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Resumen</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {taxes.map(tax => (
              <div key={tax.id} className="flex justify-between text-gray-500">
                <span>{tax.name} ({tax.percentage}%)</span>
                <span>${(subtotal * (tax.percentage / 100)).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 py-6">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Atrás
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              'Crear Factura'
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceSummary;