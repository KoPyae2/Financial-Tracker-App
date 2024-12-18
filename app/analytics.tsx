import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Dimensions } from "react-native";
import PieChart from "react-native-pie-chart";
import { Category } from "@/types/category";
import { useStore } from "@/store/useStore";
import { themes } from "@/types/theme";

type TimePeriod = 'all' | 'year' | 'month' | 'week';

export default function Analytics() {
  const {
    categories,
    showBalance,
    transactions,
    toggleBalanceVisibility,
    formatAmount,
    theme
  } = useStore();

  const themeColors = themes[theme];

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const screenWidth = Dimensions.get('window').width;

  // Filter transactions based on selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return transactionDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return transactionDate >= yearAgo;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate category amounts based on filtered transactions
  const categoriesWithAmounts = categories.map(category => ({
    ...category,
    amount: filteredTransactions
      .filter(t => t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0),
    count: filteredTransactions.filter(t => t.categoryId === category.id).length
  }));

  const expenseCategories = categoriesWithAmounts.filter(cat => cat.amount > 0 && !cat.isIncome);
  const incomeCategories = categoriesWithAmounts.filter(cat => cat.amount > 0 && cat.isIncome);

  const totalExpenses = expenseCategories.reduce((sum, category) => sum + category.amount, 0);
  const totalIncome = incomeCategories.reduce((sum, category) => sum + category.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const TimePeriodSelector = () => (
    <View className="flex-row mb-4">
      {(['week', 'month', 'year', 'all'] as TimePeriod[]).map((period) => (
        <TouchableOpacity
          key={period}
          style={{ 
            backgroundColor: selectedPeriod === period 
              ? themeColors.text.accent 
              : themeColors.cardAlt 
          }}
          className="px-4 py-2 mr-2 rounded-full"
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={{ 
              color: selectedPeriod === period 
                ? '#ffffff' 
                : themeColors.text.secondary 
            }}
            className="text-sm font-medium"
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const BalanceHeader = () => (
    <View style={{ backgroundColor: themeColors.card }} className="p-6 mb-4 rounded-md shadow-sm">
      <View className="flex-row justify-between items-center mb-6">
        <Text style={{ color: themeColors.text.primary }} className="text-2xl font-bold">
          Overview
        </Text>
      </View>

      <View className="flex-row justify-between mb-4">
        <View style={{ backgroundColor: themeColors.indicators.income.background }}
          className="flex-1 p-4 mr-2 rounded-lg">
          <Text style={{ color: themeColors.text.secondary }} className="text-sm">Income</Text>
          <Text style={{ color: themeColors.indicators.income.text }} className="text-lg font-bold">
            {showBalance ? formatAmount(totalIncome) : '********'}
          </Text>
        </View>
        <View style={{ backgroundColor: themeColors.indicators.expense.background }}
          className="flex-1 p-4 ml-2 rounded-lg">
          <Text style={{ color: themeColors.text.secondary }} className="text-sm">Expenses</Text>
          <Text style={{ color: themeColors.indicators.expense.text }} className="text-lg font-bold">
            {showBalance ? formatAmount(totalExpenses) : '********'}
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: theme === 'dark' ? '#3b82f620' : '#dbeafe' }}
        className="flex-row justify-between items-center p-4 rounded-lg">
        <View>
          <Text style={{ color: themeColors.text.secondary }} className="text-sm">Net Balance</Text>
          <Text style={{ 
            color: balance >= 0 
              ? theme === 'dark' ? '#4ade80' : '#22c55e'
              : theme === 'dark' ? '#f87171' : '#ef4444'
          }} className="text-xl font-bold">
            {showBalance ? formatAmount(Math.abs(balance)) : '********'}
          </Text>
          <Text style={{ color: themeColors.text.secondary }} className="mt-1 text-xs">
            {balance >= 0 ? 'Surplus' : 'Deficit'}
          </Text>
        </View>
        <View className="items-end">
          <Text style={{ color: themeColors.text.secondary }} className="text-sm">Savings Rate</Text>
          <Text style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} className="text-xl font-bold">
            {showBalance ? `${savingsRate.toFixed(1)}%` : '**'}
          </Text>
          <Text style={{ color: themeColors.text.secondary }} className="mt-1 text-xs">
            of total income
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={{ backgroundColor: themeColors.card }} className="flex-row p-4 mb-3 rounded-md shadow-sm">
      <View
        className="w-[50px] h-[50px] rounded-full items-center justify-center"
        style={{ backgroundColor: item.color + "20" }}
      >
        <FontAwesome name={item.icon} size={24} color={item.color} />
      </View>
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text style={{ color: themeColors.text.primary }} className="text-lg font-semibold">
            {item.name}
          </Text>
          <Text style={{ color: themeColors.text.primary }} className="text-lg font-bold">
            {showBalance ? formatAmount(item.amount) : '********'}
          </Text>
        </View>
        <View className="mt-2">
          <View className="flex-row justify-between items-center mb-1">
            <Text style={{ color: themeColors.text.secondary }} className="text-sm">
              {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
            </Text>
            <Text style={{ color: themeColors.text.secondary }} className="text-sm">
              {((item.amount / (item.isIncome ? totalIncome : totalExpenses)) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={{ backgroundColor: themeColors.cardAlt }} className="h-1.5 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: item.color,
                width: `${(item.amount / (item.isIncome ? totalIncome : totalExpenses)) * 100}%`
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const PieChartSection = ({
    title,
    total,
    categories,
    emptyMessage,
    type
  }: {
    title: string;
    total: number;
    categories: Category[];
    emptyMessage: string;
    type: 'income' | 'expense';
  }) => {
    const hasData = total > 0;
    const chartData = hasData ? categories.map((category) => category.amount) : [1];
    const chartColors = hasData ? categories.map((category) => category.color) : [themeColors.cardAlt];

    return (
      <View style={{ backgroundColor: themeColors.card }} className="p-6 mb-4 rounded-md shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text style={{ color: themeColors.text.primary }} className="text-lg font-bold">
            {title}
          </Text>
          <Text style={{ 
            color: type === 'income'
              ? theme === 'dark' ? '#4ade80' : '#22c55e'
              : theme === 'dark' ? '#f87171' : '#ef4444'
          }} className="text-lg font-bold">
            {showBalance ? formatAmount(total) : '********'}
          </Text>
        </View>

        {hasData ? (
          <View className="items-center">
            <PieChart
              widthAndHeight={200}
              series={chartData}
              sliceColor={chartColors}
              coverRadius={0.75}
              coverFill={themeColors.card}
            />
            <View className="mt-6 w-full">
              {categories.map((category) => (
                <View key={category.id} className="flex-row justify-between items-center mb-3">
                  <View className="flex-row flex-1 items-center">
                    <View
                      className="mr-2 w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <Text style={{ color: themeColors.text.primary }} className="text-base">
                      {category.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                      {showBalance ? formatAmount(category.amount) : '********'}
                    </Text>
                    <Text style={{ color: themeColors.text.secondary }} className="ml-2 text-sm">
                      ({((category.amount / total) * 100).toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="items-center py-12">
            <FontAwesome name="bar-chart" size={48} color={themeColors.text.secondary} />
            <Text style={{ color: themeColors.text.secondary }} className="mt-4 text-base">
              {emptyMessage}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: themeColors.background }} className="flex-1">
      <FlatList
        data={[{ id: 'dummy' }]}
        keyExtractor={item => item.id}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <View style={{ backgroundColor: themeColors.background }} className="p-4">
            <TimePeriodSelector />
            <BalanceHeader />
            <PieChartSection
              title="Income Sources"
              total={totalIncome}
              categories={incomeCategories}
              emptyMessage="No income recorded for this period"
              type="income"
            />
            <PieChartSection
              title="Expense Categories"
              total={totalExpenses}
              categories={expenseCategories}
              emptyMessage="No expenses recorded for this period"
              type="expense"
            />
            {categoriesWithAmounts.filter(cat => cat.count > 0).length > 0 && (
              <View className="mb-4">
                <Text style={{ color: themeColors.text.primary }} className="mb-4 text-lg font-bold">
                  Detailed Breakdown
                </Text>
                {categoriesWithAmounts
                  .filter(cat => cat.count > 0)
                  .sort((a, b) => b.amount - a.amount)
                  .map(category => (
                    <View key={category.id}>
                      {renderCategory({ item: category })}
                    </View>
                  ))
                }
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

