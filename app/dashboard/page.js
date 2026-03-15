import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/authOptions'
import { redirect } from 'next/navigation'
import SignOutButton from './SignOutButton'
import DashboardClient from './DashboardClient'
import StatsBar from './StatsBar' 
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

return (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mailclean</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            style={{
              padding: '8px 16px',
              backgroundColor: '#4f46e5',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ⚡ Upgrade
          </Link>
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-600">{session.user.email}</span>
          <SignOutButton />
        </div>
      </div>
       {/* <StatsBar  refreshKey={statsRefreshKey}/> */}
      <DashboardClient />
    </div>
  </div>
)
}