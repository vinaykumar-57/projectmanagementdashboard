import { useState, useRef, useEffect } from "react";
import { Send, Bot, X, Maximize2, Minimize2, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { aiService } from "../services/ai";
import { useSelector } from "react-redux";

export default function AIChatBot({ project }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: `Hi! I'm your Fizz AI assistant. I'm ready to help you plan "${project?.name}". What's on your mind?` }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    const tasks = project?.tasks || [];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (text) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const newMessages = [...messages, { role: "user", content: messageText }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const context = `
                Project: ${project.name}
                Description: ${project.description || "No description"}
                Tasks: ${tasks.map(t => `${t.title} (${t.status})`).join(", ")}
            `;
            const response = await aiService.generateContent(messageText, context);
            setMessages([...newMessages, { role: "assistant", content: response }]);
        } catch (error) {
            setMessages([...newMessages, { role: "assistant", content: "Sorry, I hit a snag. Please check your connection or try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "Suggest a project roadmap",
        "Generate 3 next tasks",
        "Analyze my current progress",
        "Give me ideas for due dates"
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition-all hover:scale-110 z-[100] group"
            >
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </div>
                <Bot size={24} />
                <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
                    Need help planning?
                </span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-96 max-h-[600px] h-[80vh] flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[100] transition-all duration-300 transform ${isMinimized ? "h-14 translate-y-[calc(100%-3.5rem)]" : ""}`}>
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Bot className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Fizz Assistant</h3>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" /> Gemini AI Powered
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-red-500">
                        <X className="size-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-tl-none border dark:border-zinc-800"}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-2xl rounded-tl-none border dark:border-zinc-800">
                                    <Loader2 className="size-4 animate-spin text-blue-500" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Suggestions */}
                    {messages.length < 3 && !isLoading && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2">
                            {suggestions.map((s, i) => (
                                <button key={i} onClick={() => handleSend(s)} className="text-[10px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 rounded-full hover:border-blue-500 transition-colors flex items-center gap-1.5">
                                    <Sparkles size={10} className="text-blue-500" /> {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="relative">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Ask about your project..."
                                className="w-full pl-4 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-30 transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
