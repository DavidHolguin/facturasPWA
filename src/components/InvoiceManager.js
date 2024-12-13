import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Edit, Trash2, Plus, Grid, List, Calendar, Search, Filter, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch, onFilterChange, isFilterOpen, toggleFilter }) => (
  <div className="flex flex-col w-full gap-3">
    <div className="relative flex w-full">
      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar facturas..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => onSearch(e.target.value)}
      />
      <button
        onClick={toggleFilter}
        className="ml-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
      >
        <Filter className="w-4 h-4" />
      </button>
    </div>
    {isFilterOpen && (
      <div className="flex gap-2 w-full">
        <input
          type="date"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => onFilterChange('startDate', e.target.value)}
        />
        <input
          type="date"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => onFilterChange('endDate', e.target.value)}
        />
      </div>
    )}
  </div>
);

const ViewToggle = ({ currentView, onViewChange }) => (
  <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
    <button
      onClick={() => onViewChange('grid')}
      className={`p-1.5 rounded ${currentView === 'grid' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
    >
      <Grid className="w-4 h-4" />
    </button>
    <button
      onClick={() => onViewChange('list')}
      className={`p-1.5 rounded ${currentView === 'list' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
    >
      <List className="w-4 h-4" />
    </button>
  </div>
);

const InvoiceCard = ({ invoice, onDownload }) => (
  <div className="p-4 sm:p-6 rounded-xl bg-white shadow hover:shadow-lg transition-all">
    <div className="flex justify-between items-start gap-2 mb-3">
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-lg font-semibold truncate">#{invoice.invoice_number}</h3>
        <p className="text-sm text-gray-600 truncate">{invoice.customer__first_name} {invoice.customer__last_name}</p>
      </div>
      <button 
        onClick={() => onDownload(invoice.invoice_number)}
        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Total:</span>
        <span className="font-semibold">${invoice.total?.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Fecha:</span>
        <span className="text-sm">{new Date(invoice.timestamp).toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Estado:</span>
        <span className={`px-2 py-1 rounded-full text-xs ${
          invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
          invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {invoice.status}
        </span>
      </div>
    </div>
  </div>
);

const InvoiceRow = ({ invoice, onDownload }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm">{invoice.invoice_number}</td>
    <td className="px-3 py-3 sm:px-6 sm:py-4 text-sm max-w-[120px] sm:max-w-none">
      <div className="truncate">{invoice.customer__first_name} {invoice.customer__last_name}</div>
    </td>
    <td className="px-3 py-3 sm:px-6 sm:py-4 text-sm">${invoice.total?.toLocaleString()}</td>
    <td className="px-3 py-3 sm:px-6 sm:py-4">
      <span className={`px-2 py-1 rounded-full text-xs ${
        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
        invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {invoice.status}
      </span>
    </td>
    <td className="px-3 py-3 sm:px-6 sm:py-4 text-sm">{new Date(invoice.timestamp).toLocaleDateString()}</td>
    <td className="px-3 py-3 sm:px-6 sm:py-4">
      <div className="flex gap-1 sm:gap-2 justify-end">
        <button 
          onClick={() => onDownload(invoice.invoice_number)}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

const InvoiceManager = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', company_id: null });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem('token');
      const selectedCompanyStr = localStorage.getItem('selectedCompany');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const selectedCompany = selectedCompanyStr ? JSON.parse(selectedCompanyStr) : null;
        const companyId = selectedCompany ? selectedCompany.id : null;

        const config = {
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          params: { 
            company_id: companyId 
          }
        };

        // Use dashboard endpoint to fetch invoices
        const { data } = await axios.get(
          'https://facturaspwa-382a43a70547.herokuapp.com/api/invoicing/invoices/dashboard/', 
          config
        );

        // Assuming the dashboard response has a 'recent_activity' or similar field with invoice details
        const invoiceList = data.recent_activity || [];
        setInvoices(invoiceList);
        setFilters(prev => ({ ...prev, company_id: companyId }));
      } catch (error) {
        setError(error.response?.data?.detail || 'Error al cargar las facturas');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [navigate]);

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const handleDownload = async (invoiceNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://facturaspwa-382a43a70547.herokuapp.com/api/invoicing/invoices/${invoiceNumber}/download/`, 
        {
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura_${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error de descarga:', error);
      alert('No se pudo descargar la factura');
    }
  };

  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch = searchTerm === '' || 
        invoice.invoice_number.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${invoice.customer__first_name} ${invoice.customer__last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const invoiceDate = new Date(invoice.timestamp);
      const matchesDateRange = (!filters.startDate || invoiceDate >= new Date(filters.startDate)) &&
        (!filters.endDate || invoiceDate <= new Date(filters.endDate));

      return matchesSearch && matchesDateRange;
    });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="text-center p-6 text-red-600">{error}</div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Facturas</h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items:items-center gap-4">
        <SearchBar 
          onSearch={handleSearch} 
          onFilterChange={handleFilterChange}
          isFilterOpen={isFilterOpen}
          toggleFilter={toggleFilter}
        />
        <ViewToggle currentView={view} onViewChange={setView} />
      </div>

      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map(invoice => (
            <InvoiceCard
              key={invoice.invoice_number}
              invoice={invoice}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factura</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map(invoice => (
                <InvoiceRow
                  key={invoice.invoice_number}
                  invoice={invoice}
                  onDownload={handleDownload}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;