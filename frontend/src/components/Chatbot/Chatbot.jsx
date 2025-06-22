import { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi 👋 How can I help you today?' }
  ]);

const messagesEndRef = useRef(null); 

useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
}, [messages, open]);
  const formatMessage = (content) => {
      return content
       .replace(/\*\*/g, '') // Remove bold markers
       .replace(/\s+/g, ' ') // Fix extra spaces
       .replace(/([,.!?])([^\s])/g, '$1 $2'); // Add space after punctuation
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      const formattedReply = formatMessage(data.reply);
      setMessages([...newMessages, { role: 'assistant', content: formattedReply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="relative focus:outline-none"
        >
          {/* Logo Container - Matches nav bar */}
          <div className="bg-purple-500 rounded-full p-2 shadow-lg">
            <img 
              src="/logo.jpeg" 
              alt="MoodConexus" 
              className="w-10 h-10 rounded-full"
            />
          </div>
          
          {/* Continuous Wave Circles */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-70 
            animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] -z-10"></div>
          <div className="absolute inset-0 rounded-full border-2 border-purple-300 opacity-50 
            animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] -z-20" 
            style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute inset-0 rounded-full border-2 border-purple-200 opacity-30 
            animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] -z-30" 
            style={{ animationDelay: '1s' }}></div>
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-40 right-6 w-80 h-96 bg-white border border-gray-200 shadow-xl rounded-xl flex flex-col z-40">
          {/* Header with purple background */}
          <div className="bg-purple-500 text-white p-3 rounded-t-xl flex items-center">
            <div className="w-8 h-8 rounded-full bg-white overflow-hidden mr-2 flex items-center justify-center">
              <img 
                src="/logo.jpeg" 
                alt="MoodConexus" 
                className="w-7 h-7 object-cover rounded-full"
              />
            </div>
            <h3 className="font-semibold">MoodConexus Assistant</h3>
            <button 
              onClick={() => setOpen(false)}
              className="ml-auto text-white hover:text-gray-200 text-xl"
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>
          
          {/* Messages area - White background */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className={`px-3 py-2 rounded-lg max-w-[75%] ${msg.role === 'user' ? 'bg-blue-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area - White background */}
          <div className="p-4 bg-white rounded-b-xl">
            <form onSubmit={handleSend} className="flex rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
              <input
                className="flex-1 px-4 py-2 focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                aria-label="Type your message"
              />
              <button 
                className="bg-purple-400 text-black px-4 hover:bg-purple-800 transition-colors"
                type="submit"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;