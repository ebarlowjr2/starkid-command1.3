import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { NEWS_FEEDS, NEWS_CATEGORIES } from '../../config/newsFeeds'
import { normalizeNewsCards, timeAgo } from '../../utils/normalize'

export default function NewsPage() {
  const navigate = useNavigate()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isFallback, setIsFallback] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/news')
      if (!response.ok) throw new Error('Failed to fetch news')
      const data = await response.json()
      const normalizedCards = normalizeNewsCards(NEWS_FEEDS, data.news || [], { maxItems: 80 })
      setNews(normalizedCards)
      setIsFallback(data.fallback || false)
    } catch (e) {
      console.error('Error fetching news:', e)
      setError('Unable to load news feed')
    } finally {
      setLoading(false)
    }
  }

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter((item) => item.category === selectedCategory)

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return timeAgo(dateString)
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
          NEWS
        </h1>
        <p className="text-sm text-cyan-200/70 font-mono">
          SPACE NEWS • MISSION UPDATES • INDUSTRY
        </p>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${selectedCategory === cat.id ? '#22d3ee' : 'rgba(34, 211, 238, 0.3)'}`,
              background: selectedCategory === cat.id ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
              cursor: 'pointer',
              color: '#22d3ee',
              fontSize: 11,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            {cat.label.toUpperCase()}
          </button>
        ))}

        <button
          onClick={fetchNews}
          disabled={loading}
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid rgba(34, 211, 238, 0.3)',
            background: 'transparent',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#22d3ee',
            fontSize: 11,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'SYNCING...' : 'REFRESH'}
        </button>
      </div>

      {isFallback && (
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
          NOTICE: Using cached sample data. Live RSS feeds temporarily unavailable.
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
          SYNCING NEWS FEEDS...
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#ef4444',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredNews.map((item, index) => (
            <a
              key={item.id || `${item.subtitle}-${index}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: 16,
                borderRadius: 12,
                border: '1px solid rgba(34, 211, 238, 0.2)',
                background: 'rgba(0,0,0,0.4)',
                textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.2)'}
            >
              <div style={{ display: 'flex', gap: 16 }}>
                {item.imageUrl && (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'rgba(34, 211, 238, 0.1)',
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#fff',
                      margin: '0 0 6px',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title}
                  </h3>

                  {item.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.6)',
                        margin: '0 0 10px',
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 11,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'rgba(34, 211, 238, 0.15)',
                        color: '#22d3ee',
                      }}
                    >
                      {item.metaLeft || item.subtitle}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {item.metaRight || formatDate(item.publishedAt)}
                    </span>
                    <span style={{ color: '#22d3ee', marginLeft: 'auto' }}>
                      READ →
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {!loading && !error && filteredNews.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          NO NEWS FOUND FOR THIS CATEGORY
        </div>
      )}
    </div>
  )
}
