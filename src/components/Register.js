import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://backendfindout-ea692e018a66.herokuapp.com/api/register/', 
        { username, email, password },
        { withCredentials: true }
      );
      console.log('Registration successful:', response.data);
      navigate('/login');
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || 'Error en el registro. Por favor, inténtelo de nuevo.');
      } else if (error.request) {
        setError('No se recibió respuesta del servidor. Por favor, compruebe su conexión.');
      } else {
        setError('Error al enviar la solicitud. Por favor, inténtelo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8  bg-white dark:bg-gray-900 transition-colors duration-200">
      <form className="form" onSubmit={handleSubmit}>
        <div className="flex-column">
          <label className="text-gray-900 dark:text-white">Usuario</label>
        </div>
        <div className="inputForm dark:border-gray-700 dark:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 32 32" height="20" className="dark:text-gray-400">
            <g data-name="Layer 3" id="Layer_3">
              <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"/>
            </g>
          </svg>
          <input
            type="text"
            className="input dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="Ingresa tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex-column">
          <label className="text-gray-900 dark:text-white">Email</label>
        </div>
        <div className="inputForm dark:border-gray-700 dark:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="dark:text-gray-400">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
          </svg>
          <input
            type="email"
            className="input dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex-column">
          <label className="text-gray-900 dark:text-white">Contraseña</label>
        </div>
        <div className="inputForm dark:border-gray-700 dark:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="-64 0 512 512" height="20" className="dark:text-gray-400">
            <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"/>
            <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"/>
          </svg>
          <input
            type="password"
            className="input dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        <button 
          className="button-submit dark:hover:bg-primary-dark"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>

        <p className="p dark:text-white">
          ¿Ya tienes una cuenta? 
          <Link to="/login" className="span dark:text-primary">Inicia sesión</Link>
        </p>
      </form>

      <style jsx>{`
        .form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background-color: #ffffff;
          padding: 30px;
          width: 450px;
          border-radius: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .dark .form {
          background-color: #1f2937;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        .flex-column > label {
          color: #151717;
          font-weight: 600;
        }

        .dark .flex-column > label {
          color: #ffffff;
        }

        .inputForm {
          border: 1.5px solid #ecedec;
          border-radius: 10px;
          height: 50px;
          display: flex;
          align-items: center;
          padding-left: 10px;
          transition: 0.2s ease-in-out;
        }

        .dark .inputForm {
          border: 1.5px solid #374151;
        }

        .input {
          margin-left: 10px;
          border-radius: 10px;
          border: none;
          width: 100%;
          height: 100%;
        }

        .input:focus {
          outline: none;
        }

        .inputForm:focus-within {
          border: 1.5px solid #2d79f3;
        }

        .dark .inputForm:focus-within {
          border: 1.5px solid #f7bb17;
        }

        .button-submit {
          margin: 20px 0 10px 0;
          background-color: #f7bb17;
          border: none;
          color: white;
          font-size: 15px;
          font-weight: 500;
          border-radius: 10px;
          height: 50px;
          width: 100%;
          cursor: pointer;
        }

        .button-submit:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .dark .button-submit:disabled {
          background-color: #4b5563;
        }

        .p {
          text-align: center;
          color: black;
          font-size: 14px;
          margin: 5px 0;
        }

        .dark .p {
          color: white;
        }

        .span {
          font-size: 14px;
          margin-left: 5px;
          color: #2d79f3;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }

        .dark .span {
          color: #f7bb17;
        }

        .span:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Register;