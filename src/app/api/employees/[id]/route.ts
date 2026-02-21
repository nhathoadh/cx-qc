import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const body = await req.json()
    const emp = await prisma.dimEmployee.update({ where: { id: parseInt(params.id) }, data: body })
    return NextResponse.json({ data: emp })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    await prisma.dimEmployee.update({ where: { id: parseInt(params.id) }, data: { isActive: false } })
    return NextResponse.json({ success: true })
}
