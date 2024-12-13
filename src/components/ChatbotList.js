import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const ChatbotList = () => {
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const response = await fetch('https://influbot-1d8d03e5b676.herokuapp.com/api/chatbots/', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los chatbots');
        }

        const data = await response.json();
        const chatbotsWithTimestamp = await Promise.all(
          data
            .filter(chatbot => chatbot.is_active)
            .map(async ({ name, description, avatar, id }) => {
              try {
                const conversationResponse = await fetch(`https://influbot-1d8d03e5b676.herokuapp.com/api/chatbots/${id}/conversations/last/`);
                const conversationData = await conversationResponse.json();
                return {
                  name,
                  description,
                  avatar,
                  id,
                  lastUsed: conversationData.last_message_timestamp || null
                };
              } catch (error) {
                console.error(`Error fetching last message for chatbot ${id}:`, error);
                return {
                  name,
                  description,
                  avatar,
                  id,
                  lastUsed: null
                };
              }
            })
        );
        
        setChatbots(chatbotsWithTimestamp);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatbots();
  }, []);

  const handleChatbotClick = (chatbot) => {
    localStorage.setItem('lastActiveChat', JSON.stringify({
      chatbot,
      timestamp: new Date().toISOString(),
      conversationId: null
    }));
    navigate(`/chatbot/${chatbot.id}`, { state: { chatbot } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans pt-4 pb-10">
      <div className="mx-auto flex justify-between items-center pb-4">
        <h2 className="text-xl font-bold text-[#121445] dark:text-white">
          ChatBots
        </h2>
        <button 
          onClick={() => navigate('/chatbots')} 
          className="px-4 py-2 text-sm font-medium text-[#121445] dark:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
        >
          Ver más
        </button>
      </div>

      <div className="grid gap-2">
        {chatbots.map((chatbot) => (
          <div
            key={chatbot.id}
            onClick={() => handleChatbotClick(chatbot)}
            className="group relative overflow-hidden rounded-xl backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#f7bb17]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center px-4 py-3 gap-4">
              {/* Avatar container with fixed dimensions */}
              <div className="flex-shrink-0 w-16 h-16">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#f7bb17] shadow-lg">
                  <img
                    src={chatbot.avatar || "/api/placeholder/64/64"}
                    alt={chatbot.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content container with flex-grow */}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-[#121445] dark:text-white truncate">
                  {chatbot.name}
                </h3>
                <p className="text-sm text-gray-600 leading-4	 dark:text-gray-300 line-clamp-2 h-10">
                  {chatbot.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatbotList;