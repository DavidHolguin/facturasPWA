import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const ImageFromS3 = ({ imageUrl, alt }) => {
  const [error, setError] = useState(false);

  if (error || !imageUrl) {
    return <img src="/api/placeholder/400/320" alt={alt} className="w-full h-48 object-cover" />;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="w-full h-48 object-cover"
      onError={() => setError(true)}
    />
  );
};

const CompanyLogo = ({ logo, companyName = '', className = "" }) => {
  const [error, setError] = useState(false);

  if (error || !logo) {
    return (
      <div className={`w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-2 border-[#f7bb17] ${className}`}>
        <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
          {companyName ? companyName.charAt(0).toUpperCase() : '?'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={`Logo de ${companyName || 'la empresa'}`}
      className={`w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-lg ${className}`}
      onError={() => setError(true)}
    />
  );
};

const CompanyCategory = () => {
  const { categoryId } = useParams();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const companiesResponse = await axios.get(
          `https://backendfindout-ea692e018a66.herokuapp.com/api/companies/?category=${categoryId}`,
          config
        );

        setCompanies(companiesResponse.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(
          error.response?.status === 403
            ? 'No tienes permiso para acceder a esta información. Por favor, inicia sesión o contacta al administrador.'
            : 'Ha ocurrido un error al cargar los datos. Por favor, intenta de nuevo más tarde.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg shadow-md"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </motion.div>
      </div>
    );
  }

  // Get category name from the first company in the list
  const categoryName = companies[0]?.category?.name || 'Categoría';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6 text-[#f7bb17] dark:text-[#f7bb17]">
       {categoryName}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {companies.map(company => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden border border-[#f7bb17] dark:border-[#f7bb17] hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 rounded-lg"
          >
            <Link to={`/company/${company.id}`}>
              <div className="relative">
                <ImageFromS3
                  imageUrl={company.cover_photo_url}
                  alt={`${company.name} foto de portada`}
                />
                <CompanyLogo 
                  logo={company.profile_picture_url}
                  companyName={company.name}
                  className="absolute top-2 right-2 w-[55px] h-[55px]"
                />
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold leading-4 dark:text-white">{company.name}</h3>
                <p className="text-sm leading-4 text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{company.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CompanyCategory;