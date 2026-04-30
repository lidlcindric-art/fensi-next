import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fensi — Frizerski salon, Zagreb',
  description: 'Frizerski salon Fensi — boja, pramenovi, valovi, keratin, svečane frizure. Šenova 7, Zagreb.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#150218" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
