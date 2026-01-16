import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OPS_KEY = process.env.VITE_OPS_KEY || 'starkid-ops-2024';

export default function SocialQueuePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const key = searchParams.get('key');
    if (key === OPS_KEY || key === 'starkid-ops-2024') {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authorized) return;

    async function fetchDrafts() {
      try {
        setLoading(true);
        const res = await fetch('/api/ai/comet-generate-post');
        const data = await res.json();
        setDrafts(data.drafts || []);
      } catch (e) {
        setError('Failed to load drafts');
        console.error('Drafts fetch error:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchDrafts();
  }, [authorized]);

  async function handleGenerateSample() {
    try {
      const res = await fetch('/api/ai/comet-generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: 'sample-1' }),
      });
      const data = await res.json();
      if (data.success) {
        setDrafts((prev) => [...data.drafts, ...prev]);
      }
    } catch (e) {
      console.error('Generate error:', e);
    }
  }

  function handleCopy(draft) {
    navigator.clipboard.writeText(draft.content);
    setCopiedId(draft.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleApprove(draftId) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, status: 'APPROVED' } : d))
    );
  }

  function getStatusColor(status) {
    switch (status) {
      case 'DRAFT':
        return { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' };
      case 'APPROVED':
        return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' };
      case 'POSTED':
        return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' };
      case 'FAILED':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' };
    }
  }

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
        }}
      >
        <div
          style={{
            padding: 40,
            borderRadius: 16,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#ef4444',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              marginBottom: 16,
            }}
          >
            ACCESS DENIED
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            Invalid or missing ops key
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#22d3ee',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          SOCIAL QUEUE
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          C.O.M.E.T. DRAFT MANAGEMENT • INTERNAL OPS
        </p>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <button
          onClick={handleGenerateSample}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid rgba(34, 211, 238, 0.4)',
            background: 'rgba(34, 211, 238, 0.2)',
            color: '#22d3ee',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            cursor: 'pointer',
          }}
        >
          GENERATE SAMPLE DRAFTS
        </button>
      </div>

      {loading && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#22d3ee',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          LOADING DRAFTS...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          ERROR: {error}
        </div>
      )}

      {!loading && !error && drafts.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          NO DRAFTS IN QUEUE
        </div>
      )}

      {!loading && !error && drafts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {drafts.map((draft) => {
            const statusColor = getStatusColor(draft.status);
            return (
              <div
                key={draft.id}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: statusColor.bg,
                      color: statusColor.text,
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      textTransform: 'uppercase',
                    }}
                  >
                    {draft.status}
                  </span>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(148, 163, 184, 0.2)',
                      color: '#94a3b8',
                      fontSize: 10,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      textTransform: 'uppercase',
                    }}
                  >
                    {draft.variant}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.4)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    {draft.platform.toUpperCase()}
                  </span>
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: 12,
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.9)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                    }}
                  >
                    {draft.content}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleCopy(draft)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'transparent',
                      color: copiedId === draft.id ? '#22c55e' : 'rgba(255,255,255,0.7)',
                      fontSize: 11,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedId === draft.id ? 'COPIED!' : 'COPY'}
                  </button>
                  {draft.status === 'DRAFT' && (
                    <button
                      onClick={() => handleApprove(draft.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#22c55e',
                        fontSize: 11,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        cursor: 'pointer',
                      }}
                    >
                      APPROVE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
