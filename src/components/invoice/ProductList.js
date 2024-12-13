import React from 'react';

const ProductList = ({ products, setProducts, showPrice = false }) => {
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setProducts(prevProducts => 
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  };

  const handleRemoveProduct = (productId) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== productId)
    );
  };

  const handlePriceChange = (productId, newPrice) => {
    if (newPrice < 0) return;
    
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, finalPrice: Number(newPrice) }
          : product
      )
    );
  };

  // Función auxiliar para obtener el precio numérico
  const getNumericPrice = (product) => {
    const price = product.finalPrice || product.price;
    return Number(price) || 0;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-gray-500 dark:text-gray-400">
          No hay productos seleccionados
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {products.map(product => (
          <div 
            key={product.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            {/* Product Info */}
            <div className="flex-grow">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Precio: ${getNumericPrice(product).toFixed(2)}
              </p>
              {product.selectedWeight && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Peso: {product.selectedWeight.weight}g
                </p>
              )}
            </div>

            {/* Price Input - Only shown when showPrice is true */}
            {showPrice && (
              <div className="w-32">
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                  Precio unitario
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={getNumericPrice(product)}
                  onChange={(e) => handlePriceChange(product.id, e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Quantity Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={product.quantity}
                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                className="w-16 text-center px-2 py-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                aria-label="Cantidad de producto"
              />
              <button
                onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            {/* Subtotal and Remove Button */}
            <div className="flex items-center justify-between sm:w-32">
              <span className="font-medium">
                ${(getNumericPrice(product) * product.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => handleRemoveProduct(product.id)}
                className="text-red-600 hover:text-red-700"
                aria-label="Eliminar producto"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;