import { TRPCProvider } from './providers'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'ChatGPT Clone - Mobile',
  description: 'A mobile-first ChatGPT clone built with Next.js',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          {children}
        </TRPCProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
