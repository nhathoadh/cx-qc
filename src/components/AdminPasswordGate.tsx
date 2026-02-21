'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPasswordGate({ children }: { children: React.ReactNode }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [authed, setAuthed] = useState(false)
    const router = useRouter()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const res = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        })
        setLoading(false)
        if (res.ok) {
            setAuthed(true)
            router.refresh()
        } else {
            const data = await res.json()
            setError(data.error ?? 'Lỗi đăng nhập')
        }
    }

    if (!authed) {
        return (
            <div className="overlay">
                <form className="modal" onSubmit={handleLogin}>
                    <div style={{ fontSize: 40, marginBottom: 16, textAlign: 'center' }}>🔒</div>
                    <div className="modal-title" style={{ textAlign: 'center' }}>Khu vực Admin</div>
                    <div className="modal-subtitle" style={{ textAlign: 'center' }}>Vui lòng nhập mật khẩu để tiếp tục</div>
                    {error && <div className="alert alert-error">{error}</div>}
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Mật khẩu..."
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        )
    }

    return <>{children}</>
}
