/**
 * Deployment notification utilities
 */

interface NotificationPayload {
  title: string
  message: string
  environment: string
  status: 'success' | 'failure' | 'warning' | 'info'
  metadata?: {
    buildId?: string
    commitHash?: string
    deploymentUrl?: string
    duration?: number
    author?: string
  }
}

interface WebhookConfig {
  url: string
  headers?: Record<string, string>
  format: 'slack' | 'discord' | 'teams' | 'generic'
}

/**
 * Send deployment notification to configured webhooks
 */
export async function sendDeploymentNotification(payload: NotificationPayload): Promise<void> {
  const webhooks = getConfiguredWebhooks()
  
  if (webhooks.length === 0) {
    console.log('No webhooks configured for notifications')
    return
  }

  const promises = webhooks.map(webhook => sendWebhookNotification(webhook, payload))
  
  try {
    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Failed to send some notifications:', error)
  }
}

/**
 * Get configured webhook URLs from environment
 */
function getConfiguredWebhooks(): WebhookConfig[] {
  const webhooks: WebhookConfig[] = []
  
  // Slack webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    webhooks.push({
      url: process.env.SLACK_WEBHOOK_URL,
      format: 'slack',
    })
  }
  
  // Discord webhook
  if (process.env.DISCORD_WEBHOOK_URL) {
    webhooks.push({
      url: process.env.DISCORD_WEBHOOK_URL,
      format: 'discord',
    })
  }
  
  // Microsoft Teams webhook
  if (process.env.TEAMS_WEBHOOK_URL) {
    webhooks.push({
      url: process.env.TEAMS_WEBHOOK_URL,
      format: 'teams',
    })
  }
  
  // Generic webhook
  if (process.env.GENERIC_WEBHOOK_URL) {
    webhooks.push({
      url: process.env.GENERIC_WEBHOOK_URL,
      format: 'generic',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.WEBHOOK_AUTH_TOKEN || '',
      },
    })
  }
  
  return webhooks
}

/**
 * Send notification to specific webhook
 */
async function sendWebhookNotification(webhook: WebhookConfig, payload: NotificationPayload): Promise<void> {
  try {
    const body = formatPayloadForWebhook(webhook.format, payload)
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...webhook.headers,
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`)
    }
    
    console.log(`Notification sent successfully to ${webhook.format} webhook`)
  } catch (error) {
    console.error(`Failed to send notification to ${webhook.format} webhook:`, error)
  }
}

/**
 * Format payload for different webhook types
 */
function formatPayloadForWebhook(format: WebhookConfig['format'], payload: NotificationPayload): any {
  const emoji = getStatusEmoji(payload.status)
  const color = getStatusColor(payload.status)
  
  switch (format) {
    case 'slack':
      return {
        text: `${emoji} ${payload.title}`,
        attachments: [
          {
            color,
            fields: [
              {
                title: 'Environment',
                value: payload.environment,
                short: true,
              },
              {
                title: 'Status',
                value: payload.status,
                short: true,
              },
              ...(payload.metadata?.buildId ? [{
                title: 'Build ID',
                value: payload.metadata.buildId,
                short: true,
              }] : []),
              ...(payload.metadata?.commitHash ? [{
                title: 'Commit',
                value: payload.metadata.commitHash.substring(0, 8),
                short: true,
              }] : []),
              ...(payload.metadata?.duration ? [{
                title: 'Duration',
                value: `${Math.round(payload.metadata.duration / 1000)}s`,
                short: true,
              }] : []),
            ],
            text: payload.message,
            footer: 'The Robot Overlord Deployment',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      }

    case 'discord':
      return {
        content: `${emoji} **${payload.title}**`,
        embeds: [
          {
            title: payload.title,
            description: payload.message,
            color: parseInt(color.replace('#', ''), 16),
            fields: [
              {
                name: 'Environment',
                value: payload.environment,
                inline: true,
              },
              {
                name: 'Status',
                value: payload.status,
                inline: true,
              },
              ...(payload.metadata?.buildId ? [{
                name: 'Build ID',
                value: payload.metadata.buildId,
                inline: true,
              }] : []),
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'The Robot Overlord',
            },
          },
        ],
      }

    case 'teams':
      return {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: payload.title,
        themeColor: color,
        sections: [
          {
            activityTitle: payload.title,
            activitySubtitle: payload.message,
            activityImage: 'https://via.placeholder.com/64x64/0078d4/ffffff?text=🤖',
            facts: [
              {
                name: 'Environment',
                value: payload.environment,
              },
              {
                name: 'Status',
                value: payload.status,
              },
              ...(payload.metadata?.buildId ? [{
                name: 'Build ID',
                value: payload.metadata.buildId,
              }] : []),
            ],
          },
        ],
      }

    case 'generic':
    default:
      return {
        title: payload.title,
        message: payload.message,
        environment: payload.environment,
        status: payload.status,
        timestamp: new Date().toISOString(),
        metadata: payload.metadata,
      }
  }
}

/**
 * Get emoji for status
 */
function getStatusEmoji(status: NotificationPayload['status']): string {
  switch (status) {
    case 'success': return '✅'
    case 'failure': return '❌'
    case 'warning': return '⚠️'
    case 'info': return 'ℹ️'
    default: return '📢'
  }
}

/**
 * Get color for status
 */
function getStatusColor(status: NotificationPayload['status']): string {
  switch (status) {
    case 'success': return '#28a745'
    case 'failure': return '#dc3545'
    case 'warning': return '#ffc107'
    case 'info': return '#17a2b8'
    default: return '#6c757d'
  }
}

/**
 * Predefined notification templates
 */
export const notificationTemplates = {
  deploymentStarted: (environment: string, buildId: string): NotificationPayload => ({
    title: 'Deployment Started',
    message: `Deployment to ${environment} has begun`,
    environment,
    status: 'info',
    metadata: { buildId },
  }),

  deploymentSuccess: (environment: string, buildId: string, duration: number, deploymentUrl?: string): NotificationPayload => ({
    title: 'Deployment Successful',
    message: `Successfully deployed to ${environment}`,
    environment,
    status: 'success',
    metadata: { buildId, duration, deploymentUrl },
  }),

  deploymentFailure: (environment: string, buildId: string, error: string): NotificationPayload => ({
    title: 'Deployment Failed',
    message: `Deployment to ${environment} failed: ${error}`,
    environment,
    status: 'failure',
    metadata: { buildId },
  }),

  healthCheckFailed: (environment: string, url: string): NotificationPayload => ({
    title: 'Health Check Failed',
    message: `Health check failed for ${environment} at ${url}`,
    environment,
    status: 'failure',
  }),

  performanceAlert: (environment: string, metric: string, value: number, threshold: number): NotificationPayload => ({
    title: 'Performance Alert',
    message: `${metric} exceeded threshold: ${value} > ${threshold}`,
    environment,
    status: 'warning',
  }),
}
