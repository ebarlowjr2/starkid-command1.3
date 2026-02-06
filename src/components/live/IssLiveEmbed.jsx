// src/components/live/IssLiveEmbed.jsx
// ISS Live Stream embed component with LOS handling and mission control styling

import { useState, useEffect, useRef } from 'react'
import { LIVE_FEEDS } from '../../config/liveFeeds'

export default function IssLiveEmbed() {
  const [activeSource, setActiveSource] = useState(0)
  const [uplinkStatus, setUplinkStatus] = useState('ACTIVE')
  const [loadError, setLoadError] = useState(false)
  const [lastSync, setLastSync] = useState(new Date())
  const iframeRef = useRef(null)
  const watchdogRef = useRef(null)

  const issConfig = LIVE_FEEDS.iss
  const currentSource = issConfig.sources[activeSource]

  useEffect(() => {
    setLoadError(false)
    setUplinkStatus('CONNECTING')
    
    watchdogRef.current = setTimeout(() => {
      setUplinkStatus('ACTIVE')
      setLastSync(new Date())
    }, 5000)

    return () => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
      }
    }
  }, [activeSource])

  const handleRetry = () => {
    setLoadError(false)
    setUplinkStatus('CONNECTING')
    setActiveSource(prev => prev)
    
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const handleSourceChange = (index) => {
    setActiveSource(index)
    setLoadError(false)
  }

  const getEmbedUrl = () => {
    if (currentSource.type === 'youtube') {
      return `https://www.youtube.com/embed/${currentSource.videoId}?autoplay=0&rel=0`
    }
    return currentSource.embedUrl
  }

  return (
    <div
      style={{
        borderRadius: 16,
        border: '2px solid rgba(34, 211, 238, 0.4)',
        background: 'linear-gradient(180deg, rgba(0,20,40,0.9) 0%, rgba(0,10,20,0.95) 100%)',
        overflow: 'hidden',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(34, 211, 238, 0.1)',
          borderBottom: '1px solid rgba(34, 211, 238, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: uplinkStatus === 'ACTIVE' ? '#22c55e' : 
                         uplinkStatus === 'CONNECTING' ? '#eab308' : '#ef4444',
              boxShadow: uplinkStatus === 'ACTIVE' ? '0 0 8px #22c55e' : 'none',
              animation: uplinkStatus === 'CONNECTING' ? 'pulse 1s infinite' : 'none',
            }}
          />
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: '#22d3ee',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: '0.05em',
              }}
            >
              {issConfig.title} - {issConfig.subtitle}
            </h3>
            <span
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {issConfig.description}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 10,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>
            UPLINK: <span style={{ 
              color: uplinkStatus === 'ACTIVE' ? '#22c55e' : 
                     uplinkStatus === 'CONNECTING' ? '#eab308' : '#ef4444' 
            }}>{uplinkStatus}</span>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>
            SOURCE: <span style={{ color: '#22d3ee' }}>NASA</span>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>
            SYNC: {lastSync.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', gap: 8 }}>
        {issConfig.sources.map((source, index) => (
          <button
            key={source.id}
            onClick={() => handleSourceChange(index)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: activeSource === index 
                ? '1px solid rgba(34, 211, 238, 0.6)' 
                : '1px solid rgba(255,255,255,0.2)',
              background: activeSource === index 
                ? 'rgba(34, 211, 238, 0.2)' 
                : 'rgba(255,255,255,0.05)',
              color: activeSource === index ? '#22d3ee' : 'rgba(255,255,255,0.6)',
              fontSize: 11,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {source.label}
          </button>
        ))}
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
              padding: 20,
            }}
          >
            <div style={{ fontSize: 14, marginBottom: 8 }}>UPLINK: DEGRADED</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
              Stream temporarily unavailable
            </div>
            <button
              onClick={handleRetry}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #eab308',
                background: 'rgba(234, 179, 8, 0.2)',
                color: '#eab308',
                fontSize: 12,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                cursor: 'pointer',
              }}
            >
              RETRY CONNECTION
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
            title="ISS Live Stream"
          />
        )}
      </div>

      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(234, 179, 8, 0.05)',
          borderTop: '1px solid rgba(234, 179, 8, 0.2)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: 'rgba(234, 179, 8, 0.8)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            lineHeight: 1.5,
          }}
        >
          {issConfig.losMessage}
        </p>
      </div>

      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {issConfig.externalLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(34, 211, 238, 0.3)',
              background: 'rgba(34, 211, 238, 0.1)',
              color: '#22d3ee',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {link.label} <span style={{ opacity: 0.7 }}>-&gt;</span>
          </a>
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
