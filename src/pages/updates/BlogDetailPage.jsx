import { useNavigate, useParams } from 'react-router-dom'
import { getPostBySlug } from '../../lib/blog/blogService'

function renderMarkdown(content) {
  const lines = content.split('\n')
  const elements = []
  let inList = false
  let listItems = []

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} style={{ margin: '16px 0', paddingLeft: 24 }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: 4 }}>
              {item}
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
    inList = false
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (trimmed.startsWith('# ')) {
      flushList()
      elements.push(
        <h1
          key={index}
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#22d3ee',
            margin: '32px 0 16px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {trimmed.slice(2)}
        </h1>
      )
    } else if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h2
          key={index}
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#fff',
            margin: '28px 0 12px',
            borderBottom: '1px solid rgba(34, 211, 238, 0.2)',
            paddingBottom: 8,
          }}
        >
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h3
          key={index}
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#22d3ee',
            margin: '24px 0 8px',
          }}
        >
          {trimmed.slice(4)}
        </h3>
      )
    } else if (trimmed.startsWith('> ')) {
      flushList()
      elements.push(
        <blockquote
          key={index}
          style={{
            margin: '16px 0',
            padding: '12px 20px',
            borderLeft: '3px solid #22d3ee',
            background: 'rgba(34, 211, 238, 0.1)',
            borderRadius: '0 8px 8px 0',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {trimmed.slice(2)}
        </blockquote>
      )
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true
      listItems.push(trimmed.slice(2))
    } else if (/^\d+\.\s/.test(trimmed)) {
      inList = true
      listItems.push(trimmed.replace(/^\d+\.\s/, ''))
    } else if (trimmed === '') {
      flushList()
    } else {
      flushList()
      const formatted = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code style="background:rgba(34,211,238,0.15);padding:2px 6px;border-radius:4px;font-family:monospace">$1</code>')

      elements.push(
        <p
          key={index}
          style={{
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.8,
            margin: '12px 0',
          }}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      )
    }
  })

  flushList()
  return elements
}

export default function BlogDetailPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  if (!post) {
    return (
      <div className="p-4">
        <button
          onClick={() => navigate('/updates/blog')}
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
          ← BACK TO BLOG
        </button>
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          POST NOT FOUND
        </div>
      </div>
    )
  }

  return (
    <div className="p-4" style={{ maxWidth: 800, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/updates/blog')}
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
          marginBottom: 24,
        }}
      >
        ← BACK TO BLOG
      </button>

      <article>
        <header style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  background: 'rgba(34, 211, 238, 0.15)',
                  color: '#22d3ee',
                  fontSize: 10,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  textTransform: 'uppercase',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 12px',
              lineHeight: 1.3,
            }}
          >
            {post.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              color: 'rgba(34, 211, 238, 0.7)',
              fontSize: 12,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            <span>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        <div
          style={{
            padding: 24,
            borderRadius: 16,
            border: '1px solid rgba(34, 211, 238, 0.2)',
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          {renderMarkdown(post.content)}
        </div>
      </article>
    </div>
  )
}
