import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/authOptions'
import connectDB from '../../../../lib/mongoose'
import User from '../../../../models/User'
import Email from '../../../../models/Email'
import { getMessageIds, getBatchEmailMetadata } from '../../../../lib/gmail'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const user = await User.findOne({ googleId: session.user.id })
    if (!user?.refreshToken) {
      return Response.json({ error: 'No refresh token found' }, { status: 400 })
    }

    // Step 1: Get the first 100 message IDs from inbox
    console.log('Fetching message IDs...')
    const { messageIds, nextPageToken } = await getMessageIds(user.refreshToken, 500)
    console.log(`Found ${messageIds.length} message IDs`)

    // Step 2: Fetch metadata for all of them in parallel
    console.log('Fetching metadata...')
    const emails = await getBatchEmailMetadata(user.refreshToken, messageIds)
    console.log(`Fetched metadata for ${emails.length} emails`)

    // Step 3: Save to MongoDB
    // insertMany with ordered:false means if one fails (e.g. duplicate),
    // it keeps going instead of stopping the whole batch
    let savedCount = 0
    for (const email of emails) {
      try {
        await Email.findOneAndUpdate(
          { userId: user._id, messageId: email.messageId },
          { ...email, userId: user._id },
          { upsert: true, new: true }
          // upsert: insert if not exists, update if exists
          // this means running scan twice won't create duplicates
        )
        savedCount++
      } catch (err) {
        console.error('Error saving email:', err.message)
      }
    }

    console.log(`Saved ${savedCount} emails to MongoDB`)

    return Response.json({
      success: true,
      fetched: emails.length,
      saved: savedCount,
      nextPageToken, // we'll use this in Phase 3 for pagination
    })

  } catch (error) {
    console.error('Scan error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}