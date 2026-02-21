'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type CriteriaResult = {
    criteriaCode: string
    description: string
    weight: number
    threshold: number
    severityScore: number
    groupCode: string
    groupName: string
    groupActive: boolean
    rawValue: number | null
    calculatedScore: number | null
}

type Employee = { id: number; shortName: string; employeeCode: string; role: string; team: string; area: string }

function getDefaultMonth() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

export default function DetailScoringInner() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const employeeId = searchParams.get('employee')
    const month = searchParams.get('month') ?? getDefaultMonth()

    const [employees, setEmployees] = useState<Employee[]>([])
    const [results, setResults] = useState<CriteriaResult[]>([])
    const [loading, setLoading] = useState(false)
    const [employee, setEmployee] = useState<Employee | null>(null)

    useEffect(() => {
        fetch('/api/employees').then(r => r.json()).then(d => setEmployees(d.data ?? []))
    }, [])

    const loadScores = useCallback(async () => {
        if (!employeeId) return
        setLoading(true)
        const res = await fetch(`/api/scoring/calculate?employee_id=${employeeId}&apply_date=${month}`)
        const data = await res.json()
        setResults(data.data ?? [])
        setEmployee(employees.find(e => String(e.id) === employeeId) ?? null)
        setLoading(false)
    }, [employeeId, month, employees])

    useEffect(() => { loadScores() }, [loadScores])

    const totalScore = results
        .filter(r => r.groupActive && r.calculatedScore !== null)
        .reduce((sum, r) => sum + (r.calculatedScore ?? 0), 0)

    const selectEmployee = (id: string) => router.push(`/detail?employee=${id}&month=${month}`)
    const selectMonth = (m: string) => router.push(`/detail?employee=${employeeId ?? ''}&month=${m}`)

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">📋 Chi tiết điểm</h1>
                <p className="page-subtitle">Xem điểm chi tiết theo từng tiêu chí cho nhân viên</p>
            </div>

            <div className="card mb-24">
                <div className="form-row form-row-3">
                    <div className="form-group">
                        <label className="form-label">Nhân viên</label>
                        <select className="form-select" value={employeeId ?? ''} onChange={e => selectEmployee(e.target.value)}>
                            <option value="">-- Chọn nhân viên --</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.shortName} ({e.role} / {e.area})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tháng</label>
                        <input type="month" className="form-input" value={month.slice(0, 7)} onChange={e => selectMonth(e.target.value + '-01')} />
                    </div>
                </div>
            </div>

            {loading && <div className="loading-wrap"><div className="spinner" /></div>}

            {!loading && employeeId && employee && (
                <>
                    <div className="card mb-24" style={{ background: 'linear-gradient(135deg, #1a1d27, #22263a)' }}>
                        <div className="flex items-center gap-16">
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👤</div>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 700 }}>{employee.shortName}</div>
                                <div className="flex gap-8 mt-4">
                                    <span className="badge badge-accent">{employee.role}</span>
                                    <span className="badge badge-default">{employee.team}</span>
                                    <span className="badge badge-default">{employee.area}</span>
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <div className="text-muted text-sm">Tổng điểm</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>{totalScore.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    {results.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-text">Không có tiêu chí nào cho tháng này</div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-title mb-16">Chi tiết theo tiêu chí</div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nhóm</th><th>Mã tiêu chí</th><th>Mô tả</th>
                                            <th>Trọng số</th><th>Ngưỡng</th><th>Giá trị TH</th><th>Điểm</th><th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map(r => (
                                            <tr key={r.criteriaCode} style={{ opacity: r.groupActive ? 1 : 0.5 }}>
                                                <td><span className="text-sm">{r.groupName}</span></td>
                                                <td><span className="badge badge-default font-mono">{r.criteriaCode}</span></td>
                                                <td className="truncate" style={{ maxWidth: 240 }}>{r.description}</td>
                                                <td>{(r.weight * 100).toFixed(0)}%</td>
                                                <td>{r.threshold}</td>
                                                <td>{r.groupActive ? (r.rawValue?.toFixed(4) ?? '—') : '—'}</td>
                                                <td>
                                                    {r.groupActive && r.calculatedScore !== null
                                                        ? <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{r.calculatedScore.toFixed(4)}</span>
                                                        : <span className="text-muted">—</span>}
                                                </td>
                                                <td>
                                                    {r.groupActive
                                                        ? <span className="badge badge-success">✓ Tính điểm</span>
                                                        : <span className="inactive-note">⚠ Không tính vào tổng điểm</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!employeeId && !loading && (
                <div className="empty-state">
                    <div className="empty-state-icon">👈</div>
                    <div className="empty-state-text">Chọn nhân viên để xem chi tiết điểm</div>
                </div>
            )}
        </div>
    )
}
