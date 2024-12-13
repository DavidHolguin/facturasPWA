import React, { useState, useEffect } from 'react';

const TaxSelector = ({ subtotal, onTaxesChange }) => {
  const [availableTaxes, setAvailableTaxes] = useState([]);
  const [selectedTaxes, setSelectedTaxes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/taxes/',
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch taxes');
      const data = await response.json();
      setAvailableTaxes(data);
    } catch (error) {
      console.error('Error fetching taxes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaxToggle = (tax) => {
    let updatedTaxes;
    if (selectedTaxes.some(t => t.id === tax.id)) {
      updatedTaxes = selectedTaxes.filter(t => t.id !== tax.id);
    } else {
      updatedTaxes = [...selectedTaxes, tax];
    }
    setSelectedTaxes(updatedTaxes);
    onTaxesChange(updatedTaxes);
  };

  const calculateTaxAmount = (percentage) => {
    return (subtotal * (percentage / 100)).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Impuestos</h3>
      <div className="space-y-2">
        {availableTaxes.map((tax) => (
          <div
            key={tax.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`tax-${tax.id}`}
                checked={selectedTaxes.some(t => t.id === tax.id)}
                onChange={() => handleTaxToggle(tax)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <label htmlFor={`tax-${tax.id}`} className="flex flex-col">
                <span className="font-medium">{tax.name}</span>
                <span className="text-sm text-gray-500">{tax.percentage}%</span>
              </label>
            </div>
            <div className="text-right">
              <div className="font-medium">
                ${calculateTaxAmount(tax.percentage)}
              </div>
              <div className="text-sm text-gray-500">
                Calculado del subtotal
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedTaxes.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-lg font-medium">
            <span>Total impuestos:</span>
            <span>
              ${selectedTaxes.reduce((acc, tax) => 
                acc + parseFloat(calculateTaxAmount(tax.percentage)), 
                0
              ).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {availableTaxes.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay impuestos disponibles
        </div>
      )}
    </div>
  );
};

export default TaxSelector;