import { FontAwesome } from "@expo/vector-icons";

export type Category = {
  id: string;
  name: string;
  icon: keyof typeof FontAwesome.glyphMap;
  color: string;
  amount: number;
  count: number;
  isIncome: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Drinks', icon: 'cutlery', color: '#f97316', amount: 0, count: 0, isIncome: false },
  { id: '2', name: 'Smoking', icon: 'fire', color: '#64748b', amount: 0, count: 0, isIncome: false },
  { id: '3', name: 'Drinks', icon: 'glass', color: '#8b5cf6', amount: 0, count: 0, isIncome: false },
  { id: '4', name: 'Shopping', icon: 'shopping-cart', color: '#06b6d4', amount: 0, count: 0, isIncome: false },
  { id: '5', name: 'Transportation', icon: 'car', color: '#ec4899', amount: 0, count: 0, isIncome: false },
  { id: '6', name: 'Bills', icon: 'file-text-o', color: '#f43f5e', amount: 0, count: 0, isIncome: false },
  { id: '7', name: 'Entertainment', icon: 'gamepad', color: '#22c55e', amount: 0, count: 0, isIncome: false },
  { id: '8', name: 'Salary', icon: 'money', color: '#22c55e', amount: 0, count: 0, isIncome: true },
]; 