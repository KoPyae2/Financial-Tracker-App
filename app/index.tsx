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
        <View style={{ backgroundColor: themeColors.card }} className="p-6 mb-4 rounded-md shadow-sm">
          <Text style={{ color: themeColors.text.secondary }} className="text-base">
            Current Balance
          </Text>
          <Text style={{ color: themeColors.text.primary }} className="mb-6 text-4xl font-bold">
            {showBalance ? formatAmount(balance.total) : '********'}
          </Text>

          {/* Income & Expense Summary */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row flex-1 items-center">
              <View style={{ backgroundColor: theme === 'dark' ? '#22c55e20' : '#dcfce7' }} 
                className="justify-center items-center mr-3 w-9 h-9 rounded-full">
                <FontAwesome name="arrow-up" size={16} color="#22c55e" />
              </View>
              <View>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm mb-0.5">Income</Text>
                <Text className="text-lg font-semibold text-green-500">
                  {showBalance ? formatAmount(totalIncome) : '********'}
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: themeColors.border }} className="w-[1px] h-10 mx-4" />

            <View className="flex-row flex-1 items-center">
              <View style={{ backgroundColor: theme === 'dark' ? '#ef444420' : '#fee2e2' }}
                className="justify-center items-center mr-3 w-9 h-9 rounded-full">
                <FontAwesome name="arrow-down" size={16} color="#ef4444" />
              </View>
              <View>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm mb-0.5">Expenses</Text>
                <Text className="text-lg font-semibold text-red-500">
                  {showBalance ? formatAmount(totalExpenses) : '********'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* This Month Card */}
        <View style={{ backgroundColor: themeColors.card }} className="p-6 mb-4 rounded-md shadow-sm">
          <Text style={{ color: themeColors.text.primary }} className="mb-4 text-lg font-bold">
            This Month
          </Text>
          <View className="flex-row justify-between">
            <View style={{ backgroundColor: theme === 'dark' ? '#22c55e20' : '#dcfce7' }}
              className="flex-1 items-center p-3 rounded-lg">
              <Text style={{ color: themeColors.text.secondary }} className="text-sm">Income</Text>
              <Text className="mt-1 text-lg font-bold text-green-500">
                {showBalance ? formatAmount(thisMonthIncome) : '********'}
              </Text>
            </View>
            <View className="w-4" />
            <View style={{ backgroundColor: theme === 'dark' ? '#ef444420' : '#fee2e2' }}
              className="flex-1 items-center p-3 rounded-lg">
              <Text style={{ color: themeColors.text.secondary }} className="text-sm">Expenses</Text>
              <Text className="mt-1 text-lg font-bold text-red-500">
                {showBalance ? formatAmount(thisMonthExpenses) : '********'}
              </Text>
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
