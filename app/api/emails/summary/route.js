import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/authOptions'
import connectDB from '../../../../lib/mongoose'
import User from '../../../../models/User'
import Email from '../../../../models/Email'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const user = await User.findOne({ googleId: session.user.id })
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Count emails per category for this user
    const categoryCounts = await Email.aggregate([
      {
        $match: {
          userId: user._id,
          isProcessed: true,
          category: { $ne: null },
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        }
      }
    ])

    if (categoryCounts.length === 0) {
      return Response.json({ summary: null })
    }

    // Convert array to object: [{ _id: 'Finance', count: 15 }] → { Finance: 15 }
    const summary = {}
    categoryCounts.forEach(item => {
      summary[item._id] = item.count
    })

    // Also get layer stats
    const layerCounts = await Email.aggregate([
      {
        $match: {
          userId: user._id,
          isProcessed: true,
        }
      },
      {
        $group: {
          _id: '$classificationSource',
          count: { $sum: 1 },
        }
      }
    ])

    const layerStats = {}
    layerCounts.forEach(item => {
      if (item._id) layerStats[item._id] = item.count
    })

    return Response.json({ summary, layerStats })

  } catch (error) {
    console.error('Error fetching summary:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}