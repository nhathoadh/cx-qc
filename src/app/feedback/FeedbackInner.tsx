'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Feedback = {
    id: number; customerPhone: string | null; carInfo: string | null
    rating: number | null; feedbackText: string | null; feedbackAt: string | null
    criteriaCode: string | null; createdAt: string
    sale: { shortName: string; employeeCode: string }
}
type Employee = { id: number; shortName: string; role: string; area: string }

function Stars({ rating }: { rating: number }) {
    return (
        <span className="stars">
            {[1, 2, 3, 4, 5].map(i => i <= rating ? '★' : '☆').join('')}
        </span>
    )
}

export default function FeedbackInner() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const employeeId = searchParams.get('employee') ?? ''

    const [employees, setEmployees] = useState<Employee[]>([])
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/employees').then(r => r.json()).then(d => setEmployees(d.data ?? []))
    }, [])

    const loadFeedbacks = useCallback(async () => {
        setLoading(true)
        const url = employeeId ? `/api/feedback?employee_id=${employeeId}` : '/api/feedback'
        const res = await fetch(url)
        const data = await res.json()
        setFeedbacks(data.data ?? [])
        setLoading(false)
    }, [employeeId])

    useEffect(() => { loadFeedbacks() }, [loadFeedbacks])

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">💬 Phản hồi khách hàng</h1>
                <p className="page-subtitle">Danh sách phản hồi từ khách hàng</p>
            </div>

            <div className="card mb-24">
                <div className="form-group">
                    <label className="form-label">Lọc theo Sale</label>
                    <select
                        className="form-select"
                        style={{ maxWidth: 300 }}
                        value={employeeId}
                        onChange={e => router.push(`/feedback?employee=${e.target.value}`)}
                    >
                        <option value="">-- Tất cả --</option>
                        {employees.filter(e => e.role === 'Sale').map(e => (
                            <option key={e.id} value={e.id}>{e.shortName} ({e.area})</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <div className="loading-wrap"><div className="spinner" /></div>}
            {!loading && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Phản hồi ({feedbacks.length})</span>
                    </div>
                    {feedbacks.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-text">Chưa có phản hồi nào</div>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Sale</th>
                                        <th>Khách hàng</th>
                                        <th>Xe</th>
                                        <th>Đánh giá</th>
                                        <th>Nội dung</th>
                                        <th>Tiêu chí</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbacks.map(f => (
                                        <tr key={f.id}>
                                            <td className="text-sm">
                                                {f.feedbackAt ? new Date(f.feedbackAt).toLocaleDateString('vi-VN') : '—'}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{f.sale.shortName}</div>
                                                <div className="text-xs text-muted">{f.sale.employeeCode}</div>
                                            </td>
                                            <td className="text-sm">{f.customerPhone ?? '—'}</td>
                                            <td className="text-sm text-muted truncate" style={{ maxWidth: 140 }}>{f.carInfo ?? '—'}</td>
                                            <td>{f.rating !== null ? <Stars rating={Math.round(f.rating)} /> : '—'}</td>
                                            <td className="text-sm truncate" style={{ maxWidth: 240 }}>{f.feedbackText ?? '—'}</td>
                                            <td>
                                                {f.criteriaCode
                                                    ? <span className="badge badge-default font-mono">{f.criteriaCode}</span>
                                                    : <span className="text-muted">—</span>}
                                            </td>
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
