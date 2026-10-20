import type { Metadata, Viewport } from 'next'
import { Archivo, Public_Sans } from 'next/font/google'
import '@/styles/global.css'

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
})

// Public Sans, not Inter — Inter is the default-stack tell of generated work.
const publicSans = Public_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dalton Coding — Kodiranje i adaptacija vozila',
  description:
    'Otključavanje skrivenih fabričkih opcija na vašem Mercedesu. Kodiranje, ambijentalno osvjetljenje, CarPlay, Android Auto i najnovije navigacione mape. Podgorica.',
  openGraph: {
    title: 'Dalton Coding — Kodiranje i adaptacija vozila',
    description: 'Otključajte skrivene opcije vašeg Mercedesa. Doživotna garancija.',
    locale: 'sr_ME',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f0d0a',
  width: 'device-width',
  initialScale: 1,
  // The cabin is a fixed stage; pinch-zoom would break the pan model.
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr-ME" className={`${archivo.variable} ${publicSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
