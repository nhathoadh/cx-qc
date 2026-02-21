import { NextRequest, NextResponse } from 'next/server'
import { calculateTotalScore } from '@/services/scoring.service'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const { employeeId, applyDate: applyDateStr } = await req.json()
    if (!employeeId || !applyDateStr) {
        return NextResponse.json({ error: 'Missing employeeId or applyDate' }, { status: 400 })
    }

    const applyDate = new Date(applyDateStr)
    const result = await calculateTotalScore(employeeId, applyDate)

    // Recalculate ranks for all employees in this month
    const summaries = await prisma.factMonthlySummary.findMany({
        where: { applyDate },
        include: { employee: true },
        orderBy: { overallScore: 'desc' },
    })

    // Update ranks grouped by (role, area)
    const groups: Record<string, typeof summaries> = {}
    for (const s of summaries) {
        const key = `${s.employee.role}__${s.employee.area}`
        if (!groups[key]) groups[key] = []
        groups[key].push(s)
    }

    for (const group of Object.values(groups)) {
        let rank = 1
        for (const s of group) {
            await prisma.factMonthlySummary.update({ where: { id: s.id }, data: { rank } })
            rank++
        }
    }

    return NextResponse.json({ ...result, message: 'Score calculated and saved' })
}
