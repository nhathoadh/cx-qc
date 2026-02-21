import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCriteriaScore } from '@/services/scoring.service'
import { checkGroupCondition } from '@/services/scoring.service'

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const employeeId = parseInt(searchParams.get('employee_id') ?? '')
    const applyDateStr = searchParams.get('apply_date')

    if (!employeeId || !applyDateStr) {
        return NextResponse.json({ error: 'Missing employee_id or apply_date' }, { status: 400 })
    }

    const applyDate = new Date(applyDateStr)

    const criteriaList = await prisma.dimCriteria.findMany({
        where: { applyDate, active: true },
        include: { group: true },
    })

    const results = []
    for (const c of criteriaList) {
        const groupActive = await checkGroupCondition(c.groupCode, applyDate, employeeId)
        const rawValue = groupActive
            ? await calculateCriteriaScore(employeeId, c.criteriaCode, applyDate)
            : null
        const calculatedScore =
            rawValue !== null ? rawValue * Number(c.weight) : null

        results.push({
            criteriaCode: c.criteriaCode,
            description: c.description,
            weight: Number(c.weight),
            threshold: Number(c.threshold),
            severityScore: Number(c.severityScore),
            groupCode: c.groupCode,
            groupName: c.group.groupName,
            groupActive,
            rawValue,
            calculatedScore,
        })
    }

    return NextResponse.json({ data: results })
}
