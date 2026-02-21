import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { criteriaCode: string; applyDate: string } }) {
    const body = await req.json()
    try {
        const c = await prisma.dimCriteria.update({
            where: {
                criteriaCode_applyDate: {
                    criteriaCode: params.criteriaCode,
                    applyDate: new Date(decodeURIComponent(params.applyDate)),
                },
            },
            data: {
                description: body.description,
                employeeType: body.employeeType,
                threshold: body.threshold,
                weight: body.weight,
                severityScore: body.severityScore,
                calculationSql: body.calculationSql,
                active: body.active,
            },
        })
        return NextResponse.json({ data: c })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 400 })
    }
}

export async function DELETE(_: NextRequest, { params }: { params: { criteriaCode: string; applyDate: string } }) {
    await prisma.dimCriteria.delete({
        where: {
            criteriaCode_applyDate: {
                criteriaCode: params.criteriaCode,
                applyDate: new Date(decodeURIComponent(params.applyDate)),
            },
        },
    })
    return NextResponse.json({ success: true })
}
