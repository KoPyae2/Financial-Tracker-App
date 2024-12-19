import { Transaction } from "@/types/transaction";
import { Category } from "@/types/category";

// Helper function to generate random amount between min and max
const randomAmount = (min: number, max: number) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

// Helper function to generate a date within the last 3 months
const randomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 3);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Category IDs (you should match these with your actual category IDs)
const CATEGORY_IDS = {
  SHOPPING: '1',
  FOOD: '2',
  TRANSPORT: '3',
  ENTERTAINMENT: '4',
  BILLS: '5',
  SALARY: '6',
  GIFTS: '7',
  INVESTMENTS: '8',
  HEALTH: '9',
  EDUCATION: '10',
};

// Helper function to generate transactions for a specific category
const generateTransactions = (
  count: number,
  categoryId: string,
  type: 'income' | 'expense',
  startDay: number,
  baseAmount: { min: number; max: number }
) => {
  return Array(count).fill(null).map((_, i) => ({
    amount: randomAmount(baseAmount.min, baseAmount.max),
    date: new Date(2024, 5, startDay + (i * 0.1)).toISOString(), // Convert to ISO string
    title: `${type === 'income' ? 'Income' : 'Expense'} ${i + 1}`,
    note: `Transaction note ${i + 1}`,
    categoryId,
    type
  }));
};

export const mockTransactions: Omit<Transaction, "id">[] = [
  // Generate 2000 Shopping transactions
  ...generateTransactions(36, CATEGORY_IDS.SHOPPING, 'expense', 1, { min: 20, max: 200 }),

  // Generate 2000 Food transactions
  ...generateTransactions(6, CATEGORY_IDS.FOOD, 'expense', 1, { min: 10, max: 50 }),

  // Generate 1500 Transport transactions
  ...generateTransactions(6, CATEGORY_IDS.TRANSPORT, 'expense', 1, { min: 5, max: 30 }),

  // Generate 1000 Entertainment transactions
  ...generateTransactions(6, CATEGORY_IDS.ENTERTAINMENT, 'expense', 1, { min: 15, max: 100 }),

  // Generate 1000 Bills transactions
  ...generateTransactions(6, CATEGORY_IDS.BILLS, 'expense', 1, { min: 50, max: 200 }),

  // Generate 500 Salary transactions
  ...generateTransactions(6, CATEGORY_IDS.SALARY, 'income', 1, { min: 3000, max: 5000 }),

  // Generate 500 Investment transactions
  ...generateTransactions(6, CATEGORY_IDS.INVESTMENTS, 'income', 1, { min: 100, max: 1000 }),

  // Generate 500 Health transactions
  ...generateTransactions(6, CATEGORY_IDS.HEALTH, 'expense', 1, { min: 30, max: 150 }),

  // Generate 500 Education transactions
  ...generateTransactions(6, CATEGORY_IDS.EDUCATION, 'expense', 1, { min: 100, max: 300 }),

  // Generate 500 Gift transactions
  ...generateTransactions(6, CATEGORY_IDS.GIFTS, 'expense', 1, { min: 20, max: 100 }),
];

// Mock Categories with proper type
export const mockCategories: Omit<Category, "id">[] = [
  {
    name: 'Shopping',
    color: '#4CAF50',
    icon: 'shopping-bag',
    isIncome: false,
    amount: 0,
    count: 0
  },
  {
    name: 'Food',
    color: '#FF9800',
    icon: 'cutlery',
    isIncome: false,
    amount: 0,
    count: 0
  },
  {
    name: 'Transport',
    color: '#2196F3',
    icon: 'car',
    isIncome: false,
    amount: 0,
    count: 0
  },
  {
    name: 'Entertainment',
    color: '#9C27B0',
    icon: 'gamepad',
    isIncome: false,
    amount: 0,
    count: 0
  },
  {
    name: 'Bills',
    color: '#F44336',
    icon: 'file-text-o',
    isIncome: false,
    amount: 0,
    count: 0
  },
  {
    name: 'Salary',
    color: '#4CAF50',
    icon: 'money',
    isIncome: true,
    amount: 0,
    count: 0
  },
  {
    name: 'Gifts',
    color: '#E91E63',
    icon: 'gift',
    isIncome: false,
    amount: 0,
    count: 0
  },
  {
    name: 'Investments',
    color: '#009688',
    icon: 'line-chart',
    isIncome: true,
    amount: 0,
    count: 0
  },
  {
    name: 'Health',
    color: '#00BCD4',
    icon: 'medkit',
    isIncome: false,
    amount: 0,
    count: 0
  },
  {
    name: 'Education',
    color: '#FF5722',
    icon: 'graduation-cap',
    isIncome: false,
    amount: 0,
    count: 0
  },
]; 