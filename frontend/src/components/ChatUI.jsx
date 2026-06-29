import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, Loader2, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
    OPEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    VACANT: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    'UNDER PLANTATION': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    PLANTED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const statusColor = (s) =>
    STATUS_COLORS[s?.toUpperCase()] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';

// ── Individual Land Card ──────────────────────────────────────────────────────
const LandCard = ({ land, onNavigate }) => (
    <button
        onClick={() => onNavigate(`/lands/${land.id}`)}
        className="w-full text-left bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200 group cursor-pointer"
    >
        <div className="flex gap-3 p-2.5">
            {land.imageUrl ? (
                <img
                    src={land.imageUrl}
                    alt=""
                    className="w-14 h-14 object-cover rounded-lg shadow-sm shrink-0"
                />
            ) : (
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-2xl shrink-0">
                    🌿
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-[13px] text-slate-800 dark:text-white truncate leading-tight">{land.title}</span>
                    <ArrowRight size={13} className="shrink-0 mt-0.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{land.areaSqm} sqm</span>
                <div className="mt-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(land.status)}`}>
                        {land.status}
                    </span>
                </div>
            </div>
        </div>
        <div className="bg-emerald-500/0 group-hover:bg-emerald-500/5 px-2.5 py-1.5 border-t border-slate-200 dark:border-slate-600 flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">
            <ExternalLink size={11} />
            <span>View land details</span>
        </div>
    </button>
);

// ── Main ChatUI ───────────────────────────────────────────────────────────────
const ChatUI = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                text: "Hey! I'm your TerraSpotter AI 🌿\nAsk me to list your lands, get plant recommendations, or say something like \"tell me about Pune Green\"!"
            }]);
        }
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await axios.post(
                `${apiUrl}/api/chat`,
                {
                    message: userMsg,
                    history: messages.map(m => ({ role: m.role, text: m.text }))
                },
                { withCredentials: true }
            );

            const { reply, lands, redirectUrl } = response.data;
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: reply,
                lands: lands,
                redirectUrl: redirectUrl
            }]);

            // Auto-navigate after 2.5s if redirectUrl present
            if (redirectUrl) {
                setTimeout(() => navigate(redirectUrl), 2500);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "Sorry, I'm having trouble connecting to TerraSpotter right now. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">

            {/* ── Chat Window ── */}
            {isOpen && (
                <div className="w-80 sm:w-[22rem] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden mb-4 border border-emerald-100 dark:border-emerald-800/60 transition-all duration-300 flex flex-col">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <Bot size={22} />
                            <div>
                                <h3 className="font-semibold text-[15px] leading-tight">TerraSpotter AI</h3>
                                <p className="text-[10px] text-emerald-100/80">Your plantation assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="h-[24rem] overflow-y-auto p-3 flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/50 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[88%] rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-emerald-500 text-white rounded-br-none px-3.5 py-2.5'
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-none px-3.5 py-2.5'
                                }`}>

                                    {/* Message text — preserve newlines */}
                                    <p className="whitespace-pre-wrap">{msg.text}</p>

                                    {/* Land cards */}
                                    {msg.lands && msg.lands.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-3 -mx-0.5">
                                            {msg.lands.map(land => (
                                                <LandCard
                                                    key={land.id}
                                                    land={land}
                                                    onNavigate={(url) => { setIsOpen(false); navigate(url); }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Redirect button — shows if redirectUrl present (but NOT land detail — that's via card) */}
                                    {msg.redirectUrl && (!msg.lands || msg.lands.length === 0) && (
                                        <button
                                            onClick={() => { setIsOpen(false); navigate(msg.redirectUrl); }}
                                            className="mt-3 w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <span>Go there now</span>
                                            <ArrowRight size={13} />
                                        </button>
                                    )}

                                    {/* Land card with redirect button (single land from getLandByName) */}
                                    {msg.redirectUrl && msg.lands && msg.lands.length === 1 && (
                                        <button
                                            onClick={() => { setIsOpen(false); navigate(msg.redirectUrl); }}
                                            className="mt-2 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <span>Open full land page</span>
                                            <ExternalLink size={11} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick prompts */}
                    <div className="px-3 pt-2 pb-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                        {['My lands', 'Nearby lands', 'Report a land'].map(q => (
                            <button
                                key={q}
                                onClick={() => { setInput(q); inputRef.current?.focus(); }}
                                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors whitespace-nowrap cursor-pointer"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex gap-2"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 rounded-full text-sm outline-none transition-all dark:text-white placeholder:text-slate-400"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── FAB ── */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white p-4 rounded-full shadow-lg shadow-emerald-500/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
                {!isOpen && messages.length > 1 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                        {messages.filter(m => m.role === 'assistant').length}
                    </span>
                )}
            </button>
        </div>
    );
};

export default ChatUI;
