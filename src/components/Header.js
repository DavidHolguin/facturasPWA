import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if no token
      navigate('/login');
      return;
    }

    const fetchCompanies = async () => {
      try {
        const response = await fetch('https://facturaspwa-382a43a70547.herokuapp.com/api/marketplace/companies/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setCompanies(data);
        
        // Try to get saved company, otherwise default to company with ID 1
        let savedCompany = localStorage.getItem('selectedCompany');
        if (savedCompany) {
          savedCompany = JSON.parse(savedCompany);
        } else {
          // Find company with ID 1 or use the first company if no company with ID 1
          savedCompany = data.find(company => company.id === 1) || data[0];
        }
        
        setSelectedCompany(savedCompany);
        localStorage.setItem('selectedCompany', JSON.stringify(savedCompany));
      } catch (error) {
        console.error('Error fetching companies:', error);
        // If fetch fails, redirect to login
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchCompanies();
  }, [navigate]);

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    setIsSidebarOpen(false);
  };

  // Rest of the component remains the same as in the original code
  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={darkMode ? "/logoBlanco.png" : "/logo.png"} 
                alt="Logo" 
                className="h-8 w-auto" 
              />
              
              {/* Desktop Company Selector */}
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                {selectedCompany ? (
                  <>
                    <img 
                      src={selectedCompany.profile_picture_url || "/api/placeholder/32/32"} 
                      alt="" 
                      className="w-6 h-6 rounded-full" 
                    />
                    <span className="text-sm font-medium">{selectedCompany.name}</span>
                  </>
                ) : (
                  <span className="text-sm font-medium">Seleccionar empresa</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 md:hidden ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className={`absolute top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Seleccionar Empresa</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-2">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleCompanySelect(company)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
              >
                <img 
                  src={company.profile_picture_url || "/api/placeholder/32/32"} 
                  alt="" 
                  className="w-8 h-8 rounded-full" 
                />
                <div className="text-left">
                  <p className="text-sm font-medium">{company.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{company.nit}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;