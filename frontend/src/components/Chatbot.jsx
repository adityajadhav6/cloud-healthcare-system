// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY = "caremate_chat_history";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I’m your CareMate assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

  // 🔹 Load previous chat from storage (same session / same browser)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load stored chat:", e);
    }
  }, []);

  // 🔹 Save chat history whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat:", e);
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setError("");
    const newMessages = [...messages, { sender: "user", text: trimmed }];
    setMessages(newMessages);
    setInput("");
    setIsSending(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        `${API_BASE}/api/chatbot`,
        { message: trimmed },
        { headers }
      );

      const reply =
        response.data.reply ||
        "I’m having trouble understanding that. Could you try rephrasing?";

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, something went wrong while contacting the assistant.",
        },
      ]);
      setError("Connection error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-3 rounded-full shadow-lg shadow-cyan-900/40 transition-transform duration-200 hover:scale-105"
      >
        <span className="text-xl">💬</span>
        <span className="hidden sm:inline">Ask CareMate</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[90vw] max-w-sm sm:max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-lg">
                🩺
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  CareMate Assistant
                </p>
                <p className="text-[11px] text-cyan-300">
                  Ask symptoms, medications, or appointments
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            className="
              flex-1 px-3 py-3 space-y-2 bg-slate-900/80 
              overflow-y-auto max-h-80 sm:max-h-96
            "
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="mr-2 mt-1 w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-xs text-white shrink-0">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-cyan-500 text-white rounded-br-none"
                      : "bg-slate-800 text-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="ml-2 mt-1 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white shrink-0">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isSending && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="animate-pulse">●</span>
                </div>
                <span>CareMate is thinking…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error message */}
          {error && (
            <div className="px-3 pb-1 text-[11px] text-red-300">{error}</div>
          )}

          {/* Input */}
          <div className="border-t border-slate-700 bg-slate-900 px-3 py-2">
            <div className="flex items-end space-x-2">
              <textarea
                rows={1}
                className="flex-1 resize-none bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
                placeholder="Describe your symptom or question... (Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isSending}
                className="shrink-0 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                ➤
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              This assistant does not replace professional medical advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
