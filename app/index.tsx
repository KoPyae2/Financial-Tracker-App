import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import SetInitialAmountModal from "@/components/SetInitialAmountModal";
import { useStore } from "@/store/useStore";
import { themes } from '@/types/theme';

export default function Dashboard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [initModalVisible, setInitModalVisible] = useState(false);
  
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

  const getCategoryById = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const thisMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthIncome = thisMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSetInitialAmount = (amount: number) => {
    setInitialBalance(amount);
    setInitModalVisible(false);
  };


  useEffect(() => {
    setInitModalVisible(!balance.isInitialized);
  }, [balance.isInitialized]);

  return (
    <View style={{ backgroundColor: themeColors.background }} className="flex-1 p-4 pb-0">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Balance Summary */}
        <View style={{ backgroundColor: themeColors.card }} className="p-6 mb-4 rounded-xl shadow-sm">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ color: themeColors.text.secondary }} className="text-base font-medium">
              Current Balance
            </Text>
            <View style={{ backgroundColor: themeColors.cardAlt }} 
              className="px-3 py-1 rounded-full">
              <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Balance Amount */}
          <View className="mb-6">
            <Text style={{ color: themeColors.text.primary }} 
              className="text-4xl font-bold tracking-tight">
              {showBalance ? formatAmount(balance.total) : '********'}
            </Text>
            <View className="flex-row items-center mt-2">
              <FontAwesome 
                name={balance.total >= 0 ? "arrow-up" : "arrow-down"} 
                size={12} 
                color={balance.total >= 0 ? "#22c55e" : "#ef4444"} 
              />
              <Text style={{ 
                color: balance.total >= 0 ? "#22c55e" : "#ef4444" 
              }} className="ml-1 text-sm font-medium">
                {showBalance 
                  ? `${((Math.abs(balance.total) / (totalIncome || 1)) * 100).toFixed(1)}% ${balance.total >= 0 ? 'profit' : 'loss'}`
                  : '**%'
                }
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={{ backgroundColor: themeColors.border }} className="h-[1px] mb-6 opacity-30" />

          {/* Income & Expense Summary */}
          <View className="space-y-4">
            {/* Income */}
            <View className="flex-row justify-between items-center p-3 rounded-xl"
              style={{ backgroundColor: theme === 'dark' ? '#22c55e15' : '#f0fdf4' }}>
              <View className="flex-row flex-1 items-center">
                <View className="justify-center items-center w-10 h-10 rounded-full bg-green-500/20">
                  <FontAwesome name="arrow-up" size={16} color="#22c55e" />
                </View>
                <View className="ml-3">
                  <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                    Total Income
                  </Text>
                  <Text className="text-lg font-bold text-green-500">
                    {showBalance ? formatAmount(totalIncome) : '********'}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text style={{ color: themeColors.text.secondary }} className="mb-1 text-xs">
                  Share
                </Text>
                <Text className="text-sm font-medium text-green-500">
                  {showBalance 
                    ? `${((totalIncome / (totalIncome + totalExpenses || 1)) * 100).toFixed(1)}%`
                    : '**%'
                  }
                </Text>
              </View>
            </View>

            {/* Expenses */}
            <View className="flex-row justify-between items-center p-3 rounded-xl"
              style={{ backgroundColor: theme === 'dark' ? '#ef444415' : '#fef2f2' }}>
              <View className="flex-row flex-1 items-center">
                <View className="justify-center items-center w-10 h-10 rounded-full bg-red-500/20">
                  <FontAwesome name="arrow-down" size={16} color="#ef4444" />
                </View>
                <View className="ml-3">
                  <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                    Total Expenses
                  </Text>
                  <Text className="text-lg font-bold text-red-500">
                    {showBalance ? formatAmount(totalExpenses) : '********'}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text style={{ color: themeColors.text.secondary }} className="mb-1 text-xs">
                  Share
                </Text>
                <Text className="text-sm font-medium text-red-500">
                  {showBalance 
                    ? `${((totalExpenses / (totalIncome + totalExpenses || 1)) * 100).toFixed(1)}%`
                    : '**%'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* This Month Card */}
        <View style={{ backgroundColor: themeColors.card }} className="p-6 mb-4 rounded-md shadow-sm">
          <View className="flex-row justify-between items-center mb-6">
            <Text style={{ color: themeColors.text.primary }} className="text-lg font-bold">
              This Month Overview
            </Text>
            <View style={{ backgroundColor: themeColors.cardAlt }} 
              className="px-3 py-1 rounded-full">
              <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                {new Date().toLocaleDateString('en-US', { month: 'long' })}
              </Text>
            </View>
          </View>

          <View className="space-y-4">
            {/* Income Section */}
            <View className="p-4 rounded-2xl" 
              style={{ backgroundColor: theme === 'dark' ? '#22c55e15' : '#f0fdf4' }}>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="justify-center items-center w-8 h-8 rounded-full bg-green-500/20">
                    <FontAwesome name="arrow-up" size={14} color="#22c55e" />
                  </View>
                  <Text style={{ color: themeColors.text.primary }} className="ml-2 text-base font-medium">
                    Monthly Income
                  </Text>
                </View>
                <Text className="text-lg font-bold text-green-500">
                  {showBalance ? formatAmount(thisMonthIncome) : '********'}
                </Text>
              </View>
              <View className="overflow-hidden h-2 bg-green-200 rounded-full">
                <View 
                  className="h-full bg-green-500"
                  style={{ 
                    width: `${(thisMonthIncome / (thisMonthIncome + thisMonthExpenses || 1)) * 100}%`,
                  }}
                />
              </View>
            </View>

            {/* Expenses Section */}
            <View className="p-4 rounded-2xl"
              style={{ backgroundColor: theme === 'dark' ? '#ef444415' : '#fef2f2' }}>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="justify-center items-center w-8 h-8 rounded-full bg-red-500/20">
                    <FontAwesome name="arrow-down" size={14} color="#ef4444" />
                  </View>
                  <Text style={{ color: themeColors.text.primary }} className="ml-2 text-base font-medium">
                    Monthly Expenses
                  </Text>
                </View>
                <Text className="text-lg font-bold text-red-500">
                  {showBalance ? formatAmount(thisMonthExpenses) : '********'}
                </Text>
              </View>
              <View className="overflow-hidden h-2 bg-red-200 rounded-full">
                <View 
                  className="h-full bg-red-500"
                  style={{ 
                    width: `${(thisMonthExpenses / (thisMonthIncome + thisMonthExpenses || 1)) * 100}%`,
                  }}
                />
              </View>
            </View>

            {/* Savings Rate */}
            <View className="p-4 mt-2 rounded-2xl"
              style={{ backgroundColor: themeColors.cardAlt }}>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="justify-center items-center w-8 h-8 rounded-full bg-blue-500/20">
                    <FontAwesome name="bank" size={14} color={themeColors.text.accent} />
                  </View>
                  <Text style={{ color: themeColors.text.primary }} className="ml-2 text-base font-medium">
                    Savings Rate
                  </Text>
                </View>
                <Text style={{ color: themeColors.text.accent }} className="text-lg font-bold">
                  {showBalance 
                    ? `${((thisMonthIncome - thisMonthExpenses) / (thisMonthIncome || 1) * 100).toFixed(1)}%`
                    : '**%'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions Card */}
        <View style={{ backgroundColor: themeColors.card }} className="p-6 mb-4 rounded-md shadow-sm">
          <Text style={{ color: themeColors.text.primary }} className="mb-4 text-lg font-bold">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity 
              style={{ backgroundColor: themeColors.cardAlt }} 
              className="items-center w-[48%] p-4 mb-3 rounded-lg"
              onPress={() => setModalVisible(true)}
            >
              <View style={{ backgroundColor: theme === 'dark' ? '#3b82f620' : '#dbeafe' }}
                className="justify-center items-center mb-2 w-12 h-12 rounded-full">
                <FontAwesome name="plus" size={24} color={theme === 'dark' ? '#60a5fa' : '#2563eb'} />
              </View>
              <Text style={{ color: themeColors.text.primary }} className="text-sm font-medium">
                Add Transaction
              </Text>
            </TouchableOpacity>

            <Link href="/analytics" asChild>
              <TouchableOpacity 
                style={{ backgroundColor: themeColors.background }}
                className="items-center w-[48%] p-4 mb-3 rounded-lg"
              >
                <View className="justify-center items-center mb-2 w-12 h-12 bg-purple-100 rounded-full">
                  <FontAwesome name="bar-chart" size={24} color="#7c3aed" />
                </View>
                <Text style={{ color: themeColors.text.primary }} className="text-sm font-medium">
                  View Analytics
                </Text>
              </TouchableOpacity>
            </Link>

            <Link href="/transactions" asChild>
              <TouchableOpacity 
                style={{ backgroundColor: themeColors.background }}
                className="items-center w-[48%] p-4 rounded-lg"
              >
                <View className="justify-center items-center mb-2 w-12 h-12 bg-orange-100 rounded-full">
                  <FontAwesome name="list" size={24} color="#ea580c" />
                </View>
                <Text style={{ color: themeColors.text.primary }} className="text-sm font-medium">
                  All Transactions
                </Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity 
              style={{ backgroundColor: themeColors.background }}
              className="items-center w-[48%] p-4 rounded-lg"
              onPress={() => setInitModalVisible(true)}
            >
              <View className="justify-center items-center mb-2 w-12 h-12 bg-emerald-100 rounded-full">
                <FontAwesome name="refresh" size={24} color="#059669" />
              </View>
              <Text style={{ color: themeColors.text.primary }} className="text-sm font-medium">
                Update Balance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions Card */}
        <View style={{ backgroundColor: themeColors.card }} className="p-6 mb-4 rounded-md shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ color: themeColors.text.primary }} className="text-lg font-bold">
              Recent Transactions
            </Text>
            <Link href="/transactions" asChild>
              <TouchableOpacity>
                <Text style={{ color: themeColors.text.accent }} className="text-sm font-semibold">
                  View All
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {recentTransactions.length === 0 ? (
            <View className="justify-center items-center p-8">
              <FontAwesome name="list-alt" size={48} color={themeColors.text.secondary} />
              <Text style={{ color: themeColors.text.primary }} className="mt-4 text-base font-medium">
                No transactions yet
              </Text>
              <Text style={{ color: themeColors.text.secondary }} className="mt-1 text-sm">
                Add your first transaction to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={recentTransactions}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const category = getCategoryById(item.categoryId);
                const date = new Date(item.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <View style={{ borderBottomColor: themeColors.border }} 
                    className="flex-row py-3 border-b">
                    <View
                      className="justify-center items-center w-12 h-12 rounded-full"
                      style={{ backgroundColor: category?.color + "15" }}
                    >
                      <FontAwesome
                        name={category?.icon || "question"}
                        size={20}
                        color={category?.color}
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <View className="flex-row justify-between items-center">
                        <Text style={{ color: themeColors.text.primary }} className="text-base font-semibold">
                          {item.title}
                        </Text>
                        <Text className={`text-base font-semibold ${item.type === "income" ? "text-green-500" : "text-red-500"}`}>
                          {item.type === "income" ? "+" : "-"}{formatAmount(item.amount)}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1.5">
                        <View
                          className="px-2 py-1 mr-2 rounded-lg"
                          style={{ backgroundColor: category?.color + "15" }}
                        >
                          <Text style={{ color: category?.color }} className="text-sm font-medium">
                            {category?.name || "Uncategorized"}
                          </Text>
                        </View>
                        <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                          {date}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      <AddTransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <SetInitialAmountModal visible={initModalVisible} close={() => setInitModalVisible(false)} />
    </View>
  );
}
