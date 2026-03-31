import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import FarmerLayoutWrapper from '@/components/layout/FarmerLayoutWrapper'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Farmer Portal - ChaiYetu',
  description: 'Tea management system for farmers',
}

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FarmerLayoutWrapper>
          {children}
        </FarmerLayoutWrapper>
      </body>
    </html>
  )
}