// src/components/ChatWidget.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { sendChatMessage } from '../services/api';

const ChatWidget = ({
  title = 'Librario Assistant',
  subtitle,
  launcherLabel = 'Need help? Chat with Librario',
  accentColor,
}) => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Welcome message per role
  useEffect(() => {
    if (user) {
      const role = user.role;
      const welcomeText =
        role === 'ADMIN'
          ? 'Ask about dashboard stats, users, membership requests, fines, and notifications.'
          : role === 'LIBRARIAN'
          ? 'Ask about books, borrowing, student requests, fines, and notifications you manage.'
          : 'Ask about your borrowed books, due dates, membership, fines, and available books.';

      setMessages([
        {
          from: 'bot',
          text: `Hi ${user.name || ''}! ${welcomeText}`,
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [user]);

  // Auto‑scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!user) return null;
  const role = user.role;

  const roleBadge =
    role === 'ADMIN'
      ? 'Admin Assistant'
      : role === 'LIBRARIAN'
      ? 'Librarian Assistant'
      : 'Student Assistant';

  const roleColor =
    role === 'ADMIN'
      ? '#f97373'
      : role === 'LIBRARIAN'
      ? '#38bdf8'
      : '#34d399';

  const effectiveAccent = accentColor || roleColor;

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { from: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { reply } = await sendChatMessage({
        message: text,
        role: user.role,
        name: user.name,
        email: user.email,
      });

      setMessages([
        ...newMessages,
        { from: 'bot', text: reply || 'Sorry, I could not generate an answer.' },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          from: 'bot',
          text: 'Sorry, something went wrong while contacting the assistant.',
        },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bigger, more visible launcher */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            borderRadius: '999px',
            padding: '12px 20px',
            border: 'none',
            background:
              'linear-gradient(135deg, #22c55e, #0ea5e9, #6366f1)',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 14px 32px rgba(15,23,42,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          title="Open Librario Assistant"
        >
          <span
            style={{
              height: '32px',
              width: '32px',
              borderRadius: '999px',
              backgroundColor: 'rgba(15,23,42,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            💬
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>
            {launcherLabel}
          </span>
        </button>
      )}

      {/* Larger chat window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '420px',
            maxWidth: '95vw',
            height: '560px',
            background:
              'radial-gradient(circle at top left, #020617, #020617 45%, #020617)',
            borderRadius: '18px',
            boxShadow: '0 24px 60px rgba(15,23,42,0.9)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            border: '1px solid rgba(148,163,184,0.25)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px',
              background:
                'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(56,189,248,0.12), rgba(99,102,241,0.12))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(30,64,175,0.45)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    height: '32px',
                    width: '32px',
                    borderRadius: '999px',
                    background:
                      'conic-gradient(from 180deg, #22c55e, #0ea5e9, #6366f1, #22c55e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                    boxShadow: '0 0 0 2px rgba(15,23,42,0.85)',
                  }}
                >
                  LA
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    right: '-1px',
                    height: '9px',
                    width: '9px',
                    borderRadius: '999px',
                    backgroundColor: '#22c55e',
                    boxShadow: '0 0 0 2px #020617',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {title}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'rgba(148,163,184,0.9)',
                  }}
                >
                  {subtitle ||
                    `${roleBadge} · Ask about your library, books, and dashboard.`}
                </span>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              style={{
                borderRadius: '999px',
                border: '1px solid rgba(148,163,184,0.6)',
                height: '24px',
                width: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(226,232,240,0.9)',
                background: 'rgba(15,23,42,0.9)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '10px',
              overflowY: 'auto',
              fontSize: '13px',
              background:
                'radial-gradient(circle at top, #020617, #020617 55%, #020617)',
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  color: 'rgba(148,163,184,0.9)',
                  fontSize: '12px',
                  background: 'rgba(15,23,42,0.9)',
                  borderRadius: '12px',
                  padding: '8px 10px',
                  border: '1px dashed rgba(71,85,105,0.85)',
                }}
              >
                Ask about books, your borrowed items, fines, requests, or
                dashboard stats depending on your role.
              </div>
            )}

            {messages.map((m, idx) => {
              const isUser = m.from === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '8px 10px',
                      borderRadius: '14px',
                      border: isUser
                        ? `1px solid ${effectiveAccent}`
                        : '1px solid rgba(51,65,85,0.9)',
                      background: isUser
                        ? 'linear-gradient(135deg, #22c55e, #0ea5e9)'
                        : 'rgba(15,23,42,0.95)',
                      color: isUser
                        ? 'white'
                        : 'rgba(226,232,240,0.95)',
                      whiteSpace: 'pre-wrap',
                      borderBottomRightRadius: isUser ? '4px' : '14px',
                      borderBottomLeftRadius: isUser ? '14px' : '4px',
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: 'rgba(148,163,184,0.9)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  borderRadius: '999px',
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(51,65,85,0.9)',
                }}
              >
                <span>Assistant is thinking…</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            style={{
              borderTop: '1px solid rgba(30,64,175,0.5)',
              padding: '8px 8px 10px',
              background:
                'linear-gradient(to top, rgba(15,23,42,0.98), rgba(15,23,42,0.95))',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
              }}
            >
              <span
                style={{
                  borderRadius: '999px',
                  padding: '3px 8px',
                  border: `1px solid ${effectiveAccent}`,
                  color: effectiveAccent,
                  backgroundColor: 'rgba(15,23,42,0.95)',
                }}
              >
                ● {roleBadge}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                style={{
                  flex: 1,
                  borderRadius: '999px',
                  border: '1px solid rgba(51,65,85,0.9)',
                  padding: '7px 11px',
                  fontSize: '13px',
                  color: 'rgba(226,232,240,0.95)',
                  backgroundColor: 'rgba(15,23,42,0.95)',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  borderRadius: '999px',
                  border: 'none',
                  padding: '7px 14px',
                  background:
                    'linear-gradient(135deg, #22c55e, #0ea5e9, #6366f1)',
                  color: 'white',
                  cursor:
                    loading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  opacity: loading || !input.trim() ? 0.6 : 1,
                }}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
