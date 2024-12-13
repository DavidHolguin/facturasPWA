// InvoiceCreation.js
import ProductSelection from './ProductSelection';

// Importar los componentes (ajusta las rutas según tu estructura de archivos)

import ConfirmationView from './ConfirmationView';
import { useState, useEffect } from 'react';
import CustomerForm from './CustomerForm';
import InvoiceSummary from './InvoiceSummary';
import InvoiceBar from './InvoiceBar';

const InvoiceCreation = ({ selectedCompany }) => {
  const [step, setStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [taxes, setTaxes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateTotal = () => {
    const subtotal = selectedProducts.reduce((acc, item) => {
      return acc + (item.quantity * item.finalPrice);
    }, 0);

    const taxAmount = taxes.reduce((acc, tax) => {
      return acc + (subtotal * (tax.percentage / 100));
    }, 0);

    setInvoiceTotal(subtotal + taxAmount);
  };

  useEffect(() => {
    calculateTotal();
  }, [selectedProducts, taxes]);

  const handleProductAdd = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { 
        ...product, 
        quantity: 1, 
        finalPrice: product.finalPrice || product.price // Ensure we have a finalPrice
      }];
    });
  };

  const handleCreateInvoice = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const invoiceData = {
        company_id: selectedCompany.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_identification_type: customer.idType,
        customer_identification_number: customer.idNumber,
        status: 'BORRADOR',
        invoice_items: selectedProducts.map(product => ({
          product_id: product.id,
          quantity: product.quantity,
          unit_price: product.finalPrice,
          description: product.description || product.name
        })),
        taxes: taxes,
        issue_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await fetch('https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/invoices/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      setStep(4); // Move to confirmation view
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Progress Steps */}
      <div className="fixed top-[64px]  left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {['Productos', 'Cliente', 'Resumen'].map((label, index) => (
              <div 
                key={label}
                className={`flex items-center ${index < step ? 'text-red-600' : 'text-gray-400'}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${index + 1 === step ? 'bg-red-600 text-white' : 
                    index + 1 < step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {index + 1 < step ? '✓' : index + 1}
                </div>
                <span className="ml-2 hidden sm:block">{label}</span>
                {index < 2 && (
                  <div className="h-[2px] w-12 sm:w-32 mx-4 bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24">
        {step === 1 && (
          <ProductSelection 
          selectedCompany={selectedCompany}
          onProductAdd={handleProductAdd}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
        )}
        
        {step === 2 && (
          <CustomerForm
            onCustomerSelect={setCustomer}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        
        {step === 3 && (
          <InvoiceSummary
            products={selectedProducts}
            customer={customer}
            taxes={taxes}
            setTaxes={setTaxes}
            total={invoiceTotal}
            onBack={() => setStep(2)}
            onSubmit={handleCreateInvoice}
            isLoading={isLoading}
            error={error}
          />
        )}
        
        {step === 4 && (
          <ConfirmationView
            success={!error}
            error={error}
            total={invoiceTotal}
            onNewInvoice={() => {
              setStep(1);
              setSelectedProducts([]);
              setCustomer(null);
              setTaxes([]);
            }}
          />
        )}
      </div>

      {/* Fixed Bottom Bar */}
      {step < 4 && (
        <InvoiceBar
          step={step}
          setStep={setStep}
          products={selectedProducts}
          total={invoiceTotal}
          canProceed={
            (step === 1 && selectedProducts.length > 0) ||
            (step === 2 && customer) ||
            step === 3
          }
        />
      )}
    </div>
  );
};

export default InvoiceCreation;