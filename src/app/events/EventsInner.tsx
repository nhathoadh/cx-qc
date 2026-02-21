'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Event = {
    id: number; eventType: string; eventTimestamp: string
    isUniform: boolean | null; ontimeStatusDetail: string | null
    location: string | null; notes: string | null
    actor: { shortName: string; employeeCode: string }
}
type Employee = { id: number; shortName: string; role: string; area: string }

export default function EventsInner() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const employeeId = searchParams.get('employee') ?? ''

    const [employees, setEmployees] = useState<Employee[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/employees').then(r => r.json()).then(d => setEmployees(d.data ?? []))
    }, [])

    const loadEvents = useCallback(async () => {
        setLoading(true)
        const url = employeeId ? `/api/events?employee_id=${employeeId}` : '/api/events'
        const res = await fetch(url)
        const data = await res.json()
        setEvents(data.data ?? [])
        setLoading(false)
    }, [employeeId])

    useEffect(() => { loadEvents() }, [loadEvents])

    function formatDate(s: string) {
        return new Date(s).toLocaleString('vi-VN')
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">📅 Sự kiện</h1>
                <p className="page-subtitle">Danh sách sự kiện kiểm định, chốt deal, check-in...</p>
            </div>

            <div className="card mb-24">
                <div className="form-group">
                    <label className="form-label">Lọc theo nhân viên</label>
                    <select
                        className="form-select"
                        style={{ maxWidth: 300 }}
                        value={employeeId}
                        onChange={e => router.push(`/events?employee=${e.target.value}`)}
                    >
                        <option value="">-- Tất cả --</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.shortName} ({e.role}/{e.area})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <div className="loading-wrap"><div className="spinner" /></div>}
            {!loading && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Sự kiện ({events.length})</span>
                    </div>
                    {events.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-text">Không có sự kiện nào</div>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Loại sự kiện</th>
                                        <th>Nhân viên</th>
                                        <th>Đúng giờ</th>
                                        <th>Đồng phục</th>
                                        <th>Địa điểm</th>
                                        <th>Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(e => (
                                        <tr key={e.id}>
                                            <td className="text-sm">{formatDate(e.eventTimestamp)}</td>
                                            <td><span className="badge badge-accent">{e.eventType}</span></td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{e.actor.shortName}</div>
                                                <div className="text-xs text-muted">{e.actor.employeeCode}</div>
                                            </td>
                                            <td>
                                                {e.ontimeStatusDetail
                                                    ? <span className={`badge ${e.ontimeStatusDetail === 'Đúng giờ' ? 'badge-success' : 'badge-warning'}`}>{e.ontimeStatusDetail}</span>
                                                    : <span className="text-muted">—</span>}
                                            </td>
                                            <td>
                                                {e.isUniform === null ? <span className="text-muted">—</span>
                                                    : e.isUniform ? <span className="badge badge-success">✓</span>
                                                        : <span className="badge badge-danger">✗</span>}
                                            </td>
                                            <td className="text-sm text-muted truncate" style={{ maxWidth: 160 }}>{e.location ?? '—'}</td>
                                            <td className="text-sm text-muted truncate" style={{ maxWidth: 200 }}>{e.notes ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
