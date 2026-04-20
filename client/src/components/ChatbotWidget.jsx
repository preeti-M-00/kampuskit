import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2 } from 'lucide-react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm KampusKit's assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      setSessionId(data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not connect. Please try again later.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .chat-window {
          animation: fadeSlideUp 0.25s ease forwards;
        }
        .pulse-btn {
          animation: pulse-ring 2s infinite;
        }
        .dot1 { animation: bounce-dot 1.2s infinite 0ms; }
        .dot2 { animation: bounce-dot 1.2s infinite 150ms; }
        .dot3 { animation: bounce-dot 1.2s infinite 300ms; }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
      `}</style>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="chat-window"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '360px',
            height: '520px',
            background: 'linear-gradient(145deg, #1a0f3c, #0f0720)',
            borderRadius: '20px',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} color="white" />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: 0 }}>
                  KampusKit Assistant
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#4ade80',
                    }}
                  />
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>
                    Online
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              <Minimize2 size={14} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="chat-messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px',
                }}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={13} color="white" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius:
                      msg.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #6d28d9, #4c1d95)'
                        : msg.isError
                        ? 'rgba(239,68,68,0.15)'
                        : 'rgba(255,255,255,0.07)',
                    border:
                      msg.role === 'user'
                        ? 'none'
                        : msg.isError
                        ? '1px solid rgba(239,68,68,0.3)'
                        : '1px solid rgba(255,255,255,0.08)',
                    color: msg.isError ? '#fca5a5' : 'rgba(255,255,255,0.9)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={13} color="white" />
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <div className="dot1" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa' }} />
                  <div className="dot2" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa' }} />
                  <div className="dot3" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '12px',
                padding: '8px 12px',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '13px',
                  caretColor: '#a78bfa',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background:
                    input.trim() && !loading
                      ? 'linear-gradient(135deg, #6d28d9, #4c1d95)'
                      : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <Send size={13} color="white" />
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textAlign: 'center', margin: '6px 0 0' }}>
              Press Enter to send
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={!isOpen ? 'pulse-btn' : ''}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: isOpen
            ? 'linear-gradient(135deg, #374151, #1f2937)'
            : 'linear-gradient(135deg, #6d28d9, #4c1d95)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10000,
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 25px rgba(109,40,217,0.4)',
        }}
      >
        {isOpen ? <X size={20} color="white" /> : <MessageCircle size={22} color="white" />}
      </button>
    </>
  );
};

export default ChatbotWidget;
