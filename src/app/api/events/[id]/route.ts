import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const body = await req.json()
    const event = await prisma.factCheckEvent.update({ where: { id: parseInt(params.id) }, data: body })
    return NextResponse.json({ data: event })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    await prisma.factCheckEvent.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ success: true })
}
