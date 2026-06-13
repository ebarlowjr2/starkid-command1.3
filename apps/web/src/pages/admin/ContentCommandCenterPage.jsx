import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

const CONTENT_TYPES = [
  'news',
  'artemis_update',
  'spacex_update',
  'launch_update',
  'new_space_company_update',
  'random_space_fact',
  'today_in_space',
  'stem_mission_companion',
  'app_update',
  'evergreen_stem',
]

const AUTO_APPROVED_TYPES = [
  'news',
  'artemis_update',
  'spacex_update',
  'launch_update',
  'new_space_company_update',
]

const REVIEW_REQUIRED_TYPES = [
  'random_space_fact',
  'today_in_space',
  'stem_mission_companion',
  'evergreen_stem',
  'app_update',
]

const LINK_TYPES = [
  'launch',
  'lunar_event',
  'stem_module',
  'app_alert',
  'company_profile',
  'mission_countdown',
]

const FILTERS = [
  ['all', 'Dashboard', '/admin/content'],
  ['candidates', 'Candidates', '/admin/content/candidates'],
  ['review', 'Review', '/admin/content/review'],
  ['drafts', 'Drafts', '/admin/content/drafts'],
  ['social-queue', 'Social Queue', '/admin/content/social-queue'],
  ['scheduled', 'Scheduled', '/admin/content/scheduled'],
  ['published', 'Published', '/admin/content/published'],
]

const EMPTY_FORM = {
  content_type: 'random_space_fact',
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  seo_title: '',
  seo_description: '',
  hero_image_url: '',
  source_name: '',
  source_url: '',
  source_published_at: '',
  fact_source_name: '',
  fact_source_url: '',
  verified_manually: false,
  topic: '',
  company: '',
  mission_name: '',
  traffic_score: 0,
  stem_score: 0,
  stem_tie_in: '',
  app_cta: 'Track this mission in StarKid Command',
  app_link_type: 'mission_countdown',
  app_link_target_id: '',
  is_launch_related: false,
  is_lunar_related: false,
  is_stem_related: true,
  is_test: true,
}

function getFilterFromPath(pathname) {
  const match = FILTERS.find(([, , path]) => path === pathname)
  return match?.[0] || 'all'
}

function canDistribute(item) {
  return item?.status === 'approved' || item?.status === 'scheduled'
}

function canRetryWebhook(item) {
  return item?.status === 'failed' && Boolean(item.auto_approved || item.reviewed_at)
}

function typeLabel(value = '') {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value) {
  if (!value) return 'Unscheduled'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function statusTone(status) {
  if (['approved', 'published', 'sent_to_buffer'].includes(status)) return 'good'
  if (['needs_review', 'candidate', 'draft', 'scheduled'].includes(status)) return 'warn'
  if (['failed', 'rejected'].includes(status)) return 'bad'
  return 'neutral'
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`content-badge content-badge-${tone}`}>{children}</span>
}

function Field({ label, children }) {
  return (
    <label className="content-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function actionPath(id, action) {
  const explicit = {
    approve: 'approve',
    reject: 'reject',
    generate_social_pack: 'generate-social-pack',
    send_to_buffer: 'send-webhook',
    retry_webhook: 'retry-webhook',
  }
  return explicit[action] ? `/api/content/${id}/${explicit[action]}` : `/api/content/${id}/action`
}

export default function ContentCommandCenterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const filter = getFilterFromPath(location.pathname)
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [edit, setEdit] = useState(null)
  const [socialDrafts, setSocialDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [config, setConfig] = useState({ webhookConfigured: null, supabaseConfigured: null })

  const opsKey = typeof window !== 'undefined' ? sessionStorage.getItem('ops_session') || '' : ''

  async function apiFetch(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }
    if (opsKey) headers['X-OPS-KEY'] = opsKey
    const res = await fetch(url, { ...options, headers })
    const text = await res.text()
    let data = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { raw: text }
    }
    if (!res.ok) {
      const details = data.error || data.message || data.raw || res.statusText || 'Request failed'
      throw new Error(`${details} (${res.status})`)
    }
    return data
  }

  async function loadContent() {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch(`/api/content?filter=${filter}`)
      setItems(data.items || [])
    } catch (e) {
      setItems([])
      setError(`${e.message}. Run through the serverless app environment for live create/review/webhook actions.`)
    } finally {
      setLoading(false)
    }
  }

  async function loadSelected(contentId) {
    if (!contentId) {
      setSelected(null)
      setEdit(null)
      setSocialDrafts([])
      return
    }
    try {
      const data = await apiFetch(`/api/content/${contentId}`)
      setSelected(data.item)
      setEdit(data.item)
      setSocialDrafts(data.item.social_posts || [])
      setScheduledFor(data.item.scheduled_for ? data.item.scheduled_for.slice(0, 16) : '')
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    loadContent()
  }, [filter])

  useEffect(() => {
    apiFetch('/api/content/config')
      .then((data) => setConfig(data))
      .catch(() => setConfig({ webhookConfigured: false, supabaseConfigured: false }))
  }, [])

  useEffect(() => {
    loadSelected(id)
  }, [id])

  const metrics = useMemo(() => {
    const all = items
    return [
      ['Needs Review', all.filter((item) => item.status === 'needs_review').length],
      ['Auto-Approved News', all.filter((item) => item.auto_approved && item.status === 'approved').length],
      ['Scheduled Posts', all.filter((item) => item.status === 'scheduled').length],
      ['Sent to Buffer', all.filter((item) => item.status === 'sent_to_buffer').length],
      ['Published Blog Posts', all.filter((item) => item.status === 'published').length],
      ['Failed Webhooks', all.filter((item) => item.status === 'failed').length],
    ]
  }, [items])

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateEdit(key, value) {
    setEdit((prev) => ({ ...prev, [key]: value }))
  }

  async function createItem(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const data = await apiFetch('/api/content', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm(EMPTY_FORM)
      setMessage('Content item created.')
      await loadContent()
      navigate(`/admin/content/${data.item.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveItem() {
    if (!edit) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const data = await apiFetch(`/api/content/${edit.id}`, {
        method: 'PATCH',
        body: JSON.stringify(edit),
      })
      setSelected(data.item)
      setEdit(data.item)
      setMessage('Content item saved.')
      await loadContent()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function runAction(action, payload = {}) {
    if (!selected) return
    if ((action === 'send_to_buffer' || action === 'retry_webhook') && !confirmWebhookSend(selected, config.webhookConfigured, action)) {
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const data = await apiFetch(actionPath(selected.id, action), {
        method: 'POST',
        body: JSON.stringify({ action, ...payload }),
      })
      setSelected(data.item)
      setEdit(data.item)
      setSocialDrafts(data.item.social_posts || [])
      setMessage(action.replaceAll('_', ' ') + ' complete.')
      await loadContent()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveSocialDrafts() {
    await runAction('update_social_posts', { posts: socialDrafts })
  }

  const displayItems = id ? items : items
  const activeTypeAuto = AUTO_APPROVED_TYPES.includes(form.content_type)
  const activeTypeReview = REVIEW_REQUIRED_TYPES.includes(form.content_type)

  async function seedTestItems() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const data = await apiFetch('/api/content', {
        method: 'POST',
        body: JSON.stringify({ action: 'seed_test_items' }),
      })
      setMessage(`Created ${data.items?.length || 0} production smoke test items.`)
      await loadContent()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="content-command">
      <style>{styles}</style>

      <header className="content-command-header">
        <div>
          <p className="content-kicker">ADMIN OPS</p>
          <h1>CONTENT COMMAND CENTER</h1>
          <p>
            Blog-first content control for StarKid mission updates, STEM tie-ins, app links, and
            Buffer-ready automation payloads.
          </p>
        </div>
        <button className="content-button" onClick={() => navigate('/ops/social-queue')}>
          Legacy Social Queue
        </button>
        <button className="content-button primary" onClick={seedTestItems} disabled={saving}>
          Create Smoke Test Items
        </button>
      </header>

      <nav className="content-tabs">
        {FILTERS.map(([value, label, path]) => (
          <button
            key={value}
            className={filter === value && !id ? 'active' : ''}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </nav>

      {message ? <div className="content-alert good">{message}</div> : null}
      {error ? <div className="content-alert bad">{error}</div> : null}
      {config.webhookConfigured === false ? (
        <div className="content-alert warn">
          Content automation webhook is not configured. Add CONTENT_AUTOMATION_WEBHOOK_URL in Vercel to enable Buffer export.
        </div>
      ) : null}
      {config.supabaseConfigured === false ? (
        <div className="content-alert bad">
          Supabase service credentials are not visible to this deployment. Confirm SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.
        </div>
      ) : null}

      <section className="content-metrics">
        {metrics.map(([label, value]) => (
          <div key={label} className="content-metric">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <div className="content-layout">
        <section className="content-panel">
          <div className="content-panel-title">
            <h2>Mission Content</h2>
            <span>{loading ? 'Loading' : `${displayItems.length} items`}</span>
          </div>

          <div className="content-table-wrap">
            <table className="content-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>STEM</th>
                  <th>Traffic</th>
                  <th>Scheduled</th>
                  <th>Review</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      <div className="content-row-badges">
                        {item.auto_approved ? <Badge tone="good">Auto-approved</Badge> : null}
                        {item.is_test ? <Badge tone="test">TEST CONTENT</Badge> : null}
                        {item.requires_review ? <Badge tone="warn">Review required</Badge> : null}
                        {item.source_url ? <Badge>Source-based news</Badge> : <Badge>StarKid original</Badge>}
                        {item.is_stem_related ? <Badge tone="good">STEM-linked</Badge> : null}
                        {item.is_launch_related ? <Badge>Launch-linked</Badge> : null}
                        {item.is_lunar_related ? <Badge>Lunar-linked</Badge> : null}
                        {canDistribute(item) ? <Badge tone="good">Ready for Buffer</Badge> : null}
                        {item.status === 'sent_to_buffer' ? <Badge tone="good">Sent to Buffer</Badge> : null}
                        {item.status === 'failed' ? <Badge tone="bad">Webhook failed</Badge> : null}
                      </div>
                    </td>
                    <td>{typeLabel(item.content_type)}</td>
                    <td><Badge tone={statusTone(item.status)}>{item.status}</Badge></td>
                    <td>{item.source_name || item.fact_source_name || 'StarKid'}</td>
                    <td>{item.stem_score}</td>
                    <td>{item.traffic_score}</td>
                    <td>{formatDate(item.scheduled_for)}</td>
                    <td>{item.requires_review ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="content-actions">
                        <button onClick={() => navigate(`/admin/content/${item.id}`)}>View</button>
                        <button onClick={() => runActionForRow(item.id, 'generate_social_pack')}>Social Pack</button>
                        {item.status === 'failed' ? (
                          <button onClick={() => runActionForRow(item, 'retry_webhook')}>Retry</button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && displayItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="content-empty">No content in this queue.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="content-panel">
          {selected && edit ? (
            <DetailPanel
              item={selected}
              edit={edit}
              setEdit={updateEdit}
              socialDrafts={socialDrafts}
              setSocialDrafts={setSocialDrafts}
              scheduledFor={scheduledFor}
              setScheduledFor={setScheduledFor}
              saving={saving}
              saveItem={saveItem}
              saveSocialDrafts={saveSocialDrafts}
              runAction={runAction}
              webhookConfigured={config.webhookConfigured}
            />
          ) : (
            <CreatePanel
              form={form}
              updateForm={updateForm}
              createItem={createItem}
              saving={saving}
              activeTypeAuto={activeTypeAuto}
              activeTypeReview={activeTypeReview}
            />
          )}
        </aside>
      </div>
    </div>
  )

  async function runActionForRow(contentId, action) {
    const row = typeof contentId === 'string' ? items.find((item) => item.id === contentId) : contentId
    const rowId = row?.id || contentId
    if ((action === 'send_to_buffer' || action === 'retry_webhook') && !confirmWebhookSend(row, config.webhookConfigured, action)) {
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const data = await apiFetch(actionPath(rowId, action), {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      setMessage(action.replaceAll('_', ' ') + ' complete.')
      if (selected?.id === rowId) {
        setSelected(data.item)
        setEdit(data.item)
        setSocialDrafts(data.item.social_posts || [])
      }
      await loadContent()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }
}

function confirmWebhookSend(item, webhookConfigured, action = 'send_to_buffer') {
  const retryAllowed = action === 'retry_webhook' && canRetryWebhook(item)
  if (!canDistribute(item) && !retryAllowed) {
    window.alert('This content must be reviewed and approved before it can be distributed.')
    return false
  }
  if (webhookConfigured === false) {
    window.alert('Content automation webhook is not configured. Add CONTENT_AUTOMATION_WEBHOOK_URL in Vercel to enable Buffer export.')
    return false
  }

  const testWarning = item?.is_test
    ? '\n\nThis is marked as TEST CONTENT. It will be sent to the webhook for testing but should not be treated as live public content.'
    : ''
  return window.confirm(`This will send the selected social posts to the configured automation webhook. Continue?${testWarning}`)
}

function CreatePanel({ form, updateForm, createItem, saving, activeTypeAuto, activeTypeReview }) {
  return (
    <form onSubmit={createItem} className="content-form">
      <div className="content-panel-title">
        <h2>Create Content Item</h2>
        {activeTypeAuto ? <Badge tone="good">Auto-approved source-based news</Badge> : null}
        {activeTypeReview ? <Badge tone="warn">Review required: StarKid educational content</Badge> : null}
      </div>

      <Field label="Content type">
        <select value={form.content_type} onChange={(e) => updateForm('content_type', e.target.value)}>
          {CONTENT_TYPES.map((type) => <option key={type} value={type}>{typeLabel(type)}</option>)}
        </select>
      </Field>
      <Field label="Title"><input value={form.title} onChange={(e) => updateForm('title', e.target.value)} required /></Field>
      <Field label="Slug"><input value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="auto-generated if blank" /></Field>
      <Field label="Excerpt"><textarea value={form.excerpt} onChange={(e) => updateForm('excerpt', e.target.value)} rows={3} /></Field>
      <Field label="Body"><textarea value={form.body} onChange={(e) => updateForm('body', e.target.value)} rows={6} /></Field>
      <Field label="Source name"><input value={form.source_name} onChange={(e) => updateForm('source_name', e.target.value)} placeholder="NASA, SpaceX, Launch Library" /></Field>
      <Field label="Source URL"><input value={form.source_url} onChange={(e) => updateForm('source_url', e.target.value)} /></Field>
      <Field label="Source published at"><input type="datetime-local" value={form.source_published_at} onChange={(e) => updateForm('source_published_at', e.target.value)} /></Field>
      <Field label="Fact source name"><input value={form.fact_source_name} onChange={(e) => updateForm('fact_source_name', e.target.value)} /></Field>
      <Field label="Fact source URL"><input value={form.fact_source_url} onChange={(e) => updateForm('fact_source_url', e.target.value)} /></Field>
      <label className="content-check">
        <input type="checkbox" checked={form.verified_manually} onChange={(e) => updateForm('verified_manually', e.target.checked)} />
        Verified manually
      </label>
      <label className="content-check">
        <input type="checkbox" checked={form.is_test} onChange={(e) => updateForm('is_test', e.target.checked)} />
        Mark as test content
      </label>
      <div className="content-grid-two">
        <Field label="STEM score"><input type="number" value={form.stem_score} onChange={(e) => updateForm('stem_score', e.target.value)} /></Field>
        <Field label="Traffic score"><input type="number" value={form.traffic_score} onChange={(e) => updateForm('traffic_score', e.target.value)} /></Field>
      </div>
      <Field label="STEM tie-in"><textarea value={form.stem_tie_in} onChange={(e) => updateForm('stem_tie_in', e.target.value)} rows={3} /></Field>
      <Field label="App CTA"><input value={form.app_cta} onChange={(e) => updateForm('app_cta', e.target.value)} /></Field>
      <Field label="App link type">
        <select value={form.app_link_type} onChange={(e) => updateForm('app_link_type', e.target.value)}>
          {LINK_TYPES.map((type) => <option key={type} value={type}>{typeLabel(type)}</option>)}
        </select>
      </Field>
      <Field label="App target ID"><input value={form.app_link_target_id} onChange={(e) => updateForm('app_link_target_id', e.target.value)} /></Field>
      <div className="content-check-row">
        <label><input type="checkbox" checked={form.is_launch_related} onChange={(e) => updateForm('is_launch_related', e.target.checked)} /> Launch-linked</label>
        <label><input type="checkbox" checked={form.is_lunar_related} onChange={(e) => updateForm('is_lunar_related', e.target.checked)} /> Lunar-linked</label>
        <label><input type="checkbox" checked={form.is_stem_related} onChange={(e) => updateForm('is_stem_related', e.target.checked)} /> STEM-linked</label>
      </div>

      <div className="content-rule-box">
        Every item should track an event, connect to a launch or lunar moment, teach a STEM idea,
        encourage app usage, or make StarKid feel like Mission Control.
      </div>

      <button className="content-button primary" disabled={saving}>
        {saving ? 'Creating...' : 'Create Content Item'}
      </button>
    </form>
  )
}

function DetailPanel({
  item,
  edit,
  setEdit,
  socialDrafts,
  setSocialDrafts,
  scheduledFor,
  setScheduledFor,
  saving,
  saveItem,
  saveSocialDrafts,
  runAction,
  webhookConfigured,
}) {
  const distributionBlocked = !canDistribute(item)
  const retryAllowed = canRetryWebhook(item)
  return (
    <div className="content-detail">
      <div className="content-panel-title">
        <h2>Content Preview</h2>
        <Badge tone={statusTone(item.status)}>{item.status}</Badge>
      </div>

      <div className="content-row-badges">
        {item.auto_approved ? <Badge tone="good">Auto-approved source-based news</Badge> : null}
        {item.is_test ? <Badge tone="test">TEST CONTENT</Badge> : null}
        {item.requires_review ? <Badge tone="warn">Review required: StarKid educational content</Badge> : null}
        {retryAllowed ? <Badge tone="warn">Ready to retry webhook</Badge> : null}
        {distributionBlocked && !retryAllowed ? <Badge tone="bad">Distribution locked</Badge> : null}
        {!distributionBlocked ? <Badge tone="good">Ready for Buffer</Badge> : null}
      </div>

      {distributionBlocked && !retryAllowed ? (
        <div className="content-alert warn">This content must be reviewed and approved before it can be distributed.</div>
      ) : null}
      {webhookConfigured === false ? (
        <div className="content-alert warn">Content automation webhook is not configured. Add CONTENT_AUTOMATION_WEBHOOK_URL in Vercel to enable Buffer export.</div>
      ) : null}
      {item.is_test ? (
        <div className="content-alert test">This is TEST CONTENT. It can exercise the webhook flow but should not be treated as live public content.</div>
      ) : null}

      <div className="content-action-bar">
        <button onClick={saveItem} disabled={saving}>Save</button>
        <button onClick={() => runAction('approve')} disabled={saving || item.status === 'approved'}>Approve</button>
        <button onClick={() => runAction('reject', { reason: edit.rejection_reason })} disabled={saving}>Reject</button>
        <button onClick={() => runAction('generate_social_pack')} disabled={saving}>Generate Social Pack</button>
        <button onClick={() => runAction('send_to_buffer')} disabled={saving || distributionBlocked}>Send to Buffer</button>
        {item.status === 'failed' ? (
          <button onClick={() => runAction('retry_webhook')} disabled={saving || !retryAllowed}>Retry Webhook</button>
        ) : null}
        <button onClick={() => runAction('publish')} disabled={saving || distributionBlocked}>Publish Blog</button>
      </div>

      <div className="content-schedule">
        <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
        <button
          onClick={() => runAction('schedule', { scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null })}
          disabled={saving || distributionBlocked || !scheduledFor}
        >
          Schedule
        </button>
      </div>

      <Field label="Title"><input value={edit.title || ''} onChange={(e) => setEdit('title', e.target.value)} /></Field>
      <Field label="Excerpt"><textarea rows={3} value={edit.excerpt || ''} onChange={(e) => setEdit('excerpt', e.target.value)} /></Field>
      <Field label="Body"><textarea rows={8} value={edit.body || ''} onChange={(e) => setEdit('body', e.target.value)} /></Field>
      <Field label="SEO title"><input value={edit.seo_title || ''} onChange={(e) => setEdit('seo_title', e.target.value)} /></Field>
      <Field label="SEO description"><textarea rows={2} value={edit.seo_description || ''} onChange={(e) => setEdit('seo_description', e.target.value)} /></Field>
      <Field label="Hero image URL"><input value={edit.hero_image_url || ''} onChange={(e) => setEdit('hero_image_url', e.target.value)} /></Field>
      <Field label="Source name"><input value={edit.source_name || ''} onChange={(e) => setEdit('source_name', e.target.value)} /></Field>
      <Field label="Source URL"><input value={edit.source_url || ''} onChange={(e) => setEdit('source_url', e.target.value)} /></Field>
      <Field label="Fact source name"><input value={edit.fact_source_name || ''} onChange={(e) => setEdit('fact_source_name', e.target.value)} /></Field>
      <Field label="Fact source URL"><input value={edit.fact_source_url || ''} onChange={(e) => setEdit('fact_source_url', e.target.value)} /></Field>
      <label className="content-check">
        <input type="checkbox" checked={Boolean(edit.is_test)} onChange={(e) => setEdit('is_test', e.target.checked)} />
        Mark as test content
      </label>
      <label className="content-check">
        <input type="checkbox" checked={Boolean(edit.verified_manually)} onChange={(e) => setEdit('verified_manually', e.target.checked)} />
        Verified manually
      </label>
      <Field label="STEM tie-in"><textarea rows={3} value={edit.stem_tie_in || ''} onChange={(e) => setEdit('stem_tie_in', e.target.value)} /></Field>
      <Field label="App CTA"><input value={edit.app_cta || ''} onChange={(e) => setEdit('app_cta', e.target.value)} /></Field>
      <Field label="Rejection reason"><textarea rows={2} value={edit.rejection_reason || ''} onChange={(e) => setEdit('rejection_reason', e.target.value)} /></Field>

      <section className="content-preview-box">
        <h3>Blog Preview</h3>
        <h4>{edit.title}</h4>
        <p>{edit.excerpt}</p>
        <div>{edit.body}</div>
        {edit.source_url ? <a href={edit.source_url} target="_blank" rel="noreferrer">Source: {edit.source_name || edit.source_url}</a> : null}
      </section>

      <section className="content-preview-box">
        <h3>App Preview</h3>
        <p>{edit.app_cta || 'No app CTA yet.'}</p>
        <p>{edit.stem_tie_in || 'No STEM tie-in yet.'}</p>
      </section>

      <section className="content-preview-box">
        <div className="content-panel-title">
          <h3>Social Pack</h3>
          <button onClick={saveSocialDrafts} disabled={saving || socialDrafts.length === 0}>Save Captions</button>
        </div>
        {socialDrafts.length === 0 ? <p>No social captions yet. Generate a social pack.</p> : null}
        {socialDrafts.map((post, index) => (
          <div key={post.id || `${post.platform}-${index}`} className="content-social-editor">
            <strong>{typeLabel(post.platform)}</strong>
            <textarea
              rows={post.platform === 'youtube_shorts' ? 7 : 4}
              value={post.caption || post.body || ''}
              onChange={(e) => {
                const next = [...socialDrafts]
                next[index] = { ...next[index], caption: e.target.value, body: e.target.value }
                setSocialDrafts(next)
              }}
            />
            <input
              placeholder="#StarKidCommand,#STEM"
              value={(post.hashtags || []).join(', ')}
              onChange={(e) => {
                const next = [...socialDrafts]
                next[index] = {
                  ...next[index],
                  hashtags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean),
                }
                setSocialDrafts(next)
              }}
            />
          </div>
        ))}
      </section>

      <section className="content-preview-box">
        <h3>Webhook Events</h3>
        {(item.content_webhook_events || []).length === 0 ? <p>No webhook attempts yet.</p> : null}
        {(item.content_webhook_events || []).map((event) => (
          <div key={event.id} className="content-webhook-event">
            <Badge tone={event.status === 'failed' ? 'bad' : 'good'}>{event.status}</Badge>
            <span>{event.destination}</span>
            <small>{event.error_message || formatDate(event.sent_at || event.created_at)}</small>
          </div>
        ))}
      </section>
    </div>
  )
}

const styles = `
.content-command {
  width: min(1480px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 24px 0 40px;
  color: rgba(255,255,255,.88);
}
.content-command-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 18px;
}
.content-command-header h1 {
  color: #67e8f9;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: 0;
  margin: 0 0 8px;
}
.content-command-header p {
  color: rgba(207,250,254,.72);
  max-width: 760px;
  margin: 0;
}
.content-kicker {
  color: #fbbf24 !important;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .08em;
  margin-bottom: 6px !important;
}
.content-tabs, .content-action-bar, .content-actions, .content-row-badges, .content-check-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.content-tabs {
  margin-bottom: 18px;
}
.content-tabs button, .content-actions button, .content-action-bar button, .content-button, .content-schedule button, .content-panel-title button {
  border: 1px solid rgba(103,232,249,.35);
  background: rgba(8,47,73,.45);
  color: #a5f3fc;
  border-radius: 6px;
  padding: 9px 12px;
  font: 700 12px ui-monospace, SFMono-Regular, Menlo, monospace;
  cursor: pointer;
}
.content-tabs button.active, .content-button.primary {
  background: rgba(34,211,238,.22);
  border-color: rgba(103,232,249,.8);
  color: #fff;
}
button:disabled {
  opacity: .45;
  cursor: not-allowed;
}
.content-alert {
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 14px;
  font: 700 12px ui-monospace, SFMono-Regular, Menlo, monospace;
}
.content-alert.good {
  color: #86efac;
  background: rgba(22,101,52,.28);
  border: 1px solid rgba(134,239,172,.35);
}
.content-alert.bad {
  color: #fca5a5;
  background: rgba(127,29,29,.32);
  border: 1px solid rgba(252,165,165,.35);
}
.content-alert.warn {
  color: #fde68a;
  background: rgba(120,53,15,.3);
  border: 1px solid rgba(251,191,36,.38);
}
.content-alert.test {
  color: #f0abfc;
  background: rgba(112,26,117,.28);
  border: 1px solid rgba(240,171,252,.38);
}
.content-metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}
.content-metric {
  min-height: 92px;
  border: 1px solid rgba(103,232,249,.18);
  background: rgba(0,0,0,.48);
  border-radius: 8px;
  padding: 14px;
}
.content-metric span {
  display: block;
  color: rgba(207,250,254,.68);
  font-size: 12px;
}
.content-metric strong {
  display: block;
  color: #fff;
  font-size: 30px;
  margin-top: 12px;
}
.content-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(380px, .8fr);
  gap: 16px;
  align-items: start;
}
.content-panel {
  border: 1px solid rgba(103,232,249,.22);
  background: rgba(0,0,0,.56);
  border-radius: 8px;
  padding: 16px;
}
.content-panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.content-panel-title h2, .content-panel-title h3 {
  margin: 0;
  color: #67e8f9;
  font-size: 16px;
  font-weight: 800;
}
.content-panel-title span {
  color: rgba(207,250,254,.6);
  font-size: 12px;
}
.content-table-wrap {
  overflow-x: auto;
}
.content-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}
.content-table th, .content-table td {
  border-bottom: 1px solid rgba(103,232,249,.12);
  padding: 12px 10px;
  text-align: left;
  vertical-align: top;
  font-size: 12px;
}
.content-table th {
  color: rgba(207,250,254,.72);
  text-transform: uppercase;
  font-size: 10px;
}
.content-table td strong {
  color: #fff;
  display: block;
  margin-bottom: 8px;
}
.content-empty {
  text-align: center !important;
  color: rgba(255,255,255,.48);
  padding: 40px !important;
}
.content-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(148,163,184,.35);
  background: rgba(15,23,42,.72);
  color: #cbd5e1;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}
.content-badge-good {
  border-color: rgba(134,239,172,.45);
  color: #86efac;
  background: rgba(22,101,52,.22);
}
.content-badge-warn {
  border-color: rgba(251,191,36,.42);
  color: #fde68a;
  background: rgba(120,53,15,.24);
}
.content-badge-bad {
  border-color: rgba(252,165,165,.48);
  color: #fca5a5;
  background: rgba(127,29,29,.24);
}
.content-badge-test {
  border-color: rgba(240,171,252,.55);
  color: #f0abfc;
  background: rgba(112,26,117,.28);
}
.content-form, .content-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.content-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.content-field span, .content-check, .content-check-row label {
  color: rgba(207,250,254,.76);
  font: 700 11px ui-monospace, SFMono-Regular, Menlo, monospace;
  text-transform: uppercase;
}
.content-field input, .content-field textarea, .content-field select, .content-social-editor textarea, .content-social-editor input, .content-schedule input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(148,163,184,.28);
  background: rgba(2,6,23,.72);
  color: #fff;
  border-radius: 6px;
  padding: 10px 11px;
  font: 13px ui-sans-serif, system-ui, sans-serif;
}
.content-grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.content-check, .content-check-row label {
  display: flex;
  align-items: center;
  gap: 7px;
  text-transform: none;
}
.content-rule-box, .content-preview-box {
  border: 1px solid rgba(103,232,249,.16);
  background: rgba(8,47,73,.24);
  border-radius: 8px;
  padding: 12px;
  color: rgba(207,250,254,.76);
  font-size: 13px;
  line-height: 1.5;
}
.content-preview-box h3 {
  color: #67e8f9;
  margin: 0 0 10px;
  font-size: 14px;
}
.content-preview-box h4 {
  color: #fff;
  margin: 0 0 8px;
  font-size: 18px;
}
.content-preview-box a {
  color: #67e8f9;
}
.content-schedule {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
.content-social-editor {
  display: grid;
  gap: 8px;
  margin-top: 12px;
  border-top: 1px solid rgba(103,232,249,.12);
  padding-top: 12px;
}
.content-social-editor strong {
  color: #fff;
}
.content-webhook-event {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: center;
  border-top: 1px solid rgba(103,232,249,.12);
  padding-top: 10px;
  margin-top: 10px;
}
.content-webhook-event span {
  overflow-wrap: anywhere;
}
.content-webhook-event small {
  grid-column: 2;
  color: rgba(255,255,255,.58);
}
@media (max-width: 1180px) {
  .content-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .content-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .content-command {
    width: min(100vw - 20px, 1480px);
  }
  .content-command-header {
    flex-direction: column;
  }
  .content-metrics, .content-grid-two {
    grid-template-columns: 1fr;
  }
}
`
