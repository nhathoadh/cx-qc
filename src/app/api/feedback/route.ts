import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const employeeId = req.nextUrl.searchParams.get('employee_id')
    const feedbacks = await prisma.factQcFeedback.findMany({
        where: employeeId ? { saleId: parseInt(employeeId) } : undefined,
        include: { sale: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
    })
    return NextResponse.json({ data: feedbacks })
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    try {
        const fb = await prisma.factQcFeedback.create({
            data: {
                saleId: parseInt(String(body.saleId)),
                customerPhone: body.customerPhone || null,
                carInfo: body.carInfo || null,
                rating: body.rating != null ? Number(body.rating) : null,
                feedbackText: body.feedbackText || null,
                criteriaCode: body.criteriaCode || null,
                feedbackAt: body.feedbackAt ? new Date(body.feedbackAt) : null,
            },
        })
        return NextResponse.json({ data: fb })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 400 })
    }
}
