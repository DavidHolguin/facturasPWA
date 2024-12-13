import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Search, X, Save, Send } from 'lucide-react';
import debounce from 'lodash/debounce';

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
  const [taxes, setTaxes] = useState([
    { tax_type: 'IVA', percentage: 19.00 },
    { tax_type: 'ICA', percentage: 1.50 }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') {
          e.preventDefault();
          searchInputRef.current?.focus();
        } else if (e.key === 's') {
          e.preventDefault();
          handleSaveAsDraft();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchProducts = async () => {
    const company = JSON.parse(localStorage.getItem('selectedCompany'));
    
    if (!company) {
      setError('Por favor seleccione una empresa primero');
      return;
    }

    try {
      const response = await fetch(
        `https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/products/?company=${company.id}`,
        { headers: getAuthHeaders() }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cargar los productos');
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Error al cargar los productos');
    }
  };

  const validateForm = () => {
    if (!customer.name || !customer.email) {
      setError('El nombre y correo del cliente son requeridos');
      return false;
    }
    
    if (!customer.identification_number) {
      setError('El número de identificación del cliente es requerido');
      return false;
    }
    
    if (selectedProducts.length === 0) {
      setError('Debe seleccionar al menos un producto');
      return false;
    }
    
    const invalidProduct = selectedProducts.find(
      product => !product.quantity || product.quantity < 1 || !product.customPrice || product.customPrice < 0
    );
    
    if (invalidProduct) {
      setError('Todos los productos deben tener cantidad y precio válidos');
      return false;
    }
    
    return true;
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleCustomPriceChange = (index, value) => {
    const updated = [...selectedProducts];
    updated[index] = {
      ...updated[index],
      customPrice: value
    };
    setSelectedProducts(updated);
  };

  const handleAddProduct = (product) => {
    if (selectedProducts.find(p => p.id === product.id)) return;
    
    setSelectedProducts([...selectedProducts, {
      ...product,
      quantity: 1,
      customPrice: product.price
    }]);

    setTimeout(() => {
      const inputs = document.querySelectorAll('[data-quantity-input]');
      inputs[inputs.length - 1]?.focus();
    }, 100);
  };

  const handleQuantityChange = (index, value, type = 'input') => {
    const updated = [...selectedProducts];
    if (type === 'increment') {
      updated[index].quantity = (updated[index].quantity || 0) + 1;
    } else if (type === 'decrement') {
      updated[index].quantity = Math.max(1, (updated[index].quantity || 0) - 1);
    } else {
      updated[index].quantity = Math.max(1, value);
    }
    setSelectedProducts(updated);
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, product) => {
      const price = parseFloat(product.customPrice) || 0;
      const quantity = parseFloat(product.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  };

  const calculateTaxes = (subtotal) => {
    return taxes.reduce((acc, tax) => {
      return acc + (subtotal * (tax.percentage / 100));
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxes(subtotal);
    return subtotal + taxAmount;
  };

  const createInvoicePayload = () => {
    const company = JSON.parse(localStorage.getItem('selectedCompany'));
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    return {
      company_id: company.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_identification_type: customer.identification_type,
      customer_identification_number: customer.identification_number,
      invoice_items: selectedProducts.map(product => ({
        product_id: product.id,
        quantity: product.quantity,
        unit_price: product.customPrice,
        description: product.description || ''
      })),
      taxes: taxes,
      issue_date: today.toISOString(),
      due_date: dueDate.toISOString(),
      notes: notes
    };
  };

  const handleSaveAsDraft = async () => {
    if (!customer.name || selectedProducts.length === 0) {
      setError('Se requiere al menos un nombre de cliente y un producto');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('https://facturaspwa-382a43a70547.herokuapp.com/api/invoices/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...createInvoicePayload(),
          status: 'draft'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el borrador');
      }

      setSuccess('Borrador guardado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setError(error.message || 'Error al guardar el borrador');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://facturaspwa-382a43a70547.herokuapp.com/api/invoices/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(createInvoicePayload())
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la factura');
      }

      const invoice = await response.json();
      resetForm();
      setSuccess('Factura creada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError(error.message || 'Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProducts([]);
    setCustomer({
      name: '',
      email: '',
      identification_type: 'CC',
      identification_number: ''
    });
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-[70px]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-col">
        
          <div className="flex gap-4">
            <button
              onClick={handleSaveAsDraft}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Enviando...' : 'Crear Factura'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar productos... (Ctrl + F)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-3 max-h-[600px] overflow-y-auto">
              {products
                .filter(product => 
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(product => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image_url || "/api/placeholder/40/40"}
                        alt=""
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">
                          ${product.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-4">Información del Cliente</h2>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({...customer, name: e.target.value})}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Correo</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({...customer, email: e.target.value})}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de ID</label>
                    <select
                      value={customer.identification_type}
                      onChange={(e) => setCustomer({...customer, identification_type: e.target.value})}
                      className="w-full rounded-md border-gray-300"
                    >
                      <option value="CC">CC</option>
                      <option value="NIT">NIT</option>
                      <option value="RUT">RUT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Número de ID</label>
                    <input
                      type="text"
                      value={customer.identification_number}
                      onChange={(e) => setCustomer({...customer, identification_number: e.target.value})}
                      className="w-full rounded-md border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notas</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-md border-gray-300"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-4">Productos Seleccionados</h2>
              
              <div className="space-y-4">
                {selectedProducts.map((product, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_url || "/api/placeholder/32/32"}
                          alt=""
                          className="w-8 h-8 rounded-md object-cover"
                        />
                        <h3 className="font-medium">{product.name}</h3>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="p-1 rounded-md text-red-500 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Cantidad</label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(index, null, 'decrement')}
                            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            data-quantity-input
                            value={product.quantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                            className="w-20 text-center rounded-md border-gray-300"
                            min="1"
                          />
                          <button
                            onClick={() => handleQuantityChange(index, null, 'increment')}
                            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Precio Unitario</label>
                        <input
                          type="number"
                          value={product.customPrice}
                          onChange={(e) => handleCustomPriceChange(index, parseFloat(e.target.value))}
                          className="w-full rounded-md border-gray-300"
                          min="0"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm text-gray-500 mb-1">Descripción</label>
                        <input
                          type="text"
                          value={product.description || ''}
                          onChange={(e) => {
                            const updated = [...selectedProducts];
                            updated[index] = {
                              ...updated[index],
                              description: e.target.value
                            };
                            setSelectedProducts(updated);
                          }}
                          className="w-full rounded-md border-gray-300"
                          placeholder="Descripción opcional"
                        />
                      </div>

                      <div className="col-span-2 text-right text-sm text-gray-500">
                        Subtotal: ${(product.quantity * product.customPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {selectedProducts.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-lg">${calculateSubtotal().toLocaleString()}</span>
                    </div>

                    {taxes.map((tax, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {tax.tax_type} ({tax.percentage}%)
                        </span>
                        <span className="text-lg">
                          ${(calculateSubtotal() * (tax.percentage / 100)).toLocaleString()}
                        </span>
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {selectedProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay productos seleccionados</p>
                    <p className="text-sm">Busca y agrega productos desde el panel izquierdo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>Atajos de teclado:</p>
              <p>• Ctrl/⌘ + F: Buscar productos</p>
              <p>• Ctrl/⌘ + S: Guardar como borrador</p>
              <p>• Ctrl/⌘ + Enter: Crear factura</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;