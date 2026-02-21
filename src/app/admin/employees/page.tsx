'use client'

import { useEffect, useState } from 'react'

type Employee = {
    id: number; employeeCode: string; shortName: string
    role: string; team: string; area: string; isActive: boolean
}

const ROLES = ['Sale', 'KTV', 'Leader', 'Newbie']
const AREAS = ['HCM', 'HN']
const EMPTY: Partial<Employee> = { employeeCode: '', shortName: '', role: 'Sale', team: '', area: 'HCM', isActive: true }

export default function AdminEmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [form, setForm] = useState<Partial<Employee>>(EMPTY)
    const [editId, setEditId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    async function load() {
        setLoading(true)
        const res = await fetch('/api/employees')
        const data = await res.json()
        setEmployees(data.data ?? [])
        setLoading(false)
    }
    useEffect(() => { load() }, [])

    function startEdit(emp: Employee) {
        setEditId(emp.id)
        setForm({ ...emp })
        setMsg(null)
    }

    function cancelEdit() { setEditId(null); setForm(EMPTY) }

    async function save() {
        setSaving(true)
        setMsg(null)
        try {
            if (editId) {
                await fetch(`/api/employees/${editId}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
                })
            } else {
                await fetch('/api/employees', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
                })
            }
            setMsg({ type: 'success', text: editId ? 'Đã cập nhật nhân viên' : 'Đã thêm nhân viên' })
            setEditId(null); setForm(EMPTY)
            await load()
        } catch {
            setMsg({ type: 'error', text: 'Có lỗi xảy ra, vui lòng thử lại' })
        }
        setSaving(false)
    }

    async function toggleActive(emp: Employee) {
        await fetch(`/api/employees/${emp.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !emp.isActive }),
        })
        await load()
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">👥 Quản lý nhân viên</h1>
            </div>

            {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

            {/* Form */}
            <div className="card mb-24">
                <div className="card-title mb-16">{editId ? '✏️ Sửa nhân viên' : '➕ Thêm nhân viên'}</div>
                <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Mã NV</label>
                        <input className="form-input" value={form.employeeCode ?? ''} onChange={e => setForm(f => ({ ...f, employeeCode: e.target.value }))} placeholder="VD: KTV001" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tên hiển thị</label>
                        <input className="form-input" value={form.shortName ?? ''} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))} placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Team</label>
                        <input className="form-input" value={form.team ?? ''} onChange={e => setForm(f => ({ ...f, team: e.target.value }))} placeholder="Logan, Hi5..." />
                    </div>
                </div>
                <div className="form-row form-row-3" style={{ marginBottom: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Vai trò</label>
                        <select className="form-select" value={form.role ?? ''} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                            {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Khu vực</label>
                        <select className="form-select" value={form.area ?? ''} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                            {AREAS.map(a => <option key={a}>{a}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-8">
                    <button className="btn btn-primary" onClick={save} disabled={saving}>
                        {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                    {editId && <button className="btn btn-ghost" onClick={cancelEdit}>Hủy</button>}
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-title mb-16">Danh sách nhân viên ({employees.length})</div>
                {loading ? (
                    <div className="loading-wrap"><div className="spinner" /></div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã NV</th>
                                    <th>Tên</th>
                                    <th>Vai trò</th>
                                    <th>Team</th>
                                    <th>Khu vực</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id} style={{ opacity: emp.isActive ? 1 : 0.45 }}>
                                        <td><span className="badge badge-default font-mono">{emp.employeeCode}</span></td>
                                        <td style={{ fontWeight: 600 }}>{emp.shortName}</td>
                                        <td><span className="badge badge-accent">{emp.role}</span></td>
                                        <td>{emp.team}</td>
                                        <td>{emp.area}</td>
                                        <td>
                                            {emp.isActive
                                                ? <span className="badge badge-success">Hoạt động</span>
                                                : <span className="badge badge-danger">Vô hiệu</span>}
                                        </td>
                                        <td>
                                            <div className="flex gap-8">
                                                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(emp)}>Sửa</button>
                                                <button className={`btn btn-sm ${emp.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(emp)}>
                                                    {emp.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
