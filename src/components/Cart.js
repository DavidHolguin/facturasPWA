// src/components/Cart.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    // Cargar los items del carrito desde el localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    const updatedCart = cartItems.map(item => 
      item.product.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const placeOrder = async () => {
    if (!user) {
      alert('Por favor, inicia sesión para realizar el pedido.');
      return;
    }

    const orderData = {
      company: cartItems[0].product.company, // Asumimos que todos los items son de la misma empresa
      items: cartItems.map(item => ({
        product: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    try {
      const response = await axios.post('https://backendfindout-ea692e018a66.herokuapp.com/api/orders/', orderData, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });
      alert('Pedido realizado con éxito!');
      setCartItems([]);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error al realizar el pedido:', error);
      alert('Hubo un error al realizar el pedido. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Carrito de Compras</h2>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.product.id} className="flex items-center justify-between border-b py-2">
              <div>
                <h3 className="font-semibold">{item.product.name}</h3>
                <p>Precio: ${item.product.price}</p>
              </div>
              <div className="flex items-center">
                <button onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))} className="px-2 py-1 bg-gray-200 rounded">-</button>
                <span className="mx-2">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                <button onClick={() => removeFromCart(item.product.id)} className="ml-4 text-red-500">Eliminar</button>
              </div>
            </div>
          ))}
          <div className="mt-4">
            <p className="font-bold">Total: ${cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2)}</p>
            <button onClick={placeOrder} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Realizar Pedido</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;