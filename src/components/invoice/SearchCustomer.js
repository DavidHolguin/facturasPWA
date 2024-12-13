// SearchCustomer.js
import React, { useState } from 'react';

const SearchCustomer = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchCustomers = async (searchQuery) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/customers/search/?q=${searchQuery}`,
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to search customers');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          searchCustomers(e.target.value);
        }}
        placeholder="Buscar cliente por nombre o documento..."
        className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {results.map((customer) => (
            <button
              key={customer.id}
              onClick={() => {
                onSelect(customer);
                setQuery('');
                setResults([]);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-gray-500">
                {customer.idType}: {customer.idNumber}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchCustomer;