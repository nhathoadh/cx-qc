import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const groupCode = req.nextUrl.searchParams.get('group_code')
    const applyDate = req.nextUrl.searchParams.get('apply_date')

    const criteria = await prisma.dimCriteria.findMany({
        where: {
            ...(groupCode ? { groupCode } : {}),
            ...(applyDate ? { applyDate: new Date(applyDate) } : {}),
        },
        orderBy: [{ applyDate: 'desc' }, { criteriaCode: 'asc' }],
    })
    return NextResponse.json({ data: criteria })
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    try {
        const c = await prisma.dimCriteria.create({
            data: {
                criteriaCode: body.criteriaCode,
                applyDate: new Date(body.applyDate),
                groupCode: body.groupCode,
                description: body.description,
                employeeType: body.employeeType,
                threshold: body.threshold,
                weight: body.weight,
                severityScore: body.severityScore ?? 0,
                calculationSql: body.calculationSql,
                active: body.active ?? true,
            },
        })
        return NextResponse.json({ data: c })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 400 })
    }
}
