'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
    { href: '/admin', label: '🏠 Dashboard', exact: true },
    { href: '/admin/employees', label: '👥 Nhân viên' },
    { href: '/admin/criteria', label: '📏 Tiêu chí' },
    { href: '/admin/events', label: '📅 Sự kiện' },
    { href: '/admin/feedback', label: '💬 Phản hồi' },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()

    async function handleLogout() {
        await fetch('/api/admin/auth', { method: 'DELETE' })
        router.push('/')
        router.refresh()
    }

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-title">Menu</div>
            {links.map(l => {
                const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
                return (
                    <Link key={l.href} href={l.href} className={`sidebar-link ${active ? 'active' : ''}`}>
                        {l.label}
                    </Link>
                )
            })}
            <div style={{ flex: 1 }} />
            <button onClick={handleLogout} className="sidebar-link" style={{ color: 'var(--danger)', marginTop: 24 }}>
                🚪 Đăng xuất
            </button>
        </aside>
    )
}
