import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';

const ChatUI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'assistant', text: "Hey, ready to grow something green today? 🌿" }]);
        }
    }, [isOpen, messages.length]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await axios.post(`${apiUrl}/api/chat`, 
                { message: userMsg },
                { withCredentials: true }
            );

            setMessages(prev => [...prev, { role: 'assistant', text: response.data.reply, lands: response.data.lands }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I am having trouble connecting to the TerraSpotter backend right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden mb-4 border border-emerald-100 dark:border-emerald-800 transition-all duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Bot size={24} />
                            <h3 className="font-semibold text-lg tracking-wide">TerraSpotter AI</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="h-96 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-none'}`}>
                                    {msg.text}
                                    
                                    {msg.lands && msg.lands.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-3 w-full">
                                            {msg.lands.map(land => (
                                                <div key={land.id} className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-xl flex gap-3 items-center border border-slate-200 dark:border-slate-600 w-full min-w-[200px]">
                                                    {land.imageUrl ? (
                                                        <img src={land.imageUrl} alt={land.title} className="w-14 h-14 object-cover rounded-lg shadow-sm" />
                                                    ) : (
                                                        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                                                            🌿
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="font-semibold text-sm dark:text-white truncate" title={land.title}>{land.title}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">Area: {land.areaSqm} sqm</span>
                                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">{land.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700">
                                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your land..."
                                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 rounded-full text-sm outline-none transition-all dark:text-white"
                                disabled={loading}
                            />
                            <button 
                                type="submit" 
                                disabled={loading || !input.trim()}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white p-2.5 rounded-full transition-colors flex items-center justify-center"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white p-4 rounded-full shadow-lg shadow-emerald-500/40 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
};

export default ChatUI;
