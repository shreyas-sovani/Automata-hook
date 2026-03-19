import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutomataHook Dashboard',
  description: 'Reactive Network workflow visualization for AutomataHook',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  )
}
