import { prisma } from '@/lib/prisma'
import TotalScoringClient from './TotalScoringClient'

function getDefaultApplyDate() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

export default async function TotalScoringPage({
    searchParams,
}: {
    searchParams: { month?: string }
}) {
    const applyDateStr = searchParams.month ?? getDefaultApplyDate()
    const applyDate = new Date(applyDateStr)

    const summaries = await prisma.factMonthlySummary.findMany({
        where: { applyDate },
        include: { employee: true },
        orderBy: { overallScore: 'desc' },
    })

    // Group by (role, area), rank within each group
    const groups: Record<string, {
        role: string; area: string;
        entries: { rank: number; name: string; team: string; score: number; commission: number | null; id: number; code: string }[]
    }> = {}

    summaries.forEach((s, idx) => {
        const key = `${s.employee.role}__${s.employee.area}`
        if (!groups[key]) {
            groups[key] = { role: s.employee.role, area: s.employee.area, entries: [] }
        }
        groups[key].entries.push({
            rank: groups[key].entries.length + 1,
            name: s.employee.shortName,
            team: s.employee.team,
            score: Number(s.overallScore ?? 0),
            commission: s.commissionRate ? Number(s.commissionRate) : null,
            id: s.employee.id,
            code: s.employee.employeeCode,
        })
    })

    const groupList = Object.values(groups).sort((a, b) =>
        a.role.localeCompare(b.role) || a.area.localeCompare(b.area)
    )

    // Distinct months for the selector
    const months = await prisma.factMonthlySummary.findMany({
        distinct: ['applyDate'],
        orderBy: { applyDate: 'desc' },
        select: { applyDate: true },
    })

    return (
        <TotalScoringClient
            groups={groupList}
            currentMonth={applyDateStr}
            months={months.map((m) => m.applyDate.toISOString().slice(0, 10))}
        />
    )
}
