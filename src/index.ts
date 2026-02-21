import { prisma } from './lib/prisma'

async function main() {
    console.log('🔌 Testing DB connection...')

    // Test connection by checking employee count
    const employeeCount = await prisma.dimEmployee.count()
    console.log(`✅ Connected! Found ${employeeCount} employees.`)

    const groupCount = await prisma.dimCriteriaGroup.count()
    console.log(`📋 Criteria groups: ${groupCount}`)

    const criteriaCount = await prisma.dimCriteria.count()
    console.log(`📏 Criteria: ${criteriaCount}`)

    console.log('\n🎉 All tables are accessible.')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
