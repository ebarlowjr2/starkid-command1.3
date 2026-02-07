// src/components/live/IssLiveEmbed.jsx
// ISS Live Stream embed component with LOS handling and mission control styling
// Displays as compact cards in a 2-column grid on desktop

import { useState, useEffect, useRef } from 'react'
import { LIVE_FEEDS } from '../../config/liveFeeds'

function LiveFeedCard({ source, title, losMessage, externalLinks }) {
  const [uplinkStatus, setUplinkStatus] = useState('ACTIVE')
  const [loadError, setLoadError] = useState(false)
  const iframeRef = useRef(null)
  const watchdogRef = useRef(null)

  useEffect(() => {
    setLoadError(false)
    setUplinkStatus('CONNECTING')
    
    watchdogRef.current = setTimeout(() => {
      setUplinkStatus('ACTIVE')
    }, 5000)

    return () => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
      }
    }
  }, [source.id])

  const handleRetry = () => {
    setLoadError(false)
    setUplinkStatus('CONNECTING')
    
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src
      iframeRef.current.src = ''
      setTimeout(() => {
        iframeRef.current.src = currentSrc
      }, 100)
    }
  }

  const getEmbedUrl = () => {
    if (source.type === 'youtube') {
      return `https://www.youtube.com/embed/${source.videoId}?autoplay=0&rel=0`
    }
    return source.embedUrl
  }

  return (
    <div
      style={{
        borderRadius: 12,
        border: '2px solid rgba(34, 211, 238, 0.4)',
        background: 'linear-gradient(180deg, rgba(0,20,40,0.9) 0%, rgba(0,10,20,0.95) 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '10px 12px',
          background: 'rgba(34, 211, 238, 0.1)',
          borderBottom: '1px solid rgba(34, 211, 238, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: uplinkStatus === 'ACTIVE' ? '#22c55e' : 
                         uplinkStatus === 'CONNECTING' ? '#eab308' : '#ef4444',
              boxShadow: uplinkStatus === 'ACTIVE' ? '0 0 6px #22c55e' : 'none',
              animation: uplinkStatus === 'CONNECTING' ? 'pulse 1s infinite' : 'none',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: '#22d3ee',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h3>
            <span
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {source.label}
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: 9,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            color: 'rgba(255,255,255,0.4)',
            flexShrink: 0,
          }}
        >
          <span style={{ 
            color: uplinkStatus === 'ACTIVE' ? '#22c55e' : 
                   uplinkStatus === 'CONNECTING' ? '#eab308' : '#ef4444' 
          }}>{uplinkStatus}</span>
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          background: '#000',
        }}
      >
        {loadError ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.9)',
              color: '#eab308',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              textAlign: 'center',
              padding: 16,
            }}
          >
            <div style={{ fontSize: 12, marginBottom: 6 }}>UPLINK: DEGRADED</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
              Stream unavailable
            </div>
            <button
              onClick={handleRetry}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #eab308',
                background: 'rgba(234, 179, 8, 0.2)',
                color: '#eab308',
                fontSize: 10,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                cursor: 'pointer',
              }}
            >
              RETRY
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={getEmbedUrl()}
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
            title={source.label}
          />
        )}
      </div>

      <div
        style={{
          padding: '8px 12px',
          background: 'rgba(234, 179, 8, 0.05)',
          borderTop: '1px solid rgba(234, 179, 8, 0.2)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 9,
            color: 'rgba(234, 179, 8, 0.7)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            lineHeight: 1.4,
          }}
        >
          {losMessage}
        </p>
      </div>

      {externalLinks && externalLinks.length > 0 && (
        <div
          style={{
            padding: '8px 12px',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {externalLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid rgba(34, 211, 238, 0.3)',
                background: 'rgba(34, 211, 238, 0.1)',
                color: '#22d3ee',
                fontSize: 9,
                fontWeight: 600,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {link.label} <span style={{ opacity: 0.7 }}>-&gt;</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function IssLiveEmbed() {
  const issConfig = LIVE_FEEDS.iss

  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          margin: '0 0 16px 0',
          fontSize: 14,
          fontWeight: 700,
          color: '#22d3ee',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {issConfig.title} - {issConfig.subtitle}
      </h2>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {issConfig.sources.map((source, index) => (
          <LiveFeedCard
            key={source.id}
            source={source}
            title={issConfig.title}
            losMessage={issConfig.losMessage}
            externalLinks={index === 0 ? issConfig.externalLinks : null}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
