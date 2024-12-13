// WeightSelector.js
import React, { useState } from 'react';

const WeightSelector = ({ product, onAdd }) => {
  const [customWeight, setCustomWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState(product.weight_unit);
  
  const commonWeights = [
    { label: '1/4 Libra', value: 125, unit: 'g' },
    { label: '1/2 Libra', value: 250, unit: 'g' },
    { label: '1 Libra', value: 500, unit: 'g' },
    { label: '1 Kilo', value: 1000, unit: 'g' },
  ];

  const handleCustomWeightAdd = () => {
    if (!customWeight) return;
    
    const weight = parseFloat(customWeight);
    if (isNaN(weight) || weight <= 0) return;

    onAdd({
      weight,
      unit: weightUnit,
      isCustom: true
    });
    setCustomWeight('');
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {commonWeights.map((weight) => (
          <button
            key={weight.label}
            onClick={() => onAdd(weight)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {weight.label}
          </button>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <input
          type="number"
          value={customWeight}
          onChange={(e) => setCustomWeight(e.target.value)}
          placeholder="Peso personalizado"
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
        <select
          value={weightUnit}
          onChange={(e) => setWeightUnit(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
        <button
          onClick={handleCustomWeightAdd}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Agregar
        </button>
      </div>
    </div>
  );
};

export default WeightSelector;