// Layer 2: Domain reputation check
// Checks if the sender domain looks suspicious based on
// simple heuristics — no external API needed for now

// Common legitimate email providers — emails from these
// domains are likely personal and should go to AI layer
const PERSONAL_EMAIL_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'protonmail.com', 'rediffmail.com', 'ymail.com'
]

// Patterns that suggest a domain is used for bulk/spam sending
const SUSPICIOUS_PATTERNS = [
  /^mail\./,        // mail.spammydomain.com
  /^em\d+\./,       // em123.sender.com (common ESP subdomain pattern)
  /^email\./,       // email.company.com
  /^news\./,        // news.company.com
  /^newsletter\./,  // newsletter.company.com
  /^noreply\./,     // noreply.company.com
  /^no-reply\./,    // no-reply.company.com
  /^bounce\./,      // bounce.company.com
  /^send\./,        // send.company.com
  /^bulk\./,        // bulk.company.com
]

function extractDomain(fromHeader) {
  if (!fromHeader) return null
  const match = fromHeader.match(/@([^>>\s]+)/)
  return match ? match[1].toLowerCase() : null
}

function extractBaseDomain(domain) {
  // Extracts base domain from subdomains
  // e.g. em123.newsletter.amazon.com → amazon.com
  if (!domain) return null
  const parts = domain.split('.')
  if (parts.length > 2) {
    return parts.slice(-2).join('.')
  }
  return domain
}

export function classifyByDomain(email) {
  const { from } = email
  const domain = extractDomain(from)

  if (!domain) return null

  // If it's a personal email provider, it's likely personal
  // Pass to AI layer for better classification
  if (PERSONAL_EMAIL_PROVIDERS.includes(domain)) {
    return null // let AI handle personal emails
  }

  // Check for suspicious subdomain patterns (bulk senders)
  const isSuspiciousSubdomain = SUSPICIOUS_PATTERNS.some(pattern =>
    pattern.test(domain)
  )

  if (isSuspiciousSubdomain) {
    return {
      category: 'Promotions',
      confidence: 0.78,
      reason: `Suspicious sender subdomain pattern: ${domain}`,
    }
  }

  // Check if sender is noreply — likely automated/notification
  const localPart = from?.match(/^([^@<\s]+)/)?.[1]?.toLowerCase()
  if (localPart && (localPart.includes('noreply') || localPart.includes('no-reply'))) {
    return {
      category: 'Notifications',
      confidence: 0.80,
      reason: 'No-reply sender address',
    }
  }

  // Cannot determine from domain alone
  return null
}