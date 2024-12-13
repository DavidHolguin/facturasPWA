  import React, { useState, useEffect } from 'react';
  import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
  import Header from './components/Header';
  import CompanyLanding from './components/CompanyLanding';
  import Search from './components/Search';
  import Login from './components/Login';
  import Register from './components/Register';
  import MenuBar from './components/MenuBar';
  import Profile from './components/Profile';
  import Settings from './components/Settings';
  import CompanyCategory from './components/CompanyCategory';
  import ChatbotList from './components/ChatbotList';
  import ChatInterface from './components/ChatInterface';
  import InvoiceCreation from './components/invoice/InvoiceCreation';
  import ProductManagement from './components/ProductManagement';
  import InvoiceManager from './components/InvoiceManager';
  import InvoiceDashboard from './components/InvoiceDashboard';
  import PWAInstallPrompt from './components/PWAInstallPrompt';
  import InvoiceList from './components/InvoiceList';





  // Componente envoltorio para manejar la lógica de visualización
  const AppContent = ({ darkMode, toggleDarkMode }) => {
    const location = useLocation();
    const isChatbotRoute = location.pathname.startsWith('/chatbot/');
    const isCompanyRoute = location.pathname === '/company';

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {!isChatbotRoute && <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        <main className={`container mx-auto  text-gray-900 dark:text-white`}>
          <Routes>
            <Route path="/" element={<InvoiceCreation />} />
            <Route path="/company" element={<CompanyLanding />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/company-categories/:categoryId" element={<CompanyCategory />} />
            <Route path="/chatbots" element={<ChatbotList />} />
            <Route path="/chatbot/:id" element={<ChatInterface />} />
            <Route path="/productos" element={<ProductManagement />} />
            <Route path="/facturas" element={<InvoiceManager />} />
            <Route path="/facturas2" element={<InvoiceList />} />
            <Route path="/dashboard" element={<InvoiceDashboard />} />
          </Routes>
          <PWAInstallPrompt />
        </main>
        {!isChatbotRoute && !isCompanyRoute && <MenuBar />}
      </div>
    );
  };

  function App() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
      const isDarkMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, []);

    const toggleDarkMode = () => {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      localStorage.setItem('darkMode', newDarkMode);
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    return (
      <Router>
        <AppContent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </Router>
    );
  }

  export default App;