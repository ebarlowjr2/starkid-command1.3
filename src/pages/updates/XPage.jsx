import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { X_ACCOUNTS, X_CATEGORIES } from '../../config/xAccounts'
import { normalizeXCards } from '../../utils/normalize'

export default function XPage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const cards = useMemo(() => normalizeXCards(X_ACCOUNTS), [])

  const filteredCards = selectedCategory === 'all'
    ? cards
    : cards.filter((card) => card.category === selectedCategory)

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
          X ACCOUNTS
        </h1>
        <p className="text-sm text-cyan-200/70 font-mono">
          SPACE AGENCIES • COMPANIES • JOURNALISTS • TRACKERS
        </p>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {X_CATEGORIES.map((cat) => (
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
      </div>

      <div
        style={{
          padding: '12px 16px',
          marginBottom: 24,
          borderRadius: 8,
          background: 'rgba(34, 211, 238, 0.05)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        NOTICE: These are curated X/Twitter accounts for space news. Click to open in X.
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {filteredCards.map((card) => (
          <a
            key={card.id}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: 16,
              borderRadius: 12,
              border: '1px solid rgba(34, 211, 238, 0.2)',
              background: 'rgba(0,0,0,0.4)',
              textDecoration: 'none',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
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
                  fontWeight: 700,
                }}
              >
                {card.title.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
                  {card.title}
                </h3>
                <span
                  style={{
                    fontSize: 13,
                    color: '#22d3ee',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  {card.subtitle}
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                margin: '0 0 12px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {card.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {card.badge && (
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: 'rgba(34, 211, 238, 0.15)',
                    color: '#22d3ee',
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  {card.badge}
                </span>
              )}

              <span
                style={{
                  fontSize: 12,
                  color: '#22d3ee',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  marginLeft: 'auto',
                }}
              >
                OPEN IN X →
              </span>
            </div>
          </a>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          NO ACCOUNTS FOUND FOR THIS CATEGORY
        </div>
      )}
    </div>
  )
}
