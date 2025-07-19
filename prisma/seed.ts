import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultQuestions = [
  { text: "I feel respected when expressing my opinions.", weight: -2, order: 1 },
  { text: "We often insult or belittle each other.", weight: 2, order: 2 },
  { text: "I am afraid of my partner's reactions.", weight: 2, order: 3 },
  { text: "We communicate openly and honestly.", weight: -2, order: 4 },
  { text: "Jealousy is a frequent issue between us.", weight: 2, order: 5 },
  { text: "We trust each other completely.", weight: -2, order: 6 },
  { text: "I feel pressured to change who I am.", weight: 2, order: 7 },
  { text: "Conflicts are resolved calmly and fairly.", weight: -2, order: 8 },
  { text: "Personal boundaries are ignored.", weight: 2, order: 9 },
  { text: "I feel supported in my goals and dreams.", weight: -2, order: 10 },
  { text: "Threats or ultimatums are used.", weight: 2, order: 11 },
  { text: "We celebrate each other's successes.", weight: -2, order: 12 }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing questions
  await prisma.question.deleteMany()

  // Create default questions
  for (const question of defaultQuestions) {
    await prisma.question.create({
      data: question,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
