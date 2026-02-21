'use client'

import { useEffect, useState } from 'react'

type Employee = { id: number; shortName: string; employeeCode: string; role: string }
type Feedback = {
    id: number; saleId: number; customerPhone: string | null; carInfo: string | null
    rating: number | null; feedbackText: string | null; feedbackAt: string | null
    criteriaCode: string | null; sale: { shortName: string }
}

const EMPTY = {
    saleId: '', customerPhone: '', carInfo: '', rating: 5,
    feedbackText: '', criteriaCode: '', feedbackAt: '',
}

export default function AdminFeedbackPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY })
    const [editId, setEditId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    async function loadEmps() {
        const res = await fetch('/api/employees')
        const data = await res.json()
        setEmployees(data.data ?? [])
    }
    async function loadFeedbacks() {
        const res = await fetch('/api/feedback')
        const data = await res.json()
        setFeedbacks(data.data ?? [])
    }

    useEffect(() => { loadEmps(); loadFeedbacks() }, [])

    async function save() {
        setSaving(true); setMsg(null)
        const body: Record<string, unknown> = {
            ...form,
            saleId: parseInt(String(form.saleId)),
            rating: Number(form.rating),
            feedbackAt: form.feedbackAt ? new Date(form.feedbackAt).toISOString() : null,
        }
        try {
            if (editId) {
                await fetch(`/api/feedback/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            } else {
                await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            }
            setMsg({ type: 'success', text: 'Đã lưu phản hồi' })
            setForm({ ...EMPTY }); setEditId(null)
            await loadFeedbacks()
        } catch {
            setMsg({ type: 'error', text: 'Lỗi khi lưu' })
        }
        setSaving(false)
    }

    async function deleteFb(id: number) {
        if (!confirm('Xóa phản hồi này?')) return
        await fetch(`/api/feedback/${id}`, { method: 'DELETE' })
        await loadFeedbacks()
    }

    function stars(n: number) { return '★'.repeat(n) + '☆'.repeat(5 - n) }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">💬 Quản lý phản hồi</h1>
            </div>
            {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

            <div className="card mb-24">
                <div className="card-title mb-16">{editId ? '✏️ Sửa phản hồi' : '➕ Thêm phản hồi'}</div>
                <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Sale phụ trách</label>
                        <select className="form-select" value={form.saleId} onChange={e => setForm(f => ({ ...f, saleId: e.target.value }))}>
                            <option value="">-- Chọn Sale --</option>
                            {employees.filter(e => e.role === 'Sale').map(e => <option key={e.id} value={e.id}>{e.shortName}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">SĐT khách hàng</label>
                        <input className="form-input" value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="0901..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Ngày phản hồi</label>
                        <input type="date" className="form-input" value={form.feedbackAt} onChange={e => setForm(f => ({ ...f, feedbackAt: e.target.value }))} />
                    </div>
                </div>
                <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Thông tin xe</label>
                        <input className="form-input" value={form.carInfo} onChange={e => setForm(f => ({ ...f, carInfo: e.target.value }))} placeholder="Biển số, loại xe..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Đánh giá (1–5 sao)</label>
                        <select className="form-select" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}>
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{stars(n)}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mã tiêu chí liên quan</label>
                        <input className="form-input" value={form.criteriaCode} onChange={e => setForm(f => ({ ...f, criteriaCode: e.target.value }))} placeholder="CX1, B1..." />
                    </div>
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Nội dung phản hồi</label>
                    <textarea className="form-textarea" rows={3} value={form.feedbackText} onChange={e => setForm(f => ({ ...f, feedbackText: e.target.value }))} placeholder="Khách hàng phản hồi..." />
                </div>
                <div className="flex gap-8">
                    <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm phản hồi'}</button>
                    {editId && <button className="btn btn-ghost" onClick={() => { setEditId(null); setForm({ ...EMPTY }) }}>Hủy</button>}
                </div>
            </div>

            <div className="card">
                <div className="card-title mb-16">Danh sách phản hồi ({feedbacks.length})</div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Ngày</th><th>Sale</th><th>Khách hàng</th><th>Xe</th><th>Đánh giá</th><th>Nội dung</th><th>Tiêu chí</th><th></th></tr></thead>
                        <tbody>
                            {feedbacks.map(fb => (
                                <tr key={fb.id}>
                                    <td className="text-sm">{fb.feedbackAt ? new Date(fb.feedbackAt).toLocaleDateString('vi-VN') : '—'}</td>
                                    <td style={{ fontWeight: 600 }}>{fb.sale.shortName}</td>
                                    <td className="text-sm">{fb.customerPhone ?? '—'}</td>
                                    <td className="text-sm text-muted truncate" style={{ maxWidth: 120 }}>{fb.carInfo ?? '—'}</td>
                                    <td style={{ color: 'var(--warning)', letterSpacing: -2 }}>{fb.rating ? stars(Math.round(Number(fb.rating))) : '—'}</td>
                                    <td className="text-sm truncate" style={{ maxWidth: 200 }}>{fb.feedbackText ?? '—'}</td>
                                    <td>{fb.criteriaCode ? <span className="badge badge-default font-mono">{fb.criteriaCode}</span> : <span className="text-muted">—</span>}</td>
                                    <td>
                                        <div className="flex gap-8">
                                            <button className="btn btn-ghost btn-sm" onClick={() => {
                                                setEditId(fb.id)
                                                setForm({ saleId: String(fb.saleId), customerPhone: fb.customerPhone ?? '', carInfo: fb.carInfo ?? '', rating: Number(fb.rating ?? 5), feedbackText: fb.feedbackText ?? '', criteriaCode: fb.criteriaCode ?? '', feedbackAt: fb.feedbackAt?.slice(0, 10) ?? '' })
                                            }}>Sửa</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteFb(fb.id)}>Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
