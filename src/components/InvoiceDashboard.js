import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  Users, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown,
  Moon,
  Sun 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const InvoiceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);

  // Fetch dashboard data (previous implementation remains the same)
  useEffect(() => {
    const selectedCompanyStr = localStorage.getItem('selectedCompany');
    const token = localStorage.getItem('token');
    
    if (selectedCompanyStr) {
      try {
        const selectedCompany = JSON.parse(selectedCompanyStr);
        setCompanyId(selectedCompany.id);
      } catch (parseError) {
        console.error('Error parsing company from localStorage:', parseError);
      }
    }

    const fetchDashboardData = async () => {
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          'https://facturaspwa-382a43a70547.herokuapp.com/api/invoicing/invoices/dashboard/', 
          {
            headers: { 
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            },
            params: {
              company_id: companyId
            }
          }
        );
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
        setError(
          error.response?.data?.error || 
          error.message || 
          'Error fetching dashboard data'
        );
        setLoading(false);
      }
    };

    if (companyId) {
      fetchDashboardData();
    }
  }, [companyId]);

  // Prepare chart data
  const chartData = dashboardData?.monthly_invoices_breakdown?.map(item => ({
    name: item.month,
    invoices: item.total_amount
  })) || [];

  // Filtering and searching logic
  const filteredTopCustomers = dashboardData?.top_customers?.filter(customer => 
    customer.customer__first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer__last_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredRecentActivity = dashboardData?.recent_activity?.filter(activity => 
    activity.invoice_number.toString().includes(searchTerm) ||
    activity.customer__first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.customer__last_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading) return (
    <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="animate-pulse">Cargando panel...</div>
    </div>
  );

  if (error) return (
    <div className={`${darkMode ? 'bg-gray-900 text-red-500' : 'bg-white text-red-600'} p-4`}>
      Error: {error}
    </div>
  );

  if (!dashboardData) return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} p-4`}>
      No hay datos disponibles
    </div>
  );

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen p-4 sm:p-6 space-y-4 sm:space-y-6`}>
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={toggleDarkMode} 
          className={`p-2 rounded-full transition-colors ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {/* Dashboard Header - Now responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-4 sm:mb-0`}>
          Panel de Facturas
        </h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full sm:w-auto ${
                darkMode 
                  ? 'bg-gray-800 text-white focus:ring-blue-500' 
                  : 'bg-gray-100 text-black focus:ring-blue-300'
              } p-2 pl-10 rounded-lg focus:outline-none focus:ring-2`}
            />
            <Search className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <div className="relative w-full sm:w-auto">
            <button 
              className={`w-full sm:w-auto ${
                darkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              } p-2 rounded-lg flex items-center justify-center`}
              onClick={() => setActiveFilter(prev => prev === 'all' ? 'recent' : 'all')}
            >
              <Filter className="mr-2" />
              {activeFilter === 'all' ? 'Todos' : 'Recientes'}
              <ChevronDown className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid - Now responsive with 1 column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Invoices Card */}
        <div className={`rounded-2xl p-4 sm:p-6 transform transition-all hover:scale-105 ${
          darkMode 
            ? 'bg-gray-800 backdrop-blur-sm bg-opacity-50' 
            : 'bg-gray-100 shadow-md'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <FileText className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={32} />
            <h3 className="text-lg sm:text-xl font-semibold">Total Facturas</h3>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {dashboardData.total_invoices}
          </p>
        </div>

        {/* Total Amount Card */}
        <div className={`rounded-2xl p-4 sm:p-6 transform transition-all hover:scale-105 ${
          darkMode 
            ? 'bg-gray-800 backdrop-blur-sm bg-opacity-50' 
            : 'bg-gray-100 shadow-md'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <DollarSign className={darkMode ? 'text-green-400' : 'text-green-600'} size={32} />
            <h3 className="text-lg sm:text-xl font-semibold">Monto Total</h3>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            ${dashboardData.total_amount?.toLocaleString() || 0}
          </p>
        </div>

        {/* Overdue Invoices Card */}
        <div className={`rounded-2xl p-4 sm:p-6 transform transition-all hover:scale-105 ${
          darkMode 
            ? 'bg-gray-800 backdrop-blur-sm bg-opacity-50' 
            : 'bg-gray-100 shadow-md'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <AlertTriangle className="text-red-500" size={32} />
            <h3 className="text-lg sm:text-xl font-semibold">Facturas Vencidas</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-500">{dashboardData.overdue}</p>
        </div>
      </div>

      {/* Charts and Detailed Views - Now responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Monthly Invoices Line Chart */}
        <div className={`rounded-2xl p-4 sm:p-6 ${
          darkMode 
            ? 'bg-gray-800 backdrop-blur-sm bg-opacity-50' 
            : 'bg-gray-100 shadow-md'
        }`}>
          <div className="flex items-center mb-4">
            <Calendar className={darkMode ? 'text-blue-400 mr-3' : 'text-blue-600 mr-3'} />
            <h3 className="text-lg sm:text-xl font-semibold">Tendencia Mensual</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="name" 
                stroke={darkMode ? '#888' : '#666'} 
              />
              <YAxis 
                stroke={darkMode ? '#888' : '#666'} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#f3f4f6', 
                  color: darkMode ? 'white' : 'black' 
                }} 
                labelStyle={{ color: darkMode ? 'white' : 'black' }}
              />
              <Line 
                type="monotone" 
                dataKey="invoices" 
                stroke={darkMode ? '#3B82F6' : '#2563EB'} 
                strokeWidth={3} 
                dot={{ r: 6, fill: darkMode ? '#3B82F6' : '#2563EB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers */}
        <div className={`rounded-2xl p-4 sm:p-6 ${
          darkMode 
            ? 'bg-gray-800 backdrop-blur-sm bg-opacity-50' 
            : 'bg-gray-100 shadow-md'
        }`}>
          <div className="flex items-center mb-4">
            <Users className={darkMode ? 'text-blue-400 mr-3' : 'text-blue-600 mr-3'} />
            <h3 className="text-lg sm:text-xl font-semibold">Mejores Clientes</h3>
          </div>
          <ul className="space-y-3">
            {filteredTopCustomers.slice(0, 5).map((customer, index) => (
              <li 
                key={index} 
                className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <span>{customer.customer__first_name} {customer.customer__last_name}</span>
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-green-500" size={16} />
                  <span>${customer.total_amount?.toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6 ${
        darkMode 
          ? 'bg-gray-800 backdrop-blur-sm bg-opacity-50' 
          : 'bg-gray-100 shadow-md'
      }`}>
        <div className="flex items-center mb-4">
          <Clock className={darkMode ? 'text-blue-400 mr-3' : 'text-blue-600 mr-3'} />
          <h3 className="text-lg sm:text-xl font-semibold">Actividad Reciente</h3>
        </div>
        <ul className="space-y-3">
          {filteredRecentActivity.slice(0, 10).map((activity, index) => (
            <li 
              key={index} 
              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center mb-2 sm:mb-0">
                <FileText className={`mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span>Factura #{activity.invoice_number}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <span className="mr-0 sm:mr-4 mb-2 sm:mb-0">
                  {activity.customer__first_name} {activity.customer__last_name}
                </span>
               </div>
               
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-green-500" size={16} />
                  <span>${activity.total?.toLocaleString()}</span>
                  <span className={`ml-4 px-2 py-1 rounded-full text-xs font-bold ${
                    activity.status === 'Paid' 
                      ? (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-200 text-green-700')
                      : activity.status === 'Pending' 
                      ? (darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-200 text-yellow-700')
                      : (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-200 text-red-700')
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
  
  );
};

export default InvoiceDashboard;