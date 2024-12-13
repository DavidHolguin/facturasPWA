// CreateInvoice.js
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Search, X } from 'lucide-react';

const CreateInvoice = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    identification_type: 'CC',
    identification_number: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const company = JSON.parse(localStorage.getItem('selectedCompany'));
      if (!company) return;

      try {
        const response = await fetch(`/api/products/?company=${company.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = (product) => {
    setSelectedProducts([...selectedProducts, {
      ...product,
      quantity: 1,
      customPrice: product.price,
      customWeight: product.is_weight_based ? product.base_weight : null
    }]);
  };

  const handleQuantityChange = (index, value) => {
    const updated = [...selectedProducts];
    updated[index].quantity = Math.max(1, value);
    setSelectedProducts(updated);
  };

  const handleCustomPriceChange = (index, value) => {
    const updated = [...selectedProducts];
    updated[index].customPrice = value;
    setSelectedProducts(updated);
  };

  const handleCustomWeightChange = (index, value) => {
    const updated = [...selectedProducts];
    updated[index].customWeight = value;
    setSelectedProducts(updated);
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, product) => {
      const price = parseFloat(product.customPrice);
      const quantity = parseFloat(product.quantity);
      return sum + (price * quantity);
    }, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const company = JSON.parse(localStorage.getItem('selectedCompany'));

    try {
      // Create invoice
      const response = await fetch('/api/invoices/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: company.id,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_identification_type: customer.identification_type,
          customer_identification_number: customer.identification_number,
          invoice_items: selectedProducts.map(product => ({
            product_id: product.id,
            quantity: product.quantity,
            unit_price: product.customPrice,
            weight: product.customWeight
          }))
        })
      });

      if (response.ok) {
        const invoice = await response.json();
        // Generate PDF
        await fetch(`/api/invoices/${invoice.id}/generate_pdf/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Clear form
        setSelectedProducts([]);
        setCustomer({
          name: '',
          email: '',
          identification_type: 'CC',
          identification_number: ''
        });
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Products Selection */}
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Productos Disponibles</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
            />
          </div>

          <div className="grid gap-4 max-h-[500px] overflow-y-auto">
            {products
              .filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image_url || "/api/placeholder/48/48"}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.formatted_price}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddProduct(product)}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="space-y-6">
          {/* Selected Products */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Productos Seleccionados</h2>
            
            <div className="space-y-4">
              {selectedProducts.map((product, index) => (
                <div key={index} className="p-4 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{product.name}</h3>
                    <button
                      onClick={() => handleRemoveProduct(index)}
                      className="p-1 rounded-lg text-red-500 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Cantidad</label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(index, product.quantity - 1)}
                          className="p-1 rounded bg-gray-100 dark:bg-gray-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                          className="w-16 text-center rounded border-gray-200 dark:border-gray-600 bg-transparent"
                        />
                        <button
                          onClick={() => handleQuantityChange(index, product.quantity + 1)}
                          className="p-1 rounded bg-gray-100 dark:bg-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Precio</label>
                      <input
                        type="number"
                        value={product.customPrice}
                        onChange={(e) => handleCustomPriceChange(index, parseFloat(e.target.value))}
                        className="w-full rounded border-gray-200 dark:border-gray-600 bg-transparent"
                      />
                    </div>
                    
                    {product.is_weight_based && (
                      <div className="col-span-2">
                        <label className="text-sm text-gray-500 dark:text-gray-400">Peso ({product.weight_unit})</label>
                        <input
                          type="number"
                          value={product.customWeight}
                          onChange={(e) => handleCustomWeightChange(index, parseFloat(e.target.value))}
                          className="w-full rounded border-gray-200 dark:border-gray-600 bg-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {selectedProducts.length > 0 && (
                <div className="text-right text-lg font-semibold">
                  Total: ${calculateTotal().toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                  className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({...customer, email: e.target.value})}
                  className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Identificación</label>
                  <select
                    value={customer.identification_type}
                    onChange={(e) => setCustomer({...customer, identification_type: e.target.value})}
                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50"
                  >
                    <option value="CC">CC</option>
                    <option value="NIT">NIT</option>
                    <option value="RUT">RUT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Número de Identificación</label>
                  <input
                    type="text"
                    value={customer.identification_number}
                    onChange={(e) => setCustomer({...customer, identification_number: e.target.value})}
                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || selectedProducts.length === 0}
            className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Factura'}
          </button>
        </div>
      </div>
    </div>
  );
};
