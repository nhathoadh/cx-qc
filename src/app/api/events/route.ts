import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const employeeId = req.nextUrl.searchParams.get('employee_id')
    const events = await prisma.factCheckEvent.findMany({
        where: employeeId ? { actorId: parseInt(employeeId) } : undefined,
        include: { actor: true },
        orderBy: { eventTimestamp: 'desc' },
        take: 200,
    })
    return NextResponse.json({ data: events })
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    try {
        const event = await prisma.factCheckEvent.create({
            data: {
                eventType: body.eventType,
                actorId: parseInt(String(body.actorId)),
                eventTimestamp: new Date(body.eventTimestamp),
                isUniform: body.isUniform,
                ontimeStatusDetail: body.ontimeStatusDetail || null,
                location: body.location || null,
                notes: body.notes || null,
                referenceId: body.referenceId || null,
            },
        })
        return NextResponse.json({ data: event })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 400 })
    }
}
