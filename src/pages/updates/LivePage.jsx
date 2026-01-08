import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

export default function LivePage() {
  const navigate = useNavigate()
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastChecked, setLastChecked] = useState(null)
  const [apiConfigured, setApiConfigured] = useState(true)
  const pollIntervalRef = useRef(null)

  useEffect(() => {
    fetchLiveStatus()

    pollIntervalRef.current = setInterval(fetchLiveStatus, 90 * 1000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  const fetchLiveStatus = async () => {
    try {
      const response = await fetch('/api/youtube-live')
      if (!response.ok) throw new Error('Failed to fetch live status')
      const data = await response.json()
      setChannels(data.channels || [])
      setLastChecked(data.checkedAt)
      setApiConfigured(data.apiConfigured !== false)
      setError(null)
    } catch (e) {
      console.error('Error fetching live status:', e)
      setError('Unable to check live status')
    } finally {
      setLoading(false)
    }
  }

  const liveChannels = channels.filter((c) => c.isLive)
  const offlineChannels = channels.filter((c) => !c.isLive)

  const formatTimeSince = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just started'
    if (diffMins < 60) return `Live for ${diffMins}m`
    return `Live for ${diffHours}h ${diffMins % 60}m`
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <button
          onClick={() => navigate('/updates')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid rgba(34, 211, 238, 0.3)',
            background: 'rgba(34, 211, 238, 0.1)',
            cursor: 'pointer',
            color: '#22d3ee',
            fontSize: 12,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            marginBottom: 16,
          }}
        >
          ← BACK TO UPDATES
        </button>

        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-400 font-mono">
          LIVE
        </h1>
        <p className="text-sm text-cyan-200/70 font-mono">
          ROCKET LAUNCHES • SPACE EVENTS • LIVE STREAMS
        </p>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={fetchLiveStatus}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid rgba(34, 211, 238, 0.3)',
            background: 'rgba(34, 211, 238, 0.1)',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#22d3ee',
            fontSize: 12,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'CHECKING...' : 'REFRESH STATUS'}
        </button>

        {lastChecked && (
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            Last checked: {new Date(lastChecked).toLocaleTimeString()}
          </span>
        )}
      </div>

      {!apiConfigured && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderRadius: 8,
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#eab308',
            fontSize: 12,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          NOTICE: YouTube API not configured. Live detection unavailable. Showing monitored channels only.
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: 12,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {error}
        </div>
      )}

      {loading && channels.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#22d3ee',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          SCANNING CHANNELS...
        </div>
      )}

      {liveChannels.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#ef4444',
              marginBottom: 16,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                animation: 'pulse 2s infinite',
              }}
            />
            LIVE NOW
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {liveChannels.map((channel) => (
              <div
                key={channel.channelId}
                style={{
                  borderRadius: 16,
                  border: '2px solid rgba(239, 68, 68, 0.5)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  overflow: 'hidden',
                }}
              >
                {channel.liveVideoId && (
                  <div
                    style={{
                      position: 'relative',
                      paddingBottom: '56.25%',
                      height: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${channel.liveVideoId}?autoplay=0`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      }}
                    >
                      LIVE
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.5)',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      }}
                    >
                      {formatTimeSince(channel.startedAt)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                    {channel.name}
                  </h3>

                  {channel.liveTitle && (
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px' }}>
                      {channel.liveTitle}
                    </p>
                  )}

                  <a
                    href={channel.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      textDecoration: 'none',
                    }}
                  >
                    WATCH ON YOUTUBE →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 16,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          MONITORED CHANNELS
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {offlineChannels.map((channel) => (
            <div
              key={channel.channelId}
              style={{
                padding: 16,
                borderRadius: 12,
                border: '1px solid rgba(34, 211, 238, 0.2)',
                background: 'rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(34, 211, 238, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: '#22d3ee',
                  }}
                >
                  {channel.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
                    {channel.name}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.4)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    {channel.handle}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.6)',
                  margin: '0 0 12px',
                  lineHeight: 1.5,
                }}
              >
                {channel.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 10,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  OFFLINE
                </span>

                <a
                  href={`https://www.youtube.com/${channel.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: '#22d3ee',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    textDecoration: 'none',
                  }}
                >
                  VIEW CHANNEL →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
