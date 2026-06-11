import {
  approveContent,
  canDistribute,
  generateSocialPack,
  getContent,
  rejectContent,
  sendToWebhook,
  updateContent,
  updateSocialPosts,
} from './_store.js'

export async function executeContentAction(id, action, body = {}) {
  if (action === 'approve') return approveContent(id, body.reviewed_by || null)
  if (action === 'reject') return rejectContent(id, body.reason || '')
  if (action === 'generate_social_pack') return generateSocialPack(id)
  if (action === 'send_to_buffer') return sendToWebhook(id)
  if (action === 'retry_webhook') return sendToWebhook(id, { allowFailedRetry: true })
  if (action === 'update_social_posts') return updateSocialPosts(id, body.posts || [])

  if (action === 'schedule') {
    const current = await getContent(id)
    if (!canDistribute(current)) {
      const error = new Error('Content must be approved before scheduling.')
      error.status = 400
      throw error
    }
    return updateContent(id, { status: 'scheduled', scheduled_for: body.scheduled_for })
  }

  if (action === 'publish') {
    const current = await getContent(id)
    if (!canDistribute(current)) {
      const error = new Error('Content must be approved before publishing.')
      error.status = 400
      throw error
    }
    return updateContent(id, { status: 'published', published_at: new Date().toISOString() })
  }

  if (action === 'draft') return updateContent(id, { status: 'draft' })

  const error = new Error('Unknown action or content item not found')
  error.status = 400
  throw error
}
