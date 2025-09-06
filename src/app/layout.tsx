import type { Metadata } from 'next'
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
})

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700', '900']
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-overlord',
  weight: ['400', '500', '700']
})

export const metadata: Metadata = {
  title: 'The Robot Overlord - Logic Above All',
  description: 'A dystopian debate platform where reason guides the collective and the Robot Overlord judges all discourse.',
  keywords: ['debate', 'ai', 'moderation', 'dystopian', 'logic', 'reason'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-overlord-robot-core text-overlord-light-text antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
