'use client'

import { useEffect, useState } from 'react'

type Employee = { id: number; shortName: string; employeeCode: string; role: string }
type CheckEvent = {
    id: number; eventType: string; eventTimestamp: string
    actorId: number; isUniform: boolean | null; ontimeStatusDetail: string | null
    location: string | null; notes: string | null
    actor: { shortName: string }
}

const EVENT_TYPES = ['INSPECTION', 'NOTARY', 'CLOSING_DEAL', 'CHECK_IN', 'OTHER']
const ONTIME_OPTIONS = ['Đúng giờ', 'Trễ 15p', 'Trễ 30p', 'Trễ >30p']

const EMPTY = {
    eventType: 'INSPECTION', actorId: '', eventTimestamp: '',
    isUniform: true, ontimeStatusDetail: 'Đúng giờ', location: '', notes: '',
}

export default function AdminEventsPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [events, setEvents] = useState<CheckEvent[]>([])
    const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY })
    const [editId, setEditId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    async function loadEmps() {
        const res = await fetch('/api/employees')
        const data = await res.json()
        setEmployees(data.data ?? [])
    }
    async function loadEvents() {
        const res = await fetch('/api/events')
        const data = await res.json()
        setEvents(data.data ?? [])
    }
    useEffect(() => { loadEmps(); loadEvents() }, [])

    async function save() {
        setSaving(true); setMsg(null)
        const body = { ...form, actorId: parseInt(String(form.actorId)), eventTimestamp: new Date(form.eventTimestamp).toISOString() }
        try {
            if (editId) {
                await fetch(`/api/events/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            } else {
                await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            }
            setMsg({ type: 'success', text: 'Đã lưu sự kiện' })
            setForm({ ...EMPTY }); setEditId(null)
            await loadEvents()
        } catch {
            setMsg({ type: 'error', text: 'Lỗi khi lưu' })
        }
        setSaving(false)
    }

    async function deleteEvent(id: number) {
        if (!confirm('Xóa sự kiện này?')) return
        await fetch(`/api/events/${id}`, { method: 'DELETE' })
        await loadEvents()
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">📅 Quản lý sự kiện</h1>
            </div>
            {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

            <div className="card mb-24">
                <div className="card-title mb-16">{editId ? '✏️ Sửa sự kiện' : '➕ Thêm sự kiện'}</div>
                <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Loại sự kiện</label>
                        <select className="form-select" value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))}>
                            {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nhân viên thực hiện</label>
                        <select className="form-select" value={form.actorId} onChange={e => setForm(f => ({ ...f, actorId: e.target.value }))}>
                            <option value="">-- Chọn --</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.shortName} ({e.role})</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Thời gian</label>
                        <input type="datetime-local" className="form-input" value={form.eventTimestamp} onChange={e => setForm(f => ({ ...f, eventTimestamp: e.target.value }))} />
                    </div>
                </div>
                <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Trạng thái đúng giờ</label>
                        <select className="form-select" value={form.ontimeStatusDetail} onChange={e => setForm(f => ({ ...f, ontimeStatusDetail: e.target.value }))}>
                            {ONTIME_OPTIONS.map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Đồng phục</label>
                        <select className="form-select" value={String(form.isUniform)} onChange={e => setForm(f => ({ ...f, isUniform: e.target.value === 'true' }))}>
                            <option value="true">✓ Có đồng phục</option>
                            <option value="false">✗ Không có</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Địa điểm</label>
                        <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Địa chỉ..." />
                    </div>
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Ghi chú</label>
                    <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="flex gap-8">
                    <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm sự kiện'}</button>
                    {editId && <button className="btn btn-ghost" onClick={() => { setEditId(null); setForm({ ...EMPTY }) }}>Hủy</button>}
                </div>
            </div>

            <div className="card">
                <div className="card-title mb-16">Danh sách sự kiện ({events.length})</div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Thời gian</th><th>Loại</th><th>NV</th><th>Đúng giờ</th><th>ĐP</th><th>Địa điểm</th><th>Ghi chú</th><th></th></tr></thead>
                        <tbody>
                            {events.map(e => (
                                <tr key={e.id}>
                                    <td className="text-sm">{new Date(e.eventTimestamp).toLocaleString('vi-VN')}</td>
                                    <td><span className="badge badge-accent">{e.eventType}</span></td>
                                    <td style={{ fontWeight: 600 }}>{e.actor.shortName}</td>
                                    <td>
                                        {e.ontimeStatusDetail
                                            ? <span className={`badge ${e.ontimeStatusDetail === 'Đúng giờ' ? 'badge-success' : 'badge-warning'}`}>{e.ontimeStatusDetail}</span>
                                            : <span className="text-muted">—</span>}
                                    </td>
                                    <td>{e.isUniform === null ? '—' : e.isUniform ? <span className="badge badge-success">✓</span> : <span className="badge badge-danger">✗</span>}</td>
                                    <td className="text-sm text-muted truncate" style={{ maxWidth: 140 }}>{e.location ?? '—'}</td>
                                    <td className="text-sm text-muted truncate" style={{ maxWidth: 160 }}>{e.notes ?? '—'}</td>
                                    <td>
                                        <div className="flex gap-8">
                                            <button className="btn btn-ghost btn-sm" onClick={() => {
                                                setEditId(e.id)
                                                setForm({ eventType: e.eventType, actorId: String(e.actorId), eventTimestamp: e.eventTimestamp.slice(0, 16), isUniform: e.isUniform ?? true, ontimeStatusDetail: e.ontimeStatusDetail ?? 'Đúng giờ', location: e.location ?? '', notes: e.notes ?? '' })
                                            }}>Sửa</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(e.id)}>Xóa</button>
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
