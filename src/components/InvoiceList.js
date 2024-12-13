import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No se encontró token de autenticación');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          'https://facturaspwa-382a43a70547.herokuapp.com/api/invoicing/invoices/', 
          {
            headers: { 
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Log completo de la respuesta para depuración
        console.log('Respuesta completa:', response);
        console.log('Datos de facturas:', response.data);

        // Asegurarse de manejar diferentes formatos de respuesta
        const invoiceData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.results || []);

        setInvoices(invoiceData);
        setLoading(false);
      } catch (error) {
        console.error('Error detallado:', error);
        
        // Manejo de diferentes tipos de errores
        setError(
          error.response?.data?.detail || 
          error.response?.data?.error || 
          error.message || 
          'Error al cargar las facturas'
        );
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Renderizado condicional
  if (loading) return <div>Cargando facturas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Lista de Facturas</h2>
      {invoices.length === 0 ? (
        <p>No se encontraron facturas</p>
      ) : (
        <ul>
          {invoices.map(invoice => (
            <li key={invoice.id}>
              Factura #{invoice.invoice_number} - Total: ${invoice.total}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InvoiceList;