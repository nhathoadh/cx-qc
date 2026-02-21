import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { groupCode: string; applyDate: string } }) {
    const body = await req.json()
    try {
        const group = await prisma.dimCriteriaGroup.update({
            where: {
                groupCode_applyDate: {
                    groupCode: params.groupCode,
                    applyDate: new Date(decodeURIComponent(params.applyDate)),
                },
            },
            data: {
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

export async function DELETE(_: NextRequest, { params }: { params: { groupCode: string; applyDate: string } }) {
    await prisma.dimCriteriaGroup.delete({
        where: {
            groupCode_applyDate: {
                groupCode: params.groupCode,
                applyDate: new Date(decodeURIComponent(params.applyDate)),
            },
        },
    })
    return NextResponse.json({ success: true })
}
