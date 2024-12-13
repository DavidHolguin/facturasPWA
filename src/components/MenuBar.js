import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, ReceiptText, MailSearch, Beef, Settings } from 'lucide-react';

const MenuBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isIconSwapped, setIsIconSwapped] = useState(false);
  
  useEffect(() => {
    setShowMenu(true);
    return () => setShowMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsIconSwapped(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 
      border-t border-gray-200 dark:border-gray-700 
      flex justify-around items-end px-4 py-2 shadow-lg 
      transition-all duration-500 ease-in-out
      ${showMenu ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
    >
      <Link
        to="/dashboard"
        className={`flex flex-col items-center w-16 transform transition-transform duration-300
          ${isActive('/dashboard') ? 'scale-105' : 'hover:scale-105'}`}
      >
        <LayoutDashboard size={20} className={`mb-1 ${
          isActive('/dashboard') 
            ? 'text-[#D50014] dark:text-[#D50014]' 
            : 'text-gray-600 dark:text-white hover:text-[#D50014] dark:hover:text-[#D50014]'
        }`} />
        <span className={`text-xs font-medium transition-colors duration-200 mb-1 ${
          isActive('/dashboard')
            ? 'text-[#D50014] dark:text-[#D50014]'
            : 'text-gray-600 dark:text-white'
        }`}>Dashboard</span>
      </Link>

      <Link
        to="/facturas"
        className={`flex flex-col items-center w-16 transform transition-transform duration-300
          ${isActive('/facturas') ? 'scale-105' : 'hover:scale-105'}`}
      >
        <ListOrdered size={20} className={`mb-1 ${
          isActive('/facturas')
            ? 'text-[#D50014] dark:text-[#D50014]'
            : 'text-gray-600 dark:text-white hover:text-[#D50014] dark:hover:text-[#D50014]'
        }`} />
        <span className={`text-xs font-medium transition-colors duration-200 mb-1 ${
          isActive('/facturas')
            ? 'text-[#D50014] dark:text-[#D50014]'
            : 'text-gray-600 dark:text-white'
        }`}>Facturas</span>
      </Link>

      <Link
        to="/"
        className="flex flex-col items-center pb-1 w-20 group"
      >
        <div className={`relative flex items-center justify-center w-14 h-14 -mt-5 mb-1
          bg-[#D50014] dark:bg-[#D50014] rounded-full shadow-lg 
          transform transition-all duration-300 
          ${isActive('/') ? 'scale-110 ring-4 ring-[#D50014]/30' : 'hover:scale-110'}
        `}>
          <div className="relative w-6 h-6">
            <ReceiptText
              size={24}
              className={`absolute inset-0 text-white transform transition-all duration-500 ease-in-out
                ${isIconSwapped ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
            />
            <MailSearch
              size={24}
              className={`absolute inset-0 text-white transform transition-all duration-500 ease-in-out
                ${isIconSwapped ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}`}
            />
          </div>
        </div>
      </Link>

      <Link
        to="/productos"
        className={`flex flex-col items-center w-16 transform transition-transform duration-300
          ${isActive('/productos') ? 'scale-105' : 'hover:scale-105'}`}
      >
        <Beef size={20} className={`mb-1 ${
          isActive('/productos')
            ? 'text-[#D50014] dark:text-[#D50014]'
            : 'text-gray-600 dark:text-white hover:text-[#D50014] dark:hover:text-[#D50014]'
        }`} />
        <span className={`text-xs font-medium transition-colors duration-200 mb-1 ${
          isActive('/productos')
            ? 'text-[#D50014] dark:text-[#D50014]'
            : 'text-gray-600 dark:text-white'
        }`}>Productos</span>
      </Link>

      <Link
        to="/settings"
        className={`flex flex-col items-center w-16 transform transition-transform duration-300
          ${isActive('/settings') ? 'scale-105' : 'hover:scale-105'}`}
      >
        <Settings size={20} className={`mb-1 ${
          isActive('/settings')
            ? 'text-[#D50014] dark:text-[#D50014]'
            : 'text-gray-600 dark:text-white hover:text-[#D50014] dark:hover:text-[#D50014]'
        }`} />
        <span className={`text-xs font-medium transition-colors duration-200 mb-1 ${
          isActive('/settings')
            ? 'text-[#D50014] dark:text-[#D50014]'
            : 'text-gray-600 dark:text-white'
        }`}>Ajustes</span>
      </Link>
    </div>
  );
};

export default MenuBar;