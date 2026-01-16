import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SocialQueuePage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [opsKey, setOpsKey] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [previewDraft, setPreviewDraft] = useState(null);
  const [schedulingDraft, setSchedulingDraft] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => setLockoutSeconds(lockoutSeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutSeconds]);

  async function handleAuth() {
    if (!opsKey.trim()) {
      setAuthError('Enter ops key');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/ops/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OPS-KEY': opsKey.trim(),
        },
      });

      const data = await res.json();

      if (data.authorized) {
        setAuthorized(true);
        sessionStorage.setItem('ops_session', opsKey.trim());
      } else {
        setAuthError(data.message || 'Access denied');
        if (data.waitSeconds) {
          setLockoutSeconds(data.waitSeconds);
        }
      }
    } catch (e) {
      setAuthError('Connection failed');
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    const savedKey = sessionStorage.getItem('ops_session');
    if (savedKey) {
      setOpsKey(savedKey);
      fetch('/api/ops/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OPS-KEY': savedKey,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authorized) {
            setAuthorized(true);
          } else {
            sessionStorage.removeItem('ops_session');
            setLoading(false);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

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

  function handleSchedule(draftId) {
    const draft = drafts.find(d => d.id === draftId);
    setSchedulingDraft(draft);
    setScheduleDate('');
  }

  function handleConfirmSchedule() {
    if (!schedulingDraft || !scheduleDate) return;
    setDrafts((prev) =>
      prev.map((d) => 
        d.id === schedulingDraft.id 
          ? { ...d, status: 'SCHEDULED', scheduled_for: scheduleDate } 
          : d
      )
    );
    setSchedulingDraft(null);
    setScheduleDate('');
  }

  function handlePreview(draft) {
    setPreviewDraft(draft);
  }

  function getStatusColor(status) {
    switch (status) {
      case 'DRAFT':
        return { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' };
      case 'APPROVED':
        return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' };
      case 'SCHEDULED':
        return { bg: 'rgba(168, 85, 247, 0.2)', text: '#a855f7' };
      case 'POSTED':
        return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' };
      case 'FAILED':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' };
    }
  }

  function formatScheduledTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

    function handleLogout() {
      sessionStorage.removeItem('ops_session');
      setAuthorized(false);
      setOpsKey('');
      setDrafts([]);
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
              background: 'rgba(34, 211, 238, 0.05)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              textAlign: 'center',
              maxWidth: 400,
              width: '100%',
            }}
          >
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#22d3ee',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                marginBottom: 8,
              }}
            >
              OPS AUTHENTICATION
            </h1>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                marginBottom: 24,
              }}
            >
              Enter ops access key to continue
            </p>

            <input
              type="password"
              value={opsKey}
              onChange={(e) => setOpsKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              placeholder="OPS ACCESS KEY"
              disabled={lockoutSeconds > 0 || authLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.4)',
                color: '#fff',
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                marginBottom: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {authError && (
              <p
                style={{
                  fontSize: 12,
                  color: '#ef4444',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  marginBottom: 16,
                }}
              >
                {authError}
              </p>
            )}

            {lockoutSeconds > 0 && (
              <p
                style={{
                  fontSize: 12,
                  color: '#f59e0b',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  marginBottom: 16,
                }}
              >
                LOCKOUT ACTIVE: {lockoutSeconds}s remaining
              </p>
            )}

            <button
              onClick={handleAuth}
              disabled={lockoutSeconds > 0 || authLoading}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 8,
                border: '1px solid rgba(34, 211, 238, 0.4)',
                background:
                  lockoutSeconds > 0
                    ? 'rgba(148, 163, 184, 0.2)'
                    : 'rgba(34, 211, 238, 0.2)',
                color: lockoutSeconds > 0 ? '#94a3b8' : '#22d3ee',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                cursor: lockoutSeconds > 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {authLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
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
              C.O.M.E.T. DRAFT MANAGEMENT
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'transparent',
              color: '#ef4444',
              fontSize: 11,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              cursor: 'pointer',
            }}
          >
            LOGOUT
          </button>
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

                {draft.scheduled_for && (
                  <div
                    style={{
                      marginBottom: 12,
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: '#a855f7',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      }}
                    >
                      SCHEDULED FOR: {formatScheduledTime(draft.scheduled_for)}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handlePreview(draft)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      background: 'rgba(34, 211, 238, 0.1)',
                      color: '#22d3ee',
                      fontSize: 11,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      cursor: 'pointer',
                    }}
                  >
                    PREVIEW
                  </button>
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
                  {(draft.status === 'DRAFT' || draft.status === 'APPROVED') && !draft.scheduled_for && (
                    <button
                      onClick={() => handleSchedule(draft.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#a855f7',
                        fontSize: 11,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        cursor: 'pointer',
                      }}
                    >
                      SCHEDULE
                    </button>
                  )}
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

      {/* Preview Modal */}
      {previewDraft && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setPreviewDraft(null)}
        >
          <div
            style={{
              maxWidth: 500,
              width: '100%',
              background: '#1a1a2e',
              borderRadius: 16,
              border: '1px solid rgba(34, 211, 238, 0.3)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#22d3ee',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                POST PREVIEW
              </span>
              <button
                onClick={() => setPreviewDraft(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: 20 }}>
              {/* X/Twitter style preview card */}
              <div
                style={{
                  background: '#000',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}
                  >
                    🚀
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      StarKid Command
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                      @starkidcommand
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: '#fff',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                  }}
                >
                  {previewDraft.content}
                </p>
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    gap: 24,
                  }}
                >
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>💬 0</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>🔁 0</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>❤️ 0</span>
                </div>
              </div>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  textAlign: 'center',
                }}
              >
                {previewDraft.content.length} / 280 characters
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {schedulingDraft && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setSchedulingDraft(null)}
        >
          <div
            style={{
              maxWidth: 400,
              width: '100%',
              background: '#1a1a2e',
              borderRadius: 16,
              border: '1px solid rgba(168, 85, 247, 0.3)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#a855f7',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                SCHEDULE POST
              </span>
              <button
                onClick={() => setSchedulingDraft(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  marginBottom: 16,
                }}
              >
                Select date and time to schedule this post:
              </p>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  marginBottom: 16,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setSchedulingDraft(null)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmSchedule}
                  disabled={!scheduleDate}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 8,
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    background: scheduleDate ? 'rgba(168, 85, 247, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                    color: scheduleDate ? '#a855f7' : '#94a3b8',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    cursor: scheduleDate ? 'pointer' : 'not-allowed',
                  }}
                >
                  CONFIRM
                </button>
              </div>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  textAlign: 'center',
                }}
              >
                Note: Auto-posting is not yet enabled. Scheduled posts will be marked for manual review.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
