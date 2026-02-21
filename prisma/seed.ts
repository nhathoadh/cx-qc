import { prisma } from '../src/lib/prisma'

/**
 * Seed script: creates sample data for testing the scoring system.
 * Run with: npm run db:seed
 */
async function main() {
    console.log('🌱 Seeding database...')

    // 1. Create sample employees
    const ktv1 = await prisma.dimEmployee.upsert({
        where: { employeeCode: 'KTV001' },
        update: {},
        create: {
            employeeCode: 'KTV001',
            shortName: 'Nguyễn A',
            role: 'KTV',
            team: 'Logan',
            area: 'HCM',
        },
    })

    const sale1 = await prisma.dimEmployee.upsert({
        where: { employeeCode: 'SALE001' },
        update: {},
        create: {
            employeeCode: 'SALE001',
            shortName: 'Trần B',
            role: 'Sale',
            team: 'Hi5',
            area: 'HN',
        },
    })

    console.log(`👤 Employees: ${ktv1.shortName}, ${sale1.shortName}`)

    // 2. Create a criteria group for Jan 2026
    const applyDate = new Date('2026-01-01')

    const group = await prisma.dimCriteriaGroup.upsert({
        where: { groupCode_applyDate: { groupCode: 'CX', applyDate } },
        update: {},
        create: {
            groupCode: 'CX',
            applyDate,
            groupName: 'Tiêu chí CX',
            conditionSql: "SELECT 1 WHERE employee_type IN ('Sale', 'KTV')",
        },
    })

    console.log(`📋 Group: ${group.groupName}`)

    // 3. Create a criteria
    const criteria = await prisma.dimCriteria.upsert({
        where: { criteriaCode_applyDate: { criteriaCode: 'CX1', applyDate } },
        update: {},
        create: {
            criteriaCode: 'CX1',
            applyDate,
            groupCode: 'CX',
            description: 'Tỷ lệ đúng giờ',
            employeeType: 'KTV',
            threshold: 0.9,
            weight: 0.1,
            severityScore: 5,
            calculationSql:
                "SELECT COUNT(*) FILTER (WHERE ontime_status_detail = 'Đúng giờ') / COUNT(*) FROM fact_check_events WHERE actor_id = :employee_id AND DATE_TRUNC('month', event_timestamp) = :apply_date",
        },
    })

    console.log(`📏 Criteria: ${criteria.criteriaCode} - ${criteria.description}`)
    console.log('✅ Seed complete!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
