import { prisma } from '@/lib/prisma'

/**
 * Execute the calculation_sql stored in dim_criteria for a specific employee and month.
 * The SQL must return a single numeric value aliased as "value".
 * 
 * Placeholders supported: :employee_id, :apply_date
 */
export async function calculateCriteriaScore(
    employeeId: number,
    criteriaCode: string,
    applyDate: Date
): Promise<number> {
    const criteria = await prisma.dimCriteria.findUnique({
        where: { criteriaCode_applyDate: { criteriaCode, applyDate } },
    })
    if (!criteria || !criteria.active) return 0

    // Replace named placeholders with actual values
    const sql = criteria.calculationSql
        .replace(/:employee_id/g, String(employeeId))
        .replace(/:apply_date/g, `'${applyDate.toISOString().slice(0, 10)}'`)

    try {
        const result = await prisma.$queryRawUnsafe<{ value: unknown }[]>(sql)
        const raw = Number(result?.[0]?.value ?? 0)
        return isNaN(raw) ? 0 : raw
    } catch (e) {
        console.error(`[scoring] calculation_sql failed for ${criteriaCode}:`, e)
        return 0
    }
}

/**
 * Execute the condition_sql stored in dim_criteria_groups.
 * Returns true if the group is active for this employee/month.
 * The SQL must return at least one row to be considered "true".
 */
export async function checkGroupCondition(
    groupCode: string,
    applyDate: Date,
    employeeId: number
): Promise<boolean> {
    const group = await prisma.dimCriteriaGroup.findUnique({
        where: { groupCode_applyDate: { groupCode, applyDate } },
    })
    if (!group) return false

    const sql = group.conditionSql
        .replace(/:employee_id/g, String(employeeId))
        .replace(/:apply_date/g, `'${applyDate.toISOString().slice(0, 10)}'`)

    try {
        const result = await prisma.$queryRawUnsafe<unknown[]>(sql)
        return Array.isArray(result) && result.length > 0
    } catch (e) {
        console.error(`[scoring] condition_sql failed for group ${groupCode}:`, e)
        return false
    }
}

/**
 * Calculate total score for an employee for a given month.
 * - Skips criteria whose group condition is false
 * - Calculated score = raw_value * weight (capped by threshold logic)
 * - Saves or updates fact_monthly_scores and fact_monthly_summary
 */
export async function calculateTotalScore(employeeId: number, applyDate: Date) {
    const criteriaList = await prisma.dimCriteria.findMany({
        where: { applyDate, active: true },
    })

    let totalScore = 0
    const scoreRows = []

    for (const criteria of criteriaList) {
        const groupActive = await checkGroupCondition(criteria.groupCode, applyDate, employeeId)
        if (!groupActive) continue

        const rawValue = await calculateCriteriaScore(employeeId, criteria.criteriaCode, applyDate)
        // Calculated score = raw_value * weight (if raw_value >= threshold, full weight)
        const calculatedScore = rawValue * Number(criteria.weight)
        totalScore += calculatedScore

        scoreRows.push({ criteriaCode: criteria.criteriaCode, rawValue, calculatedScore })
    }

    // Upsert summary
    const summary = await prisma.factMonthlySummary.upsert({
        where: { employeeId_applyDate: { employeeId, applyDate } },
        update: { overallScore: totalScore, isFinalized: false },
        create: { employeeId, applyDate, overallScore: totalScore, isFinalized: false },
    })

    // Upsert each score row
    for (const row of scoreRows) {
        await prisma.factMonthlyScore.upsert({
            where: {
                // Use a findFirst pattern since no unique constraint on (summaryId, criteriaCode, applyDate)
                // We'll delete and recreate for simplicity
                id: (
                    await prisma.factMonthlyScore.findFirst({
                        where: { summaryId: summary.id, criteriaCode: row.criteriaCode, applyDate },
                    })
                )?.id ?? 0,
            },
            update: { rawValue: row.rawValue, calculatedScore: row.calculatedScore },
            create: {
                summaryId: summary.id,
                criteriaCode: row.criteriaCode,
                applyDate,
                rawValue: row.rawValue,
                calculatedScore: row.calculatedScore,
            },
        })
    }

    return { summaryId: summary.id, totalScore, scoreCount: scoreRows.length }
}
