import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { themes } from '@/types/theme';
import { useMemo } from 'react';
import { Stack } from 'expo-router';

type FilterPeriod = 'today' | 'week' | 'month' | 'custom';

export default function CategoryTransactions() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { transactions, categories, showBalance, formatAmount, theme } = useStore();
  const themeColors = themes[theme];

  console.log('Params:', params);

  const categoryId = params.categoryId as string;
  const filterPeriod = params.filterPeriod as FilterPeriod;

  const category = categories.find(c => c.id === categoryId);

  const categoryTransactions = useMemo(() => {
    console.log('Initial transactions count:', transactions.length);
    let filtered = transactions.filter(t => t.categoryId === categoryId);
    console.log('After category filter:', filtered.length);

    // Apply date filtering
    if (filterPeriod) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const txDate = new Date(
          transactionDate.getFullYear(),
          transactionDate.getMonth(),
          transactionDate.getDate()
        );

        switch (filterPeriod) {
          case 'today': {
            return txDate.getTime() === today.getTime();
          }
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return txDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return txDate >= monthAgo;
          }
          case 'custom': {
            if (params.startDate && params.endDate) {
              const start = new Date(params.startDate as string);
              const end = new Date(params.endDate as string);
              start.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59, 999);
              return txDate >= start && txDate <= end;
            }
            return true;
          }
          default:
            return true;
        }
      });
    }

    console.log('Final filtered count:', filtered.length);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, categoryId, filterPeriod, params.startDate, params.endDate]);

  // Calculate total for the filtered transactions
  const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

  if (!category) return null;

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <View style={{ backgroundColor: themeColors.background }} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b" style={{ borderBottomColor: themeColors.border }}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
          >
            <FontAwesome name="arrow-left" size={24} color={themeColors.text.primary} />
          </TouchableOpacity>
          <View className="flex-row flex-1 items-center">
            <View
              style={{ backgroundColor: `${category.color}20` }}
              className="justify-center items-center mr-3 w-8 h-8 rounded-full"
            >
              <FontAwesome name={category.icon as any} size={16} color={category.color} />
            </View>
            <View>
              <Text style={{ color: themeColors.text.primary }} className="text-xl font-semibold">
                {category.name}
              </Text>
              <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                {categoryTransactions.length} transaction{categoryTransactions.length !== 1 ? 's' : ''} • {showBalance ? formatAmount(totalAmount) : '****'}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions List */}
        <ScrollView className="flex-1">
          {categoryTransactions.length > 0 ? (
            categoryTransactions.map(transaction => (
              <View
                key={transaction.id}
                style={{ backgroundColor: themeColors.cardAlt }}
                className="flex-row justify-between items-center p-4 mx-4 mt-4 rounded-xl"
              >
                <View>
                  <Text style={{ color: themeColors.text.primary }} className="font-medium">
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                  <Text style={{ color: themeColors.text.secondary }} className="mt-1 text-sm">
                    {transaction.note || 'No note'}
                  </Text>
                </View>
                <Text 
                  style={{ color: themeColors.text.primary }} 
                  className="text-lg font-bold"
                >
                  {showBalance ? formatAmount(transaction.amount) : '****'}
                </Text>
              </View>
            ))
          ) : (
            <View className="flex-1 justify-center items-center p-8">
              <Text style={{ color: themeColors.text.secondary }} className="text-center">
                No transactions found for this period
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
} 