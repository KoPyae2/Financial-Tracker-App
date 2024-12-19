import { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import SetInitialAmountModal from "@/components/SetInitialAmountModal";
import { useStore } from "@/store/useStore";
import { themes } from '@/types/theme';
import { Transaction } from "@/types/transaction";

type TimeRange = 'month' | 'year';

const getTransactionsInRange = (transactions: Transaction[], range: TimeRange) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (range) {
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return transactions.filter(t => new Date(t.date) >= startDate);
};

const calculateGrowth = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

export default function Dashboard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [initModalVisible, setInitModalVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');
  
  const { 
    transactions, 
    categories, 
    balance,
    setInitialBalance,
    showBalance,
    formatAmount,
    theme,
  } = useStore();

  const themeColors = themes[theme];

  // Memoized calculations
  const stats = useMemo(() => {
    const rangeTransactions = getTransactionsInRange(transactions, selectedRange);
    const prevRangeTransactions = getTransactionsInRange(
      transactions, 
      selectedRange,
    );

    const currentIncome = rangeTransactions
      .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

    const currentExpenses = rangeTransactions
      .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

    const previousIncome = prevRangeTransactions
      .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

    const previousExpenses = prevRangeTransactions
      .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

    return {
      income: {
        current: currentIncome,
        growth: calculateGrowth(currentIncome, previousIncome)
      },
      expenses: {
        current: currentExpenses,
        growth: calculateGrowth(currentExpenses, previousExpenses)
      },
      transactions: rangeTransactions.length
    };
  }, [transactions, selectedRange]);

  // Category breakdown
  const topCategories = useMemo(() => {
    const categoryTotals = transactions.reduce((acc, transaction) => {
      const category = categories.find(c => c.id === transaction.categoryId);
      if (!category) return acc;
      
      acc[category.id] = (acc[category.id] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([id, amount]) => ({
        category: categories.find(c => c.id === id)!,
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, categories]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  useEffect(() => {
    setInitModalVisible(!balance.isInitialized);
  }, [balance.isInitialized]);

  return (
    <ScrollView 
      style={{ backgroundColor: themeColors.background }} 
      className="flex-1 p-4"
      showsVerticalScrollIndicator={false}
    >
      {/* Balance Card */}
      <View style={{ backgroundColor: themeColors.card }} className="p-6 rounded-xl shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text style={{ color: themeColors.text.secondary }} className="text-base font-medium">
            Current Balance
          </Text>
          <View style={{ backgroundColor: themeColors.cardAlt }} className="px-3 py-1 rounded-full">
            <Text style={{ color: themeColors.text.secondary }} className="text-sm">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        <Text style={{ color: themeColors.text.primary }} className="mb-2 text-4xl font-bold">
          {showBalance ? formatAmount(balance.total) : '********'}
        </Text>

        <View className="flex-row items-center">
          <FontAwesome 
            name={balance.total >= 0 ? "arrow-up" : "arrow-down"} 
            size={12} 
            color={balance.total >= 0 ? "#22c55e" : "#ef4444"} 
          />
          <Text style={{ color: balance.total >= 0 ? "#22c55e" : "#ef4444" }} className="ml-1 text-sm">
            {showBalance ? `${Math.abs(balance.total / 100).toFixed(1)}%` : '**%'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity 
          style={{ backgroundColor: themeColors.card }}
          className="flex-1 p-4 mr-2 rounded-xl"
          onPress={() => setModalVisible(true)}
        >
          <View className="items-center">
            <View style={{ backgroundColor: themeColors.cardAlt }} className="p-3 mb-2 rounded-full">
              <FontAwesome name="plus" size={20} color={themeColors.text.accent} />
            </View>
            <Text style={{ color: themeColors.text.primary }} className="text-sm font-medium">
              Add Transaction
            </Text>
          </View>
        </TouchableOpacity>

        <Link href="/analytics" asChild>
          <TouchableOpacity 
            style={{ backgroundColor: themeColors.card }}
            className="flex-1 p-4 ml-2 rounded-xl"
          >
            <View className="items-center">
              <View style={{ backgroundColor: themeColors.cardAlt }} className="p-3 mb-2 rounded-full">
                <FontAwesome name="bar-chart" size={20} color={themeColors.text.accent} />
              </View>
              <Text style={{ color: themeColors.text.primary }} className="text-sm font-medium">
                Analytics
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Monthly Overview */}
      <View style={{ backgroundColor: themeColors.card }} className="p-6 mt-4 rounded-xl">
        <View className="mb-6">
          <Text style={{ color: themeColors.text.primary }} className="text-lg font-bold">
            Overview
          </Text>
          {/* Time Range Filter */}
          <View className="absolute top-0 right-0 flex-row">
            {['month', 'year'].map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedRange(period as TimeRange)}
                style={{ 
                  backgroundColor: selectedRange === period 
                    ? themeColors.text.accent + '20'
                    : themeColors.cardAlt
                }}
                className="px-3 py-1 ml-2 rounded-full"
              >
                <Text 
                  style={{ 
                    color: selectedRange === period 
                      ? themeColors.text.accent
                      : themeColors.text.secondary 
                  }} 
                  className="text-sm font-medium capitalize"
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Income Card */}
        <View 
          style={{ 
            backgroundColor: theme === 'dark' ? '#22c55e15' : '#f0fdf4',
            borderWidth: 1,
            borderColor: theme === 'dark' ? '#22c55e30' : '#dcfce7',
          }}
          className="p-4 mb-4 rounded-xl"
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View 
                style={{ 
                  backgroundColor: theme === 'dark' ? '#22c55e20' : '#dcfce7',
                  shadowColor: '#22c55e',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }} 
                className="justify-center items-center w-12 h-12 rounded-full"
              >
                <FontAwesome name="arrow-up" size={20} color="#22c55e" />
              </View>
              <View className="ml-4">
                <Text style={{ color: themeColors.text.secondary }} className="text-sm font-medium">
                  Total Income
                </Text>
                <Text className="text-xl font-bold text-green-500">
                  {showBalance ? formatAmount(stats.income.current) : '****'}
                </Text>
              </View>
            </View>

            <View 
              style={{ 
                backgroundColor: theme === 'dark' ? '#22c55e10' : '#f0fdf4',
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#22c55e20' : '#bbf7d0',
              }}
              className="px-3 py-2 rounded-xl"
            >
              <View className="flex-row items-center">
                <FontAwesome 
                  name={stats.income.growth >= 0 ? "arrow-up" : "arrow-down"} 
                  size={12} 
                  color={stats.income.growth >= 0 ? "#22c55e" : "#ef4444"} 
                />
                <Text 
                  style={{ color: stats.income.growth >= 0 ? "#22c55e" : "#ef4444" }} 
                  className="ml-1 text-sm font-bold"
                >
                  {showBalance ? `${Math.abs(stats.income.growth).toFixed(1)}%` : '**%'}
                </Text>
              </View>
              <Text style={{ color: themeColors.text.secondary }} className="text-xs mt-1">
                vs last {selectedRange}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text style={{ color: themeColors.text.secondary }} className="text-xs">
                Goal Progress
              </Text>
              <Text style={{ color: themeColors.text.secondary }} className="text-xs font-medium">
                {showBalance 
                  ? `${((stats.income.current / (stats.expenses.current * 2 || 1)) * 100).toFixed(0)}%`
                  : '**%'
                }
              </Text>
            </View>
            <View 
              style={{ 
                backgroundColor: theme === 'dark' ? '#22c55e10' : '#dcfce7',
              }} 
              className="h-2 rounded-full overflow-hidden"
            >
              <View 
                className="h-full"
                style={{ 
                  width: `${(stats.income.current / (stats.expenses.current * 2 || 1)) * 100}%`,
                  backgroundColor: theme === 'dark' ? '#22c55e' : '#16a34a',
                  opacity: theme === 'dark' ? 0.8 : 1
                }}
              />
            </View>
          </View>
        </View>

        {/* Expenses Card */}
        <View 
          style={{ 
            backgroundColor: theme === 'dark' ? '#ef444415' : '#fef2f2',
            borderWidth: 1,
            borderColor: theme === 'dark' ? '#ef444430' : '#fee2e2',
          }}
          className="p-4 rounded-xl"
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View 
                style={{ 
                  backgroundColor: theme === 'dark' ? '#ef444420' : '#fee2e2',
                  shadowColor: '#ef4444',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }} 
                className="justify-center items-center w-12 h-12 rounded-full"
              >
                <FontAwesome name="arrow-down" size={20} color="#ef4444" />
              </View>
              <View className="ml-4">
                <Text style={{ color: themeColors.text.secondary }} className="text-sm font-medium">
                  Total Expenses
                </Text>
                <Text className="text-xl font-bold text-red-500">
                  {showBalance ? formatAmount(stats.expenses.current) : '****'}
                </Text>
              </View>
            </View>

            <View 
              style={{ 
                backgroundColor: theme === 'dark' ? '#ef444410' : '#fff5f5',
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#ef444420' : '#fecaca',
              }}
              className="px-3 py-2 rounded-xl"
            >
              <View className="flex-row items-center">
                <FontAwesome 
                  name={stats.expenses.growth <= 0 ? "arrow-down" : "arrow-up"} 
                  size={12} 
                  color={stats.expenses.growth <= 0 ? "#22c55e" : "#ef4444"} 
                />
                <Text 
                  style={{ color: stats.expenses.growth <= 0 ? "#22c55e" : "#ef4444" }} 
                  className="ml-1 text-sm font-bold"
                >
                  {showBalance ? `${Math.abs(stats.expenses.growth).toFixed(1)}%` : '**%'}
                </Text>
              </View>
              <Text style={{ color: themeColors.text.secondary }} className="text-xs mt-1">
                vs last month
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text style={{ color: themeColors.text.secondary }} className="text-xs">
                Budget Usage
              </Text>
              <Text style={{ color: themeColors.text.secondary }} className="text-xs font-medium">
                {showBalance 
                  ? `${((stats.expenses.current / (stats.income.current || 1)) * 100).toFixed(0)}%`
                  : '**%'
                }
              </Text>
            </View>
            <View 
              style={{ 
                backgroundColor: theme === 'dark' ? '#ef444410' : '#fee2e2',
              }} 
              className="h-2 rounded-full overflow-hidden"
            >
              <View 
                className="h-full"
                style={{ 
                  width: `${(stats.expenses.current / (stats.income.current || 1)) * 100}%`,
                  backgroundColor: theme === 'dark' ? '#ef4444' : '#dc2626',
                  opacity: theme === 'dark' ? 0.8 : 1
                }}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={{ backgroundColor: themeColors.card }} className="p-6 mt-4 rounded-xl">
        <View className="flex-row justify-between items-center mb-4">
          <Text style={{ color: themeColors.text.primary }} className="text-lg font-bold">
            Recent Transactions
          </Text>
          <Link href="/transactions" asChild>
            <TouchableOpacity>
              <Text style={{ color: themeColors.text.accent }} className="text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {recentTransactions.length === 0 ? (
          <View className="items-center py-8">
            <FontAwesome name="list-alt" size={40} color={themeColors.text.secondary} />
            <Text style={{ color: themeColors.text.secondary }} className="mt-4 text-sm">
              No transactions yet
            </Text>
          </View>
        ) : (
          recentTransactions.map((transaction) => {
            const category = categories.find(c => c.id === transaction.categoryId);
            return (
              <View 
                key={transaction.id}
                style={{ backgroundColor: themeColors.cardAlt }}
                className="flex-row items-center p-4 mb-2 rounded-lg"
              >
                <View 
                  style={{ backgroundColor: `${category?.color}20` }}
                  className="justify-center items-center mr-3 w-10 h-10 rounded-full"
                >
                  <FontAwesome name={category?.icon || 'question'} size={16} color={category?.color} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: themeColors.text.primary }} className="font-medium">
                    {transaction.title}
                  </Text>
                  <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text 
                  style={{ color: transaction.type === 'income' ? '#22c55e' : '#ef4444' }}
                  className="text-lg font-bold"
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {showBalance ? formatAmount(transaction.amount) : '****'}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Modals */}
      <AddTransactionModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
      <SetInitialAmountModal 
        visible={initModalVisible} 
        close={() => setInitModalVisible(false)} 
        // onSetAmount={handleSetInitialAmount} 
      />
    </ScrollView>
  );
}
