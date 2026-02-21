'use client'

import Link from 'next/link'

export default function AdminDashboard() {
    const cards = [
        { href: '/admin/employees', icon: '👥', title: 'Nhân viên', desc: 'Thêm, sửa, vô hiệu hóa nhân viên' },
        { href: '/admin/criteria', icon: '📏', title: 'Tiêu chí', desc: 'Quản lý nhóm và tiêu chí chấm điểm' },
        { href: '/admin/events', icon: '📅', title: 'Sự kiện', desc: 'Nhập sự kiện kiểm định, chốt deal' },
        { href: '/admin/feedback', icon: '💬', title: 'Phản hồi', desc: 'Nhập phản hồi khách hàng' },
    ]
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">⚙️ Admin Dashboard</h1>
                <p className="page-subtitle">Quản lý dữ liệu hệ thống CX-QC</p>
            </div>
            <div className="grid-2">
                {cards.map(c => (
                    <Link key={c.href} href={c.href} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        >
                            <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
                            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
                            <div className="text-sm text-muted">{c.desc}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
