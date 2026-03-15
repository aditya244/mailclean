'use client'

// SessionProvider makes useSession() available throughout the app.
// It needs to wrap everything, so it goes in the root layout.

import { SessionProvider } from 'next-auth/react'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}