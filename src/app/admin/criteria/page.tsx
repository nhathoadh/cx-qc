'use client'

import { useEffect, useState } from 'react'

type Group = { groupCode: string; applyDate: string; groupName: string; conditionSql: string }
type Criteria = {
    criteriaCode: string; applyDate: string; groupCode: string; description: string
    employeeType: string; threshold: number; weight: number; severityScore: number
    calculationSql: string; active: boolean
}

const EMP_TYPES = ['Sale', 'KTV', 'Leader', 'Newbie', 'All']
const EMPTY_GROUP: Partial<Group> = { groupCode: '', groupName: '', conditionSql: 'SELECT 1' }
const EMPTY_CRITERIA: Partial<Criteria> = {
    criteriaCode: '', description: '', employeeType: 'KTV',
    threshold: 0.9, weight: 0.05, severityScore: 0, calculationSql: '', active: true,
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
}

export default function AdminCriteriaPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [criteria, setCriteria] = useState<Criteria[]>([])
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
    const [groupForm, setGroupForm] = useState<Partial<Group>>(EMPTY_GROUP)
    const [criteriaForm, setCriteriaForm] = useState<Partial<Criteria>>(EMPTY_CRITERIA)
    const [editGroup, setEditGroup] = useState<Group | null>(null)
    const [editCriteria, setEditCriteria] = useState<Criteria | null>(null)
    const [applyDate, setApplyDate] = useState(() => {
        const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    })
    const [criteriaApplyDate, setCriteriaApplyDate] = useState(() => {
        const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    })
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [saving, setSaving] = useState(false)
    const [tab, setTab] = useState<'groups' | 'criteria'>('groups')

    async function loadGroups() {
        const res = await fetch('/api/criteria-groups')
        const data = await res.json()
        setGroups(data.data ?? [])
    }
    async function loadCriteria(g?: Group) {
        const target = g ?? selectedGroup
        if (!target) { setCriteria([]); return }
        const res = await fetch(`/api/criteria?group_code=${target.groupCode}&apply_date=${target.applyDate}`)
        const data = await res.json()
        setCriteria(data.data ?? [])
    }
    useEffect(() => { loadGroups() }, [])
    useEffect(() => { loadCriteria() }, [selectedGroup])

    // ------ Group CRUD ------
    async function saveGroup() {
        setSaving(true)
        const body = { ...groupForm, applyDate: applyDate }
        if (editGroup) {
            await fetch(`/api/criteria-groups/${editGroup.groupCode}/${editGroup.applyDate.slice(0, 10)}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            })
        } else {
            await fetch('/api/criteria-groups', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            })
        }
        setGroupForm(EMPTY_GROUP); setEditGroup(null)
        await loadGroups(); setSaving(false)
    }

    async function deleteGroup(g: Group) {
        if (!confirm(`Xóa nhóm "${g.groupName}"?`)) return
        await fetch(`/api/criteria-groups/${g.groupCode}/${g.applyDate.slice(0, 10)}`, { method: 'DELETE' })
        await loadGroups()
    }

    // ------ Criteria CRUD ------
    async function saveCriteria() {
        if (!selectedGroup) return
        setSaving(true)
        setMsg(null)
        const body = { ...criteriaForm, groupCode: selectedGroup.groupCode, applyDate: criteriaApplyDate }
        try {
            if (editCriteria) {
                const res = await fetch(`/api/criteria/${editCriteria.criteriaCode}/${editCriteria.applyDate.slice(0, 10)}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
                })
                if (!res.ok) { const d = await res.json(); setMsg({ type: 'error', text: d.error ?? 'Lỗi cập nhật' }); setSaving(false); return }
            } else {
                const res = await fetch('/api/criteria', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
                })
                if (!res.ok) { const d = await res.json(); setMsg({ type: 'error', text: d.error ?? 'Lỗi thêm mới' }); setSaving(false); return }
            }
            setMsg({ type: 'success', text: editCriteria ? 'Đã cập nhật tiêu chí' : 'Đã thêm tiêu chí' })
            setCriteriaForm(EMPTY_CRITERIA); setEditCriteria(null)
            await loadCriteria()
        } catch (e) {
            setMsg({ type: 'error', text: String(e) })
        }
        setSaving(false)
    }

    async function deleteCriteria(c: Criteria) {
        if (!confirm(`Xóa tiêu chí "${c.criteriaCode}"?`)) return
        await fetch(`/api/criteria/${c.criteriaCode}/${c.applyDate.slice(0, 10)}`, { method: 'DELETE' })
        await loadCriteria()
    }

    function selectGroup(g: Group) {
        setSelectedGroup(g)
        setCriteriaApplyDate(g.applyDate.slice(0, 10))
        setTab('criteria')
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">📏 Quản lý tiêu chí</h1>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'groups' ? 'active' : ''}`} onClick={() => setTab('groups')}>Nhóm tiêu chí</button>
                <button className={`tab ${tab === 'criteria' ? 'active' : ''}`} onClick={() => setTab('criteria')}>
                    Tiêu chí {selectedGroup ? `— ${selectedGroup.groupName}` : ''}
                </button>
            </div>

            {/* ===== Groups Tab ===== */}
            {tab === 'groups' && (
                <>
                    <div className="card mb-24">
                        <div className="card-title mb-16">{editGroup ? '✏️ Sửa nhóm' : '➕ Thêm nhóm'}</div>
                        <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Mã nhóm</label>
                                <input className="form-input" value={groupForm.groupCode ?? ''} onChange={e => setGroupForm(f => ({ ...f, groupCode: e.target.value }))} placeholder="CX, KIEM_DINH..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tên nhóm</label>
                                <input className="form-input" value={groupForm.groupName ?? ''} onChange={e => setGroupForm(f => ({ ...f, groupName: e.target.value }))} placeholder="Tiêu chí CX" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tháng áp dụng</label>
                                <input type="month" className="form-input" value={applyDate.slice(0, 7)} onChange={e => setApplyDate(e.target.value + '-01')} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Điều kiện kích hoạt (SQL)</label>
                            <textarea className="form-textarea" rows={3} value={groupForm.conditionSql ?? ''}
                                onChange={e => setGroupForm(f => ({ ...f, conditionSql: e.target.value }))}
                                placeholder="SELECT 1 WHERE ... (trả về row = kích hoạt)" />
                        </div>
                        <div className="flex gap-8">
                            <button className="btn btn-primary" onClick={saveGroup} disabled={saving}>{saving ? 'Đang lưu...' : editGroup ? 'Cập nhật' : 'Thêm nhóm'}</button>
                            {editGroup && <button className="btn btn-ghost" onClick={() => { setEditGroup(null); setGroupForm(EMPTY_GROUP) }}>Hủy</button>}
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-title mb-16">Danh sách nhóm ({groups.length})</div>
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Mã nhóm</th><th>Tên nhóm</th><th>Tháng</th><th>Condition SQL</th><th>Thao tác</th></tr></thead>
                                <tbody>
                                    {groups.map(g => (
                                        <tr key={`${g.groupCode}_${g.applyDate}`}>
                                            <td><span className="badge badge-accent font-mono">{g.groupCode}</span></td>
                                            <td style={{ fontWeight: 600 }}>{g.groupName}</td>
                                            <td>{formatDate(g.applyDate)}</td>
                                            <td className="font-mono text-xs text-muted truncate" style={{ maxWidth: 200 }}>{g.conditionSql}</td>
                                            <td>
                                                <div className="flex gap-8">
                                                    <button className="btn btn-ghost btn-sm" onClick={() => selectGroup(g)}>Xem TC</button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditGroup(g); setGroupForm(g); setApplyDate(g.applyDate.slice(0, 10)) }}>Sửa</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => deleteGroup(g)}>Xóa</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ===== Criteria Tab ===== */}
            {tab === 'criteria' && (
                <>
                    {!selectedGroup && (
                        <div className="alert alert-warning">Chọn một nhóm từ tab &ldquo;Nhóm tiêu chí&rdquo; để xem tiêu chí</div>
                    )}
                    {selectedGroup && (
                        <>
                            <div className="card mb-24">
                                <div className="card-title mb-16">{editCriteria ? '✏️ Sửa tiêu chí' : '➕ Thêm tiêu chí vào: ' + selectedGroup.groupName}</div>
                                <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Mã tiêu chí</label>
                                        <input className="form-input" value={criteriaForm.criteriaCode ?? ''} onChange={e => setCriteriaForm(f => ({ ...f, criteriaCode: e.target.value }))} placeholder="KTV1, B1..." />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Loại NV</label>
                                        <select className="form-select" value={criteriaForm.employeeType ?? ''} onChange={e => setCriteriaForm(f => ({ ...f, employeeType: e.target.value }))}>
                                            {EMP_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tháng áp dụng</label>
                                        <input type="month" className="form-input" value={criteriaApplyDate.slice(0, 7)} onChange={e => setCriteriaApplyDate(e.target.value + '-01')} disabled={!!editCriteria} />
                                    </div>
                                </div>
                                <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Ngưỡng đạt</label>
                                        <input type="number" step="0.01" className="form-input" value={criteriaForm.threshold ?? ''} onChange={e => setCriteriaForm(f => ({ ...f, threshold: Number(e.target.value) }))} />
                                    </div>
                                </div>
                                <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Trọng số (0–1)</label>
                                        <input type="number" step="0.01" className="form-input" value={criteriaForm.weight ?? ''} onChange={e => setCriteriaForm(f => ({ ...f, weight: Number(e.target.value) }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Severity score</label>
                                        <input type="number" step="0.1" className="form-input" value={criteriaForm.severityScore ?? ''} onChange={e => setCriteriaForm(f => ({ ...f, severityScore: Number(e.target.value) }))} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 16 }}>
                                    <label className="form-label">Mô tả</label>
                                    <input className="form-input" value={criteriaForm.description ?? ''} onChange={e => setCriteriaForm(f => ({ ...f, description: e.target.value }))} placeholder="Tỷ lệ đúng giờ..." />
                                </div>
                                <div className="form-group" style={{ marginBottom: 20 }}>
                                    <label className="form-label">SQL tính toán (dùng :employee_id và :apply_date)</label>
                                    <textarea className="form-textarea" rows={4} value={criteriaForm.calculationSql ?? ''}
                                        onChange={e => setCriteriaForm(f => ({ ...f, calculationSql: e.target.value }))}
                                        placeholder="SELECT COUNT(*) ... FROM fact_check_events WHERE actor_id = :employee_id ..." style={{ fontFamily: 'monospace', fontSize: 12 }} />
                                </div>
                                <div className="flex gap-8">
                                    <button className="btn btn-primary" onClick={saveCriteria} disabled={saving}>{saving ? 'Đang lưu...' : editCriteria ? 'Cập nhật' : 'Thêm tiêu chí'}</button>
                                    {editCriteria && <button className="btn btn-ghost" onClick={() => { setEditCriteria(null); setCriteriaForm(EMPTY_CRITERIA) }}>Hủy</button>}
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-title mb-16">Tiêu chí trong nhóm ({criteria.length})</div>
                                <div className="table-wrap">
                                    <table>
                                        <thead><tr><th>Mã TC</th><th>Mô tả</th><th>Loại NV</th><th>Trọng số</th><th>Ngưỡng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                                        <tbody>
                                            {criteria.map(c => (
                                                <tr key={`${c.criteriaCode}_${c.applyDate}`} style={{ opacity: c.active ? 1 : 0.5 }}>
                                                    <td><span className="badge badge-default font-mono">{c.criteriaCode}</span></td>
                                                    <td>{c.description}</td>
                                                    <td><span className="badge badge-accent">{c.employeeType}</span></td>
                                                    <td>{(Number(c.weight) * 100).toFixed(0)}%</td>
                                                    <td>{c.threshold}</td>
                                                    <td>{c.active ? <span className="badge badge-success">Bật</span> : <span className="badge badge-danger">Tắt</span>}</td>
                                                    <td>
                                                        <div className="flex gap-8">
                                                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditCriteria(c); setCriteriaForm(c) }}>Sửa</button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => deleteCriteria(c)}>Xóa</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
