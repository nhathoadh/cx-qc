'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const guestLinks = [
    { href: '/', label: 'Bảng xếp hạng' },
    { href: '/detail', label: 'Chi tiết điểm' },
    { href: '/events', label: 'Sự kiện' },
    { href: '/feedback', label: 'Phản hồi' },
]

export default function Navbar() {
    const pathname = usePathname()
    const isAdmin = pathname.startsWith('/admin')

    return (
        <nav className="navbar">
            <Link href="/" className="navbar-brand">
                CX<span>QC</span>
            </Link>
            {!isAdmin && (
                <div className="navbar-links">
                    {guestLinks.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`nav-link ${pathname === l.href ? 'active' : ''}`}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>
            )}
            <div className="navbar-right">
                {isAdmin ? (
                    <Link href="/" className="btn btn-ghost btn-sm">
                        ← Guest view
                    </Link>
                ) : (
                    <Link href="/admin" className="btn btn-ghost btn-sm">
                        🔒 Admin
                    </Link>
                )}
            </div>
        </nav>
    )
}
