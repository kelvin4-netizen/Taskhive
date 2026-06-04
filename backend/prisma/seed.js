// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  { name: 'Academic Writing', slug: 'academic-writing', description: 'Essays, research papers, articles, and proofreading tasks.', estimatedEarn: '$5 – $80 per task', sortOrder: 1 },
  { name: 'Freelancing', slug: 'freelancing', description: 'Design, copywriting, web work, and creative projects.', estimatedEarn: '$10 – $200 per task', sortOrder: 2 },
  { name: 'Watching Videos', slug: 'watching-videos', description: 'Watch short clips, ads, and promotional content.', estimatedEarn: '$0.10 – $2 per task', sortOrder: 3 },
  { name: 'Surveys', slug: 'surveys', description: 'Market research surveys from top brands.', estimatedEarn: '$1 – $20 per survey', sortOrder: 4 },
  { name: 'App Testing', slug: 'app-testing', description: 'Test mobile apps and websites for bugs and UX issues.', estimatedEarn: '$3 – $30 per test', sortOrder: 5 },
  { name: 'Data Entry', slug: 'data-entry', description: 'Structured data input including spreadsheets and forms.', estimatedEarn: '$2 – $25 per task', sortOrder: 6 },
  { name: 'Social Media Promotion', slug: 'social-media', description: 'Promote brands, create content, and engage with posts.', estimatedEarn: '$1 – $50 per task', sortOrder: 7 },
  { name: 'Crypto Tasks', slug: 'crypto-tasks', description: 'Airdrops, testnet tasks, DeFi protocol interactions.', estimatedEarn: '$2 – $100 per task', sortOrder: 8 },
];

const packageTemplates = [
  { name: 'Starter', description: 'Perfect for beginners', price: 10, taskLimit: 20, isUnlimited: false, isMonthly: false, features: ['20 Tasks', '1 Category Access', 'Email Support'], sortOrder: 1 },
  { name: 'Pro', description: 'Most popular choice', price: 25, taskLimit: 100, isUnlimited: false, isMonthly: false, features: ['100 Tasks', '3 Category Access', 'Priority Tasks', 'Task Analytics'], sortOrder: 2 },
  { name: 'Unlimited', description: 'Maximum earning potential', price: 50, taskLimit: null, isUnlimited: true, isMonthly: true, features: ['Unlimited Tasks', 'All Categories', 'Priority Support', 'Advanced Analytics', 'Referral Bonuses'], sortOrder: 3 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@taskhive.com' },
    create: {
      fullName: 'TaskHive Admin',
      email: process.env.ADMIN_EMAIL || 'admin@taskhive.com',
      passwordHash: adminHash,
      country: 'US',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      profileCompleted: true,
      referralCode: 'TH-ADMIN',
    },
    update: {},
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Categories + packages
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: cat,
    });

    for (const pkg of packageTemplates) {
      await prisma.package.upsert({
        where: { id: `${category.id}-${pkg.name}`.replace(/[^a-z0-9-]/gi, '') },
        create: { ...pkg, categoryId: category.id },
        update: { ...pkg, categoryId: category.id },
      }).catch(async () => {
        // upsert by composite check
        const exists = await prisma.package.findFirst({ where: { categoryId: category.id, name: pkg.name } });
        if (!exists) await prisma.package.create({ data: { ...pkg, categoryId: category.id } });
      });
    }

    // Sample tasks per category
    const sampleTasks = [
      { title: `${cat.name} Task — Beginner`, description: `Complete a beginner-level ${cat.name.toLowerCase()} task.`, instructions: '1. Read the brief carefully\n2. Complete the work\n3. Submit proof via the submission form', reward: 5, difficulty: 'EASY', timeLimit: 60, tags: ['beginner', 'quick'] },
      { title: `${cat.name} Task — Intermediate`, description: `Complete an intermediate ${cat.name.toLowerCase()} task requiring moderate effort.`, instructions: '1. Review task requirements\n2. Complete all required steps\n3. Provide screenshot proof', reward: 15, difficulty: 'MEDIUM', timeLimit: 120, tags: ['intermediate'] },
    ];

    for (const task of sampleTasks) {
      const existing = await prisma.task.findFirst({ where: { categoryId: category.id, title: task.title } });
      if (!existing) await prisma.task.create({ data: { ...task, categoryId: category.id } });
    }

    console.log(`✅ Category seeded: ${cat.name}`);
  }

  // Phone numbers inventory
  const phoneNumbers = [
    '+1 (212) 555-0101', '+1 (212) 555-0102', '+1 (213) 555-0201',
    '+1 (213) 555-0202', '+1 (312) 555-0301', '+1 (415) 555-0401',
    '+1 (469) 555-0501', '+1 (512) 555-0601', '+1 (617) 555-0701',
    '+1 (702) 555-0801',
  ];

  for (const number of phoneNumbers) {
    await prisma.phoneNumber.upsert({
      where: { number },
      create: { number, areaCode: number.slice(4, 7) },
      update: {},
    });
  }
  console.log(`✅ ${phoneNumbers.length} phone numbers seeded`);

  console.log('✅ Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
