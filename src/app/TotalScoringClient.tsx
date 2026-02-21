'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Entry = {
    rank: number; name: string; team: string;
    score: number; commission: number | null; id: number; code: string;
}
type Group = { role: string; area: string; entries: Entry[] }

function RankMedal({ rank }: { rank: number }) {
    const cls = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other'
    return <span className={`rank-medal ${cls}`}>{rank}</span>
}

function ScoreBar({ score, max }: { score: number; max: number }) {
    const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0
    return (
        <div className="score-bar-wrap">
            <div className="score-bar-track">
                <div className="score-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="score-value">{score.toFixed(2)}</span>
        </div>
    )
}

export default function TotalScoringClient({
    groups,
    currentMonth,
    months,
}: {
    groups: Group[]
    currentMonth: string
    months: string[]
}) {
    const router = useRouter()
    const allMonths = months.includes(currentMonth) ? months : [currentMonth, ...months]

    return (
        <div className="page">
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">🏆 Bảng xếp hạng</h1>
                    <p className="page-subtitle">Xếp hạng nhân viên theo nhóm vai trò và khu vực</p>
                </div>
                <div className="month-selector-wrap">
                    <label>Tháng:</label>
                    <select
                        className="form-select"
                        style={{ width: 160 }}
                        value={currentMonth}
                        onChange={(e) => router.push(`/?month=${e.target.value}`)}
                    >
                        {allMonths.map((m) => (
                            <option key={m} value={m}>
                                {new Date(m).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {groups.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <div className="empty-state-text">Chưa có dữ liệu điểm cho tháng này. Hãy tính điểm từ trang Admin.</div>
                </div>
            )}

            {groups.map((g) => {
                const max = Math.max(...g.entries.map((e) => e.score), 1)
                return (
                    <div key={`${g.role}__${g.area}`} className="card mb-24">
                        <div className="card-header">
                            <div>
                                <div className="card-title">
                                    {g.role} &mdash; {g.area}
                                </div>
                                <div className="text-sm text-muted mt-4">{g.entries.length} nhân viên</div>
                            </div>
                            <span className="badge badge-accent">{g.role}</span>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: 60 }}>Hạng</th>
                                        <th>Nhân viên</th>
                                        <th>Team</th>
                                        <th style={{ minWidth: 220 }}>Tổng điểm</th>
                                        <th>Tỷ lệ HH</th>
                                        <th style={{ width: 80 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {g.entries.map((e) => (
                                        <tr key={e.id}>
                                            <td><RankMedal rank={e.rank} /></td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{e.name}</div>
                                                <div className="text-xs text-muted">{e.code}</div>
                                            </td>
                                            <td><span className="badge badge-default">{e.team}</span></td>
                                            <td><ScoreBar score={e.score} max={max} /></td>
                                            <td>
                                                {e.commission !== null
                                                    ? <span className="badge badge-success">{(e.commission * 100).toFixed(1)}%</span>
                                                    : <span className="text-muted">—</span>}
                                            </td>
                                            <td>
                                                <Link href={`/detail?employee=${e.id}&month=${currentMonth}`} className="btn btn-ghost btn-sm">
                                                    Chi tiết
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
