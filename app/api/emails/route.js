import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/authOptions'
import connectDB from '../../../lib/mongoose'
import User from '../../../models/User'
import Email from '../../../models/Email'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20 // emails per page

  if (!category) {
    return Response.json({ error: 'Category is required' }, { status: 400 })
  }

  try {
    await connectDB()

    const user = await User.findOne({ googleId: session.user.id })
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const skip = (page - 1) * limit

    // Fetch emails for this user and category
    const [emails, total] = await Promise.all([
      Email.find({ userId: user._id, category })
        .sort({ date: -1 }) // newest first
        .skip(skip)
        .limit(limit)
        .select('messageId from subject date confidence classificationSource hasAttachment labelIds headers'),
      Email.countDocuments({ userId: user._id, category }),
    ])

    return Response.json({
      emails,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + emails.length < total,
    })

  } catch (error) {
    console.error('Error fetching emails:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}