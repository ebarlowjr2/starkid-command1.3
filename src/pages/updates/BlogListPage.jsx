import { useNavigate } from 'react-router-dom'
import { getAllPosts, getAllTags } from '../../lib/blog/blogService'
import { useState } from 'react'

export default function BlogListPage() {
  const navigate = useNavigate()
  const allPosts = getAllPosts()
  const allTags = getAllTags()
  const [selectedTag, setSelectedTag] = useState(null)

  const filteredPosts = selectedTag
    ? allPosts.filter((post) => post.tags.includes(selectedTag))
    : allPosts

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
          BLOG
        </h1>
        <p className="text-sm text-cyan-200/70 font-mono">
          MISSION LOGS • EDUCATIONAL ARTICLES • UPDATES
        </p>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          onClick={() => setSelectedTag(null)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: `1px solid ${selectedTag === null ? '#22d3ee' : 'rgba(34, 211, 238, 0.3)'}`,
            background: selectedTag === null ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
            cursor: 'pointer',
            color: '#22d3ee',
            fontSize: 11,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          ALL
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${selectedTag === tag ? '#22d3ee' : 'rgba(34, 211, 238, 0.3)'}`,
              background: selectedTag === tag ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
              cursor: 'pointer',
              color: '#22d3ee',
              fontSize: 11,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              textTransform: 'uppercase',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredPosts.map((post) => (
          <div
            key={post.slug}
            style={{
              padding: 20,
              borderRadius: 16,
              border: '1px solid rgba(34, 211, 238, 0.2)',
              background: 'rgba(0,0,0,0.4)',
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/updates/blog/${post.slug}`)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0,
                }}
              >
                {post.title}
              </h2>
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(34, 211, 238, 0.7)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  whiteSpace: 'nowrap',
                  marginLeft: 16,
                }}
              >
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.5,
                margin: '8px 0 12px',
              }}
            >
              {post.summary}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '3px 8px',
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

              <span
                style={{
                  color: '#22d3ee',
                  fontSize: 12,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                READ →
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          NO POSTS FOUND
        </div>
      )}
    </div>
  )
}
