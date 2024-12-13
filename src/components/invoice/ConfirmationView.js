// ConfirmationView.js
import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

const ConfirmationView = ({ success, error, total, onNewInvoice }) => {
  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className={`
        w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6
        ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
      `}>
        {success ? (
          <Check size={32} />
        ) : (
          <AlertTriangle size={32} />
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-2">
        {success ? '¡Factura creada con éxito!' : 'Error al crear la factura'}
      </h2>
      
      {success && (
        <div className="text-gray-600 mb-8">
          <p>La factura por ${total.toFixed(2)} ha sido generada correctamente.</p>
          <p>Se ha enviado una copia al correo del cliente.</p>
        </div>
      )}

      {error && (
        <div className="text-red-600 mb-8">
          <p>{error}</p>
          <p>Por favor, intenta nuevamente.</p>
        </div>
      )}

      <div className="space-x-4">
        <button
          onClick={onNewInvoice}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Nueva Factura
        </button>
      </div>
    </div>
  );
};

export default ConfirmationView;