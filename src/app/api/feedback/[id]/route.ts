import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const body = await req.json()
    const fb = await prisma.factQcFeedback.update({ where: { id: parseInt(params.id) }, data: body })
    return NextResponse.json({ data: fb })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    await prisma.factQcFeedback.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ success: true })
}
