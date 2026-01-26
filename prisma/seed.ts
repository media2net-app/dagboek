import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...')
  await prisma.waterIntake.deleteMany()
  await prisma.pipelineItem.deleteMany()
  await prisma.note.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.weightEntry.deleteMany()
  await prisma.workout.deleteMany()
  await prisma.personalTask.deleteMany()
  await prisma.workTask.deleteMany()
  await prisma.project.deleteMany()

  // Create Projects
  console.log('📁 Creating projects...')
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign van de website',
      color: '#6366f1',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App',
      description: 'Nieuwe mobile applicatie ontwikkeling',
      color: '#10b981',
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'Marketing Campaign',
      description: 'Q1 marketing campagne',
      color: '#f59e0b',
    },
  })

  // Create Work Tasks
  console.log('💼 Creating work tasks...')
  await prisma.workTask.createMany({
    data: [
      {
        title: 'Project planning review',
        description: 'Review van Q1 project planning',
        completed: false,
        time: '09:00',
        projectId: project1.id,
      },
      {
        title: 'Team meeting',
        description: 'Wekelijkse standup met het team',
        completed: false,
        time: '10:30',
        projectId: project2.id,
      },
      {
        title: 'Code review',
        description: 'Review pull requests',
        completed: true,
        time: '14:00',
        projectId: project1.id,
      },
      {
        title: 'Client call',
        description: 'Overleg met klant over nieuwe features',
        completed: false,
        time: '15:30',
        projectId: project3.id,
      },
    ],
  })

  // Create Personal Tasks
  console.log('👤 Creating personal tasks...')
  await prisma.personalTask.createMany({
    data: [
      {
        title: 'Boodschappen doen',
        description: 'Wekelijkse boodschappen',
        completed: false,
        time: '10:00',
        endTime: '11:00',
      },
      {
        title: 'Afspraak dokter',
        description: 'Controle afspraak',
        completed: false,
        time: '14:00',
        endTime: '14:30',
      },
      {
        title: 'Sporten',
        description: 'Gym sessie',
        completed: false,
        time: '18:00',
        endTime: '19:30',
      },
    ],
  })

  // Create Workouts
  console.log('🏋️ Creating workouts...')
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(today)
  dayAfter.setDate(dayAfter.getDate() + 2)

  await prisma.workout.createMany({
    data: [
      {
        name: 'Push Day',
        date: today.toISOString().split('T')[0],
        time: '17:00',
        exercises: ['Bench Press', 'Shoulder Press', 'Tricep Dips', 'Lateral Raises'],
        completed: false,
      },
      {
        name: 'Pull Day',
        date: tomorrow.toISOString().split('T')[0],
        time: '17:00',
        exercises: ['Deadlift', 'Pull-ups', 'Rows', 'Bicep Curls'],
        completed: false,
      },
      {
        name: 'Leg Day',
        date: dayAfter.toISOString().split('T')[0],
        time: '17:00',
        exercises: ['Squats', 'Leg Press', 'Leg Curls', 'Calf Raises'],
        completed: false,
      },
    ],
  })

  // Create Weight Entries
  console.log('⚖️ Creating weight entries...')
  const weightDates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    weightDates.push({
      date: date.toISOString().split('T')[0],
      weight: 85.5 - (i * 0.1), // Simulated weight progression
    })
  }

  await prisma.weightEntry.createMany({
    data: weightDates,
  })

  // Create Transactions
  console.log('💰 Creating transactions...')
  await prisma.transaction.createMany({
    data: [
      {
        type: 'income',
        description: 'Salaris',
        amount: 68150.50,
        date: '2024-01-01',
        category: 'Werk',
      },
      {
        type: 'expense',
        description: 'Boodschappen',
        amount: 125.50,
        date: '2024-01-15',
        category: 'Levensmiddelen',
      },
      {
        type: 'expense',
        description: 'Sportschool abonnement',
        amount: 45,
        date: '2024-01-10',
        category: 'Fitness',
      },
      {
        type: 'expense',
        description: 'Tankbeurt',
        amount: 85.30,
        date: '2024-01-20',
        category: 'Vervoer',
      },
      {
        type: 'income',
        description: 'Freelance project',
        amount: 2500,
        date: '2024-01-25',
        category: 'Werk',
      },
      {
        type: 'expense',
        description: 'Restaurant',
        amount: 65.50,
        date: '2024-01-22',
        category: 'Uit eten',
      },
    ],
  })

  // Create Notes
  console.log('📝 Creating notes...')
  await prisma.note.createMany({
    data: [
      {
        content: 'Bel terug naar klant over offerte',
      },
      {
        content: 'Koffie halen voor team meeting',
      },
      {
        content: 'Notities voor volgende sprint planning',
      },
      {
        content: 'Idee: Nieuwe feature voor gebruikers dashboard',
      },
      {
        content: 'Volgende week: Performance review voorbereiden',
      },
    ],
  })

  // Create Pipeline Items
  console.log('🚀 Creating pipeline items...')
  await prisma.pipelineItem.createMany({
    data: [
      {
        title: 'Nieuwe feature implementeren',
        description: 'User authentication toevoegen',
        status: 'todo',
        priority: 'high',
        projectId: project1.id,
        dueDate: tomorrow.toISOString().split('T')[0],
        amount: 5000,
      },
      {
        title: 'Bug fix dashboard',
        description: 'Kalender weergave corrigeren',
        status: 'in-progress',
        priority: 'medium',
        projectId: project1.id,
        dueDate: today.toISOString().split('T')[0],
      },
      {
        title: 'Design review',
        description: 'Nieuwe UI designs reviewen',
        status: 'review',
        priority: 'high',
        projectId: project2.id,
        amount: 3000,
      },
      {
        title: 'Database optimalisatie',
        description: 'Query performance verbeteren',
        status: 'done',
        priority: 'low',
        projectId: project2.id,
      },
      {
        title: 'Marketing materiaal',
        description: 'Nieuwe brochures en flyers',
        status: 'todo',
        priority: 'medium',
        projectId: project3.id,
        amount: 1500,
      },
    ],
  })

  // Create Water Intake
  console.log('💧 Creating water intake...')
  const waterDates = []
  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    waterDates.push({
      date: date.toISOString().split('T')[0],
      amount: 2.0 + (Math.random() * 0.5), // Between 2.0 and 2.5 liters
    })
  }

  await prisma.waterIntake.createMany({
    data: waterDates,
  })

  console.log('✅ Seed completed successfully!')
  console.log(`
📊 Summary:
  - Projects: 3
  - Work Tasks: 4
  - Personal Tasks: 3
  - Workouts: 3
  - Weight Entries: 7
  - Transactions: 6
  - Notes: 5
  - Pipeline Items: 5
  - Water Intake: 5
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
