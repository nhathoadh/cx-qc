import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const employees = await prisma.dimEmployee.findMany({ orderBy: { shortName: 'asc' } })
    return NextResponse.json({ data: employees })
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    const emp = await prisma.dimEmployee.create({ data: body })
    return NextResponse.json({ data: emp })
}
