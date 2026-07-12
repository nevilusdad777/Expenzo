import { Prisma } from '@prisma/client';
import { AccountType, CategoryType } from '@prisma/client';

const incomeCategories = [
  'Salary',
  'Business',
  'Freelancing',
  'Interest',
  'Bonus',
  'Cashback',
  'Refund',
  'Gift',
  'Investment Returns',
  'Other',
];

const expenseCategories = [
  'Food',
  'Groceries',
  'Shopping',
  'Bills',
  'Electricity',
  'Water',
  'Gas',
  'Internet',
  'Phone Recharge',
  'Fuel',
  'Travel',
  'Medical',
  'Insurance',
  'Rent',
  'EMI',
  'Entertainment',
  'Education',
  'Subscription',
  'Home Expense',
  'Family',
  'Investment',
  'Other',
];

function categoryId(userId: string, type: 'income' | 'expense', name: string) {
  return `${userId}-${type}-${name.toLowerCase().replace(/\s+/g, '-')}`;
}

export async function seedDefaultsForUser(
  db: Prisma.TransactionClient,
  userId: string
) {
  for (const name of incomeCategories) {
    await db.category.create({
      data: {
        id: categoryId(userId, 'income', name),
        userId,
        name,
        type: CategoryType.INCOME,
        isDefault: true,
      },
    });
  }

  for (const name of expenseCategories) {
    await db.category.create({
      data: {
        id: categoryId(userId, 'expense', name),
        userId,
        name,
        type: CategoryType.EXPENSE,
        isDefault: true,
      },
    });
  }

  const cashAccount = await db.account.create({
    data: {
      userId,
      name: 'Cash',
      type: AccountType.CASH,
      balance: 0,
    },
  });

  await db.accountBalanceHistory.create({
    data: { accountId: cashAccount.id, balance: 0 },
  });
}
