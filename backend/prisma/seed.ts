import { PrismaClient, AccountType, CategoryType, TransactionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@expenzo.com';
const DEMO_PASSWORD = 'DemoPassword123!';

async function main(): Promise<void> {
  console.log('Starting seed process...');

  // 1. Clean up existing demo user
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (existingUser) {
    console.log('Cleaning up existing demo user...');
    await prisma.user.delete({
      where: { email: DEMO_EMAIL },
    });
  }

  // 2. Create demo user
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      name: 'Demo User',
      emailVerified: true,
      role: 'USER',
    },
  });
  console.log(`✓ Created user: ${user.name} (${user.email})`);

  // 3. Create Categories
  const categoriesData = [
    // Income Categories
    { name: 'Salary', type: CategoryType.INCOME, color: '#adc6ff', icon: 'payments' },
    { name: 'Freelance', type: CategoryType.INCOME, color: '#4cd7f6', icon: 'laptop_mac' },
    { name: 'Investments', type: CategoryType.INCOME, color: '#acedff', icon: 'trending_up' },
    
    // Expense Categories
    { name: 'Rent & Housing', type: CategoryType.EXPENSE, color: '#ffb4ab', icon: 'home' },
    { name: 'Food & Dining', type: CategoryType.EXPENSE, color: '#c4c0ff', icon: 'restaurant' },
    { name: 'Transport', type: CategoryType.EXPENSE, color: '#8781ff', icon: 'directions_car' },
    { name: 'Subscriptions', type: CategoryType.EXPENSE, color: '#ea4335', icon: 'subscriptions' },
    { name: 'Shopping', type: CategoryType.EXPENSE, color: '#fbbc05', icon: 'shopping_bag' },
    { name: 'Travel', type: CategoryType.EXPENSE, color: '#34a853', icon: 'flight' },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        userId: user.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        isDefault: true,
      },
    });
    categoriesMap[cat.name] = created.id;
  }
  console.log('✓ Created categories');

  // 4. Create Accounts
  const accountsData = [
    { name: 'Chase Checking', type: AccountType.BANK, balance: 12450.0 },
    { name: 'Cash Wallet', type: AccountType.CASH, balance: 2500.0 },
    { name: 'Amex Gold Card', type: AccountType.CREDIT_CARD, balance: -1200.0 },
    { name: 'Crypto & Assets', type: AccountType.INVESTMENT, balance: 4300.0 },
  ];

  const accountsMap: Record<string, string> = {};
  for (const acc of accountsData) {
    const created = await prisma.account.create({
      data: {
        userId: user.id,
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
      },
    });
    accountsMap[acc.name] = created.id;

    // Seed initial balance history
    await prisma.accountBalanceHistory.create({
      data: {
        accountId: created.id,
        balance: acc.balance,
        recordedAt: new Date(),
      },
    });
  }
  console.log('✓ Created accounts');

  // 5. Seed Transactions (over the last 3 months: May, June, July 2026)
  const now = new Date('2026-07-18T12:00:00Z');
  
  const transactions = [
    // --- MAY 2026 ---
    {
      type: TransactionType.INCOME,
      amount: 5000.00,
      date: new Date('2026-05-01T09:00:00Z'),
      account: 'Chase Checking',
      category: 'Salary',
      description: 'Monthly Salary Payment',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 1500.00,
      date: new Date('2026-05-02T10:00:00Z'),
      account: 'Chase Checking',
      category: 'Rent & Housing',
      description: 'May Apartment Rent',
    },
    {
      type: TransactionType.INCOME,
      amount: 850.00,
      date: new Date('2026-05-10T14:00:00Z'),
      account: 'Chase Checking',
      category: 'Freelance',
      description: 'Web Redesign Project Pay',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 120.50,
      date: new Date('2026-05-12T19:30:00Z'),
      account: 'Chase Checking',
      category: 'Food & Dining',
      description: 'Dinner with friends',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 85.00,
      date: new Date('2026-05-15T11:00:00Z'),
      account: 'Chase Checking',
      category: 'Transport',
      description: 'Gas refill',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 15.99,
      date: new Date('2026-05-18T08:00:00Z'),
      account: 'Amex Gold Card',
      category: 'Subscriptions',
      description: 'Netflix subscription',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 250.00,
      date: new Date('2026-05-20T15:00:00Z'),
      account: 'Amex Gold Card',
      category: 'Shopping',
      description: 'New shoes',
    },
    
    // --- JUNE 2026 ---
    {
      type: TransactionType.INCOME,
      amount: 5000.00,
      date: new Date('2026-06-01T09:00:00Z'),
      account: 'Chase Checking',
      category: 'Salary',
      description: 'Monthly Salary Payment',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 1500.00,
      date: new Date('2026-06-02T10:00:00Z'),
      account: 'Chase Checking',
      category: 'Rent & Housing',
      description: 'June Apartment Rent',
    },
    {
      type: TransactionType.INCOME,
      amount: 1200.00,
      date: new Date('2026-06-08T11:00:00Z'),
      account: 'Chase Checking',
      category: 'Freelance',
      description: 'Mobile App design consult',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 220.00,
      date: new Date('2026-06-12T14:00:00Z'),
      account: 'Chase Checking',
      category: 'Food & Dining',
      description: 'Weekly grocery store run',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 75.00,
      date: new Date('2026-06-14T09:00:00Z'),
      account: 'Chase Checking',
      category: 'Transport',
      description: 'Train ticket booking',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 15.99,
      date: new Date('2026-06-18T08:00:00Z'),
      account: 'Amex Gold Card',
      category: 'Subscriptions',
      description: 'Netflix subscription',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 9.99,
      date: new Date('2026-06-19T08:00:00Z'),
      account: 'Amex Gold Card',
      category: 'Subscriptions',
      description: 'Spotify Premium',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 450.00,
      date: new Date('2026-06-22T17:00:00Z'),
      account: 'Chase Checking',
      category: 'Travel',
      description: 'Weekend getaway flight ticket',
    },
    
    // --- JULY 2026 ---
    {
      type: TransactionType.INCOME,
      amount: 5000.00,
      date: new Date('2026-07-01T09:00:00Z'),
      account: 'Chase Checking',
      category: 'Salary',
      description: 'Monthly Salary Payment',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 1500.00,
      date: new Date('2026-07-02T10:00:00Z'),
      account: 'Chase Checking',
      category: 'Rent & Housing',
      description: 'July Apartment Rent',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 320.00,
      date: new Date('2026-07-05T15:00:00Z'),
      account: 'Amex Gold Card',
      category: 'Shopping',
      description: 'Tech accessories',
    },
    {
      type: TransactionType.INCOME,
      amount: 350.00,
      date: new Date('2026-07-10T12:00:00Z'),
      account: 'Crypto & Assets',
      category: 'Investments',
      description: 'Quarterly Dividends Pay',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 45.80,
      date: new Date('2026-07-12T18:00:00Z'),
      account: 'Cash Wallet',
      category: 'Food & Dining',
      description: 'Sushi lunch box',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 15.99,
      date: new Date('2026-07-18T08:00:00Z'),
      account: 'Amex Gold Card',
      category: 'Subscriptions',
      description: 'Netflix subscription',
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: tx.type,
        amount: tx.amount,
        date: tx.date,
        accountId: accountsMap[tx.account],
        categoryId: categoriesMap[tx.category],
        description: tx.description,
      },
    });
  }

  console.log(`✓ Seeded ${transactions.length} transactions for Demo User`);
  console.log('\nSeed process finished successfully!');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
