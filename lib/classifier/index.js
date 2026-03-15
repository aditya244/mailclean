import { classifyByRules } from './rules'
import { classifyByDomain } from './domain'
import { classifyByAI } from './ai'

// Confidence threshold — if a layer returns confidence above this,
// we trust it and skip subsequent layers
const CONFIDENCE_THRESHOLD = 0.85

export async function classifyEmail(email) {
  // Layer 1: Rules (free, instant)
  const rulesResult = classifyByRules(email)
  if (rulesResult && rulesResult.confidence >= CONFIDENCE_THRESHOLD) {
    return { ...rulesResult, classificationSource: 'rules' }
  }

  // Layer 2: Domain reputation (free, fast)
  const domainResult = classifyByDomain(email)
  if (domainResult && domainResult.confidence >= CONFIDENCE_THRESHOLD) {
    return { ...domainResult, classificationSource: 'domain' }
  }

  // Layer 3: Gemini AI (paid — only reaches here if both above layers
  // returned null or low confidence)
  console.log(`AI classifying: ${email.subject?.substring(0, 50)}`)
  const aiResult = await classifyByAI(email)
  return { ...aiResult, classificationSource: 'ai' }
}

// Classify multiple emails — processes them with a small delay
// between AI calls to avoid hitting Gemini rate limits
export async function classifyEmails(emails) {
  const results = []

  for (const email of emails) {
    const result = await classifyEmail(email);
    results.push({ emailId: email._id, messageId: email.messageId, ...result });

    // Small delay only when AI layer is used to respect rate limits
    // if (result.classificationSource === 'ai') {
    //   await new Promise(resolve => setTimeout(resolve, 200))
    // }

    // better — 1 second between AI calls during development
    // stays well under any tier's per-minute limit
    if (result.classificationSource === "ai") {
      const delay = process.env.NODE_ENV === "production" ? 100 : 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results
}