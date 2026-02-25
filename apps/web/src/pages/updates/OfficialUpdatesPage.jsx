import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OfficialUpdatesPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const url = filter === 'all' 
          ? '/api/events/recent?limit=50'
          : `/api/events/recent?limit=50&category=${filter}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          setEvents(data.events || []);
          setMeta(data.meta || null);
        } else {
          setError(data.error || 'Failed to load events');
        }
      } catch (e) {
        setError('Unable to connect to event feed');
        console.error('Events fetch error:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [filter]);

  function formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  function getCategoryColor(category) {
    switch (category) {
      case 'artemis':
        return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.5)', text: '#60a5fa' };
      case 'official':
        return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: '#4ade80' };
      case 'launch':
        return { bg: 'rgba(249, 115, 22, 0.2)', border: 'rgba(249, 115, 22, 0.5)', text: '#fb923c' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', border: 'rgba(148, 163, 184, 0.5)', text: '#94a3b8' };
    }
  }

  function getTypeIcon(type) {
    return type === 'page_change' ? '📄' : '📡';
  }

  return (
    <div style={{ padding: 16 }}>
      <button
        onClick={() => navigate('/updates')}
        style={{
          marginBottom: 16,
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid rgba(34, 211, 238, 0.3)',
          background: 'transparent',
          color: '#22d3ee',
          cursor: 'pointer',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 13,
        }}
      >
        ← BACK TO UPDATES
      </button>

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
          OFFICIAL UPDATES
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          MISSION EVENTS • RSS FEEDS • PAGE MONITORS
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        {['all', 'artemis', 'official', 'launch'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: filter === cat 
                ? '1px solid #22d3ee' 
                : '1px solid rgba(255,255,255,0.2)',
              background: filter === cat 
                ? 'rgba(34, 211, 238, 0.2)' 
                : 'transparent',
              color: filter === cat ? '#22d3ee' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {cat === 'all' ? 'All Events' : cat}
          </button>
        ))}
      </div>

      {meta && (
        <div
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(34, 211, 238, 0.1)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span>EVENTS: {meta.total}</span>
          <span>ARTEMIS: {meta.artemisCount}</span>
          <span>STATUS: {meta.usingCache ? 'CACHED' : 'LIVE'}</span>
        </div>
      )}

      {loading && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#22d3ee',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          LOADING EVENT FEED...
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
            fontSize: 14,
          }}
        >
          ERROR: {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          NO EVENTS FOUND
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((event, idx) => {
            const catColor = getCategoryColor(event.category);
            return (
              <a
                key={event.id || idx}
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{getTypeIcon(event.type)}</span>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      {event.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.5,
                        marginBottom: 8,
                      }}
                    >
                      {event.summary}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: catColor.bg,
                          border: `1px solid ${catColor.border}`,
                          color: catColor.text,
                          fontSize: 10,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {event.category}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.5)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        {event.source}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.4)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        {formatTimeAgo(event.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
