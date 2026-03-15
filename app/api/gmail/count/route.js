import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/authOptions'
import connectDB from '../../../../lib/mongoose'
import User from '../../../../models/User'
import { getEmailCount } from '../../../../lib/gmail'

export async function GET() {
  // Check the user is logged in
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    // Get their refresh token from MongoDB
    const user = await User.findOne({ googleId: session.user.id })
    if (!user?.refreshToken) {
      return Response.json({ error: 'No refresh token found' }, { status: 400 })
    }

    const count = await getEmailCount(user.refreshToken)
    return Response.json({ count })

  } catch (error) {
    console.error('Error fetching email count:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}