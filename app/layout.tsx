import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CIAYN - Compliance Is All You Need',
  description: 'A tool to help you manage your compliance',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
