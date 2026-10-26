"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
};

const INITIAL_PROMPTS = [
  "What mobile apps has Samuel built?",
  "Tell me about Creative Cube",
  "What is Samuel's backend stack?",
  "How can I contact Samuel for a project?",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 Hi! I am Samuel's AI Assistant. I have details on all 13+ production systems he has built, his engineering stack, and background. Feel free to ask me anything!",
      time: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend ?? input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "visitor_chat", message: text.trim() }),
      });

      const data = await res.json();
      const replyText = data.reply || "I couldn't process that right now. Feel free to contact Samuel directly at katosamuelraymondmarvinhosborn@gmail.com!";

      const aiMsg: Message = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "ai",
          text: "Connection issue. You can email Samuel directly at katosamuelraymondmarvinhosborn@gmail.com!",
          time: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-full shadow-xl hover:shadow-orange-500/10 transition-all cursor-pointer border border-zinc-700/80 hover:border-orange-500/50 text-xs font-semibold"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <span>{open ? "Close Assistant" : "Ask Samuel's AI ✨"}</span>
        </button>
      </div>

      {/* Clean Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] max-h-[580px] h-[75vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-orange-500">●</span> Samuel&apos;s Portfolio AI
                </h3>
                <p className="text-[11px] text-zinc-400">Knows all projects &amp; technical experience</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg text-xs cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      m.sender === "user"
                        ? "bg-orange-500 text-white rounded-br-none shadow-md shadow-orange-500/20"
                        : "bg-zinc-900 text-zinc-200 rounded-bl-none border border-zinc-800"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1 font-mono">{m.time}</span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs py-2 px-3 bg-zinc-900 rounded-xl w-fit border border-zinc-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 bg-zinc-900/60 border-t border-zinc-800/80 flex flex-wrap gap-1">
                {INITIAL_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-[10px] px-2.5 py-1 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full border border-zinc-800 transition-colors cursor-pointer text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Samuel's work..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white disabled:opacity-40 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm shadow-orange-500/20"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
