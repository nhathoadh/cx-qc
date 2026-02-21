import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
import AdminPasswordGate from '@/components/AdminPasswordGate'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = cookies()
    const authCookie = cookieStore.get('admin_auth')
    const isAuthed = authCookie?.value === process.env.ADMIN_PASSWORD

    if (!isAuthed) {
        return <AdminPasswordGate>{children}</AdminPasswordGate>
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">{children}</div>
        </div>
    )
}
