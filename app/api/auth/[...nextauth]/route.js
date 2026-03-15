import NextAuth from 'next-auth'
import { authOptions } from '../../../../lib/authOptions'

// NextAuth needs a route handler that catches all /api/auth/* requests.
// The [...nextauth] folder name is Next.js syntax for a catch-all route.
// This single file handles: sign in, sign out, session, and callbacks.

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }