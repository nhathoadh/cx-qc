import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
    title: 'CXQC — Hệ thống chấm điểm chất lượng',
    description: 'Hệ thống quản lý, chấm điểm và xếp hạng nhân viên theo tiêu chí CX-QC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi">
            <body>
                <Navbar />
                <main>{children}</main>
            </body>
        </html>
    )
}
