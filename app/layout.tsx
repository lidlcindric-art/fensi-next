import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fensi — Frizerski salon, Zagreb',
  description: 'Frizerski salon Fensi — boja, pramenovi, valovi, keratin, svečane frizure. Rezerviraj termin online. Šenova 7, Zagreb.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500;1,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0a0806" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  )
}
