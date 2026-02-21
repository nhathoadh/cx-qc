import { NextRequest, NextResponse } from 'next/server'
import { checkGroupCondition } from '@/services/scoring.service'

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const groupCode = searchParams.get('group_code')
    const applyDateStr = searchParams.get('apply_date')
    const employeeId = parseInt(searchParams.get('employee_id') ?? '')

    if (!groupCode || !applyDateStr || !employeeId) {
        return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const applyDate = new Date(applyDateStr)
    const active = await checkGroupCondition(groupCode, applyDate, employeeId)

    return NextResponse.json({ groupCode, applyDate: applyDateStr, active })
}
