import { useState, useEffect, useRef } from 'react';

const GREETING_KEY = 'comet_greeted_v1';

const QUICK_ACTIONS = [
  { label: 'Artemis II brief', message: 'Give me a brief on Artemis II' },
  { label: "What's live now?", message: "What's live now on YouTube?" },
  { label: 'Latest official updates', message: 'What are the latest official updates?' },
  { label: 'Explore rockets', message: 'Tell me about rockets I can explore' },
  { label: 'Explore planets', message: 'Tell me about planets I can explore' },
];

const GREETING_MESSAGES = [
  {
    role: 'assistant',
    content: "SIGNAL ONLINE. I'm C.O.M.E.T., your Command Operations & Mission Event Technician.",
  },
  {
    role: 'assistant',
    content: 'Ask me about missions, rockets, spacecraft, live coverage, or what to explore next.',
  },
];

export default function CometWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const greeted = localStorage.getItem(GREETING_KEY);
    if (greeted) {
      setHasGreeted(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setMessages(GREETING_MESSAGES);
      localStorage.setItem(GREETING_KEY, 'true');
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(content) {
    if (!content.trim()) return;

    const userMessage = { role: 'user', content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/comet-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter((m) => m.role !== 'system'),
          context: {
            route: window.location.pathname,
          },
        }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);

        if (data.actions && data.actions.length > 0) {
          for (const action of data.actions) {
            if (action.type === 'NAVIGATE') {
              setTimeout(() => {
                window.location.href = action.to;
              }, 1500);
            } else if (action.type === 'OPEN_URL') {
              window.open(action.url, '_blank');
            }
          }
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'SIGNAL DISRUPTED. Unable to process request.' },
        ]);
      }
    } catch (error) {
      console.error('COMET chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'SIGNAL LOST. Connection to ship systems failed.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuickAction(message) {
    sendMessage(message);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const showQuickActions = messages.length <= 2 && !isLoading;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '2px solid rgba(34, 211, 238, 0.5)',
          boxShadow: isOpen
            ? '0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)'
            : '0 0 12px rgba(34, 211, 238, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.3s ease',
        }}
        aria-label="Open COMET assistant"
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#22d3ee',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            letterSpacing: '0.05em',
          }}
        >
          COMET
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: '100%',
            maxWidth: 420,
            height: '100vh',
            maxHeight: 600,
            background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 100%)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: '16px 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9998,
            boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 20px rgba(34, 211, 238, 0.2)',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(34, 211, 238, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#22d3ee',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  letterSpacing: '0.1em',
                  margin: 0,
                }}
              >
                C.O.M.E.T. CONSOLE
              </h2>
              <p
                style={{
                  fontSize: 10,
                  color: 'rgba(34, 211, 238, 0.7)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  margin: '4px 0 0 0',
                }}
              >
                SIGNAL: STABLE
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 20,
                cursor: 'pointer',
                padding: 4,
              }}
              aria-label="Close COMET console"
            >
              ×
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background:
                    msg.role === 'user'
                      ? 'rgba(34, 211, 238, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  border:
                    msg.role === 'user'
                      ? '1px solid rgba(34, 211, 238, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  color: msg.role === 'user' ? '#22d3ee' : 'rgba(255, 255, 255, 0.9)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {msg.content}
              </div>
            ))}

            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '12px 12px 12px 4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(34, 211, 238, 0.7)',
                  fontSize: 13,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                PROCESSING...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {showQuickActions && (
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(34, 211, 238, 0.1)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.message)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    background: 'rgba(34, 211, 238, 0.1)',
                    color: '#22d3ee',
                    fontSize: 11,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              padding: 16,
              borderTop: '1px solid rgba(34, 211, 238, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask C.O.M.E.T..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: '#fff',
                  fontSize: 13,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(34, 211, 238, 0.4)',
                  background: 'rgba(34, 211, 238, 0.2)',
                  color: '#22d3ee',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !input.trim() ? 0.5 : 1,
                }}
              >
                SEND
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
