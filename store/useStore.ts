import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types/transaction';
import { Category, DEFAULT_CATEGORIES } from '@/types/category';
import { Balance } from '@/types/balance';
import { Currency, CURRENCIES } from '@/types/currency';
import { ThemeType, themes } from '@/types/theme';

interface ImportedData {
  transactions: Transaction[];
  categories: Category[];
  balance: {
    total: number;
    isInitialized: boolean;
  };
  exportDate: string;
  version: string;
}

interface StoreState {
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategoryAmount: (id: string, amount: number) => void;
  
  // Balance
  balance: Balance;
  setInitialBalance: (amount: number) => void;
  
  // Loading States
  loading: boolean;
  setLoading: (loading: boolean) => void;

  deleteTransaction: (id: string) => void;

  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;

  showBalance: boolean;
  toggleBalanceVisibility: () => void;

  initializeStore: () => Promise<void>;

  importData: (data: ImportedData) => Promise<void>;

  currency: string;
  setCurrency: (currency: string) => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;

  isBiometricEnabled: boolean;
  toggleBiometric: () => Promise<void>;

  formatAmount: (amount: number) => string;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      balance: { total: 0, isInitialized: false },
      loading: false,
      showBalance: true,

      // Actions
      setLoading: (loading: boolean) => set({ loading }),

      addTransaction: (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = {
          ...transaction,
          id: Date.now().toString(),
        };

        set((state) => {
          // Update balance
          const newBalance = {
            ...state.balance,
            total:
              state.balance.total +
              (transaction.type === 'income' ? transaction.amount : -transaction.amount),
          };

          // Update category amounts
          const updatedCategories = state.categories.map((cat) => {
            if (cat.id === transaction.categoryId) {
              return {
                ...cat,
                amount: cat.amount + transaction.amount,
                count: cat.count + 1,
              };
            }
            return cat;
          });

          return {
            transactions: [...state.transactions, newTransaction],
            balance: newBalance,
            categories: updatedCategories,
          };
        });
      },

      addCategory: (category: Omit<Category, 'id'>) => {
        const newCategory = {
          ...category,
          id: Date.now().toString(),
          amount: 0,
          count: 0,
        };

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategoryAmount: (id: string, amount: number) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, amount: cat.amount + amount } : cat
          ),
        }));
      },

      setInitialBalance: (amount: number) => 
        set(state => ({
          balance: {
            total: amount,
            isInitialized: true
          }
        })),

      deleteTransaction: (id: string) => {
        set((state) => {
          const transaction = state.transactions.find((t) => t.id === id);
          if (!transaction) return state;

          // Update category amount and count
          const updatedCategories = state.categories.map((cat) => {
            if (cat.id === transaction.categoryId) {
              return {
                ...cat,
                amount: cat.amount - (transaction.type === 'expense' ? transaction.amount : -transaction.amount),
                count: cat.count - 1,
              };
            }
            return cat;
          });

          // Update balance
          const balanceChange = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
          
          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            categories: updatedCategories,
            balance: {
              ...state.balance,
              total: state.balance.total + balanceChange,
            },
          };
        });
      },

      updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => {
        set((state) => {
          const oldTransaction = state.transactions.find((t) => t.id === id);
          if (!oldTransaction) return state;

          // Revert old category stats
          const updatedCategories = state.categories.map((cat) => {
            if (cat.id === oldTransaction.categoryId) {
              return {
                ...cat,
                amount: cat.amount - (oldTransaction.type === 'expense' ? oldTransaction.amount : -oldTransaction.amount),
                count: cat.count - 1,
              };
            }
            return cat;
          });

          // Update new category stats
          const finalCategories = updatedCategories.map((cat) => {
            if (cat.id === transaction.categoryId) {
              return {
                ...cat,
                amount: cat.amount + (transaction.type === 'expense' ? transaction.amount : -transaction.amount),
                count: cat.count + 1,
              };
            }
            return cat;
          });

          // Calculate balance change
          const oldBalanceEffect = oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount;
          const newBalanceEffect = transaction.type === 'income' ? transaction.amount : -transaction.amount;
          const balanceChange = newBalanceEffect - oldBalanceEffect;

          return {
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...transaction, id } : t
            ),
            categories: finalCategories,
            balance: {
              ...state.balance,
              total: state.balance.total + balanceChange,
            },
          };
        });
      },

      toggleBalanceVisibility: () => {
        set(state => ({
          showBalance: !state.showBalance
        }));
      },

      initializeStore: async () => {
        try {
          // Get all necessary data from AsyncStorage
          const balanceData = await AsyncStorage.getItem('@balance');
          const transactionsData = await AsyncStorage.getItem('@transactions');
          const categoriesData = await AsyncStorage.getItem('@categories');

          console.log(balanceData);
          console.log(transactionsData);
          console.log(categoriesData);
          

          const balance = balanceData ? JSON.parse(balanceData) : { total: 0, isInitialized: false };
          
          // Ensure isInitialized is true if we have a balance
          if (balance.total !== undefined) {
            balance.isInitialized = true;
          }

          // Update the store with the new data
          set({
            balance,
            transactions: transactionsData ? JSON.parse(transactionsData) : [],
            categories: categoriesData ? JSON.parse(categoriesData) : DEFAULT_CATEGORIES,
          });
        } catch (error) {
          console.error('Failed to initialize store:', error);
        }
      },

      importData: async (data: ImportedData) => {
        try {
          // Save imported data to AsyncStorage
          await AsyncStorage.setItem('@transactions', JSON.stringify(data.transactions));
          await AsyncStorage.setItem('@categories', JSON.stringify(data.categories));
          await AsyncStorage.setItem('@balance', JSON.stringify(data.balance));

          // Update store state
          set({
            transactions: data.transactions,
            categories: data.categories,
            balance: data.balance,
          });
        } catch (error) {
          console.error('Failed to import data:', error);
          throw error;
        }
      },

      currency: 'USD',
      setCurrency: (currency: string) => set({ currency }),
      theme: 'light' as ThemeType,
      setTheme: (newTheme: ThemeType) => {
        set({ theme: newTheme });
        // Optional: Update StatusBar style here if needed
      },
      notificationsEnabled: true,
      toggleNotifications: () => set(state => ({ 
        notificationsEnabled: !state.notificationsEnabled 
      })),

      isBiometricEnabled: false,
      toggleBiometric: async () => {
        set(state => ({ 
          isBiometricEnabled: !state.isBiometricEnabled 
        }));
      },

      formatAmount: (amount: number) => {
        const { currency } = get();
        const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
        
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyInfo.code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      },
    }),
    {
      name: 'financial-tracker-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 