import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, MapPin, Home, Download, Sun, Moon } from 'lucide-react';

const CustomSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
    <div className="w-11 h-6 bg-gray-200 rounded-full shadow-inner transition duration-200 ease-in-out">
      <div
        className={`bg-white w-4 h-4 rounded-full shadow transition transform duration-200 ease-in-out ${checked ? 'translate-x-5 bg-[#f7bb17] ' : ''}`}
      />
    </div>
  </label>
);

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: false,
    location: false,
    addresses: [],
  });
  const [newAddress, setNewAddress] = useState({
    state: '',
    city: '',
    street: '',
    references: '',
    postalCode: '',
  });
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      loadSettings();
    }
  }, [navigate]);

  const loadSettings = () => {
    const storedSettings = JSON.parse(localStorage.getItem('userSettings')) || {};
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setSettings(prevSettings => ({
      ...prevSettings,
      ...storedSettings,
      darkMode: isDarkMode,
    }));
    applyDarkMode(isDarkMode);
  };

  const saveSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
  };

  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggle = (setting) => {
    const newValue = !settings[setting];
    if (setting === 'darkMode') {
      localStorage.setItem('darkMode', newValue);
      applyDarkMode(newValue);
    }
    saveSettings({ [setting]: newValue });

    if (setting === 'notifications' && newValue) {
      requestNotificationPermission();
    }

    if (setting === 'location' && newValue) {
      requestLocationPermission();
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        saveSettings({ notifications: false });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      saveSettings({ notifications: false });
    }
  };

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          saveSettings({ location: true });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('No se pudo obtener tu ubicación. Por favor, verifica la configuración de tu navegador.');
          saveSettings({ location: false });
        }
      );
    } else {
      alert('La geolocalización no es compatible con tu navegador');
      saveSettings({ location: false });
    }
  };

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddAddress = () => {
    if (Object.values(newAddress).some(value => value.trim() !== '')) {
      saveSettings({ addresses: [...settings.addresses, newAddress] });
      setNewAddress({ state: '', city: '', street: '', references: '', postalCode: '' });
    }
  };

  const handleRemoveAddress = (index) => {
    const updatedAddresses = settings.addresses.filter((_, i) => i !== index);
    saveSettings({ addresses: updatedAddresses });
  };

  const handleDownloadApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      window.location.href = 'https://play.google.com/store/apps/details?id=your.app.id';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-lg p-6">
          {/* Header with inset icon */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-inner"></div>
              <div className="relative h-12 w-12 rounded-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
                <SettingsIcon size={24} className="text-gray-600 dark:text-gray-300" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h2>
          </div>

          <div className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                {settings.darkMode ? 
                  <Moon className="h-5 w-5 text-blue-500" /> :
                  <Sun className="h-5 w-5 text-yellow-500" />
                }
                <span className="text-gray-900 dark:text-white">Modo Oscuro</span>
              </div>
              <CustomSwitch
                checked={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
              />
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Bell className={`h-5 w-5 ${settings.notifications ? "text-blue-500" : "text-gray-400 dark:text-gray-500"}`} />
                <span className="text-gray-900 dark:text-white">Notificaciones</span>
              </div>
              <CustomSwitch
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
              />
            </div>

            {/* Location Toggle */}
            <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                <MapPin className={`h-5 w-5 ${settings.location ? "text-blue-500" : "text-gray-400 dark:text-gray-500"}`} />
                <span className="text-gray-900 dark:text-white">Ubicación</span>
              </div>
              <CustomSwitch
                checked={settings.location}
                onChange={() => handleToggle('location')}
              />
            </div>

            {/* Addresses Section */}
            <div className="space-y-4 pb-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-blue-500" />
                <span className="text-gray-900 dark:text-white">Direcciones de Entrega</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="state"
                  value={newAddress.state}
                  onChange={handleAddressChange}
                  placeholder="Estado"
                  className="p-2 border rounded-lg bg-white/50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  name="city"
                  value={newAddress.city}
                  onChange={handleAddressChange}
                  placeholder="Ciudad"
                  className="p-2 border rounded-lg bg-white/50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  name="street"
                  value={newAddress.street}
                  onChange={handleAddressChange}
                  placeholder="Dirección"
                  className="p-2 border rounded-lg bg-white/50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none col-span-2"
                />
                <input
                  type="text"
                  name="references"
                  value={newAddress.references}
                  onChange={handleAddressChange}
                  placeholder="Referencias adicionales"
                  className="p-2 border rounded-lg bg-white/50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none col-span-2"
                />
                <input
                  type="text"
                  name="postalCode"
                  value={newAddress.postalCode}
                  onChange={handleAddressChange}
                  placeholder="Código Postal"
                  className="p-2 border rounded-lg bg-white/50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleAddAddress}
                  className="p-2 bg-[#f7bb17]  hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  Agregar
                </button>
              </div>
              <div className="space-y-2">
                {settings.addresses.map((address, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <span className="text-gray-900 dark:text-white">
                      {address.street}, {address.city}, {address.state} {address.postalCode}
                    </span>
                    <button
                      onClick={() => handleRemoveAddress(index)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Download App Button */}
            <div className="pt-4">
              <button
                onClick={handleDownloadApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f7bb17]  hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                <Download size={20} />
                Descargar App
              </button>
            </div>
          </div>
        </div>

        {/* iOS Instructions Modal */}
        {showIOSInstructions && (
          <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Instalar en iOS</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-900 dark:text-white">
              <li>Abre esta página en Safari</li>
              <li>Toca el botón Compartir</li>
              <li>Desplázate hacia abajo y toca "Añadir a la pantalla de inicio"</li>
              <li>Toca "Añadir" en la esquina superior derecha</li>
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-4 px-4 py-2 bg-[#f7bb17]  hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
