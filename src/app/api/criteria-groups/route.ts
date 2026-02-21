import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const groups = await prisma.dimCriteriaGroup.findMany({
        orderBy: [{ applyDate: 'desc' }, { groupCode: 'asc' }],
    })
    return NextResponse.json({ data: groups })
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    try {
        const group = await prisma.dimCriteriaGroup.create({
            data: {
                groupCode: body.groupCode,
                applyDate: new Date(body.applyDate),
                groupName: body.groupName,
                conditionSql: body.conditionSql,
            },
        })
        return NextResponse.json({ data: group })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 400 })
    }
}
