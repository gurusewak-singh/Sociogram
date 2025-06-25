//frontend/src/pages/MessagesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useAppSelector } from '../hooks/reduxHooks';
import { FaPaperPlane } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';

const MessagesPage = () => {
  const { id: receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user: currentUser } = useAppSelector(state => state.auth);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  // Effect for fetching initial messages
  useEffect(() => {
    if (receiverId) {
      api.get(`/messages/${receiverId}`).then(res => {
        setMessages(res.data);
      });
    }
  }, [receiverId]);

  // Effect for Socket.IO
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        // Check if the message belongs to the current chat
        if (newMessage.senderId === receiverId || (newMessage.senderId === currentUser?._id && newMessage.receiverId === receiverId)) {
          setMessages(prevMessages => [...prevMessages, newMessage]);
        }
      };

      socket.on('newMessage', handleNewMessage);

      // Clean up the listener on component unmount or when the socket changes
      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [socket, receiverId, currentUser?._id]);
  
  // Effect for scrolling to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post(`/messages/send/${receiverId}`, { message: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
        {/* Chat Header would go here */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg._id} className={`flex ${msg.senderId === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === currentUser?._id ? 'save-button text-white' : 'bg-neutral-200 text-neutral-800'}`}>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
           <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-neutral-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="save-button text-white p-3 rounded-full hover:bg-primary-700">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;