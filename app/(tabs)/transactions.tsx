import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useState, useMemo, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Transaction } from "@/types/transaction";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { themes } from "@/types/theme";
import { DateRangePickerModal } from "@/components/DateRangePickerModal";
import TransactionItem from "@/components/TransactionItem";


type FilterPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

export default function Transactions() {
  const {
    transactions,
    categories,
    loading,
    deleteTransaction,
    updateTransaction,
    addTransaction,
    showBalance,
    formatAmount,
    theme
  } = useStore();

  const themeColors = themes[theme];

  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 15;
  const INITIAL_RENDER_COUNT = 10;
  const RENDER_BATCH_SIZE = 5;
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    try {
      // Your existing data loading logic
    } catch (error) {
      console.error('Error loading transactions:', error);
      setHasError(true);
    }
  }, []);

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range);
    setFilterPeriod('custom');
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const calculatedDateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filterPeriod) {
      case 'today': {
        const end = new Date(today);
        end.setHours(23, 59, 59, 999);
        return { start: today, end };
      }
      case 'week': {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);

        const end = new Date(today);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setHours(0, 0, 0, 0);

        const end = new Date(today);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'year': {
        const start = new Date(today.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);

        const end = new Date(today);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'custom': {
        const start = new Date(dateRange.startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
    }
  }, [filterPeriod, dateRange]);

  const categoryFilteredTransactions = useMemo(() => {
    if (selectedCategories.length === 0) return transactions;
    return transactions.filter(t => selectedCategories.includes(t.categoryId));
  }, [transactions, selectedCategories]);

  const filteredTransactions = useMemo(() => {
    const { start, end } = calculatedDateRange;
    const startTime = start.getTime();
    const endTime = end.getTime();

    return categoryFilteredTransactions
      .filter(transaction => {
        const transactionTime = new Date(transaction.date).getTime();
        return transactionTime >= startTime && transactionTime <= endTime;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [categoryFilteredTransactions, calculatedDateRange]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, page]);

  const totalFilteredIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const FilterHeader = () => (
    <View style={{ backgroundColor: themeColors.card }} className="px-3 py-3 -mx-4 mb-4 border-b" >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={{
            backgroundColor: filterPeriod === 'today'
              ? themeColors.text.accent
              : themeColors.cardAlt
          }}
          className={`px-4 py-2 mr-2 rounded-full`}
          onPress={() => setFilterPeriod('today')}
        >
          <Text style={{
            color: filterPeriod === 'today'
              ? '#ffffff'
              : themeColors.text.secondary
          }} className="text-sm font-medium">
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: filterPeriod === 'week'
              ? themeColors.text.accent
              : themeColors.cardAlt
          }}
          className={`px-4 py-2 mr-2 rounded-full`}
          onPress={() => setFilterPeriod('week')}
        >
          <Text style={{
            color: filterPeriod === 'week'
              ? '#ffffff'
              : themeColors.text.secondary
          }} className="text-sm font-medium">
            This Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: filterPeriod === 'month'
              ? themeColors.text.accent
              : themeColors.cardAlt
          }}
          className={`px-4 py-2 mr-2 rounded-full`}
          onPress={() => setFilterPeriod('month')}
        >
          <Text style={{
            color: filterPeriod === 'month'
              ? '#ffffff'
              : themeColors.text.secondary
          }} className="text-sm font-medium">
            This Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: filterPeriod === 'year'
              ? themeColors.text.accent
              : themeColors.cardAlt
          }}
          className={`px-4 py-2 mr-2 rounded-full`}
          onPress={() => setFilterPeriod('year')}
        >
          <Text style={{
            color: filterPeriod === 'year'
              ? '#ffffff'
              : themeColors.text.secondary
          }} className="text-sm font-medium">
            This Year
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: filterPeriod === 'custom'
              ? themeColors.text.accent
              : themeColors.cardAlt
          }}
          className={`flex-row gap-2 items-center px-4 py-2 mr-2 rounded-full`}
          onPress={() => setDatePickerVisible(true)}
        >
          <FontAwesome
            name="calendar"
            size={16}
            color={filterPeriod === 'custom' ? '#fff' : themeColors.text.secondary}
          />
          <Text style={{
            color: filterPeriod === 'custom'
              ? '#ffffff'
              : themeColors.text.secondary
          }} className="text-sm font-medium">
            {filterPeriod === 'custom'
              ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
              : 'Select Range'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
      >
        <TouchableOpacity
          style={{
            backgroundColor: selectedCategories.length === 0
              ? themeColors.text.accent
              : themeColors.cardAlt
          }}
          className={`flex-row items-center px-3 py-2 mr-2 rounded-full`}
          onPress={() => setSelectedCategories([])}
        >
          <View
            style={{
              backgroundColor: selectedCategories.length === 0
                ? '#ffffff40'
                : themeColors.card
            }}
            className="justify-center items-center mr-2 w-6 h-6 rounded-full"
          >
            <FontAwesome
              name="list"
              size={12}
              color={selectedCategories.length === 0 ? '#fff' : themeColors.text.secondary}
            />
          </View>
          <Text style={{
            color: selectedCategories.length === 0
              ? '#ffffff'
              : themeColors.text.secondary
          }} className="text-sm font-medium">
            All
          </Text>
        </TouchableOpacity>

        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            className={`flex-row items-center px-3 py-2 mr-2 rounded-full`}
            style={{
              backgroundColor: selectedCategories.includes(category.id)
                ? category.color
                : themeColors.cardAlt
            }}
            onPress={() => {
              setSelectedCategories(prev => {
                if (prev.includes(category.id)) {
                  const newSelection = prev.filter(id => id !== category.id);
                  return newSelection;
                }
                return [...prev, category.id];
              });
            }}
          >
            <View
              className="justify-center items-center mr-2 w-6 h-6 rounded-full"
              style={{
                backgroundColor: selectedCategories.includes(category.id)
                  ? '#ffffff40'
                  : category.color + '20'
              }}
            >
              <FontAwesome
                name={category.icon}
                size={12}
                color={selectedCategories.includes(category.id) ? '#fff' : category.color}
              />
            </View>
            <Text className={`text-sm font-medium ${selectedCategories.includes(category.id) ? 'text-white' : 'text-slate-400'
              }`}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const TransactionSummary = () => (
    <View style={{ backgroundColor: themeColors.card }} className="p-4 mb-4 rounded-md shadow-sm">
      <View className="flex-row justify-between mb-4">
        <View style={{ backgroundColor: theme === 'dark' ? '#22c55e20' : '#dcfce7' }}
          className="flex-1 p-3 mr-2 rounded-lg">
          <Text style={{ color: themeColors.text.secondary }} className="text-sm">Income</Text>
          <Text className="text-lg font-bold text-green-500">
            {showBalance ? formatAmount(totalFilteredIncome) : '********'}
          </Text>
        </View>
        <View style={{ backgroundColor: theme === 'dark' ? '#ef444420' : '#fee2e2' }}
          className="flex-1 p-3 ml-2 rounded-lg">
          <Text style={{ color: themeColors.text.secondary }} className="text-sm">Expenses</Text>
          <Text className="text-lg font-bold text-red-500">
            {showBalance ? formatAmount(totalFilteredExpenses) : '********'}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <View style={{ backgroundColor: themeColors.cardAlt }}
          className="overflow-hidden flex-1 h-2 rounded-full">
          <View
            style={{
              backgroundColor: themeColors.text.accent,
              width: `${(totalFilteredExpenses / (totalFilteredIncome || 1)) * 100}%`
            }}
            className="h-full"
          />
        </View>
        <Text style={{ color: themeColors.text.secondary }} className="ml-3 text-sm">
          {((totalFilteredExpenses / (totalFilteredIncome || 1)) * 100).toFixed(1)}% spent
        </Text>
      </View>
    </View>
  );

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsAddModalVisible(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
    setIsAddModalVisible(false);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || paginatedTransactions.length >= filteredTransactions.length) return;

    setIsLoadingMore(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow UI to breathe
      setPage(prev => prev + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 200); // Show button when scrolled down 200px
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  if (hasError) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="mb-2 text-red-500">Error loading transactions</Text>
        <TouchableOpacity
          className="px-4 py-2 bg-blue-500 rounded"
          onPress={() => window.location.reload()}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ backgroundColor: themeColors.background }} className="flex-1 p-4">
        <Text style={{ color: themeColors.text.secondary }}
          className="mt-6 text-base text-center">
          Loading transactions...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View
        style={{ backgroundColor: themeColors.background }}
        className="flex-1 p-4 pt-0"
        onTouchStart={() => selectedTransaction && setSelectedTransaction(null)}
      >
        <FilterHeader />
        <TransactionSummary />

        {filteredTransactions.length === 0 ? (
          <View className="flex-1 justify-center items-center p-6">
            <View className="items-center">
              <FontAwesome name="list-alt" size={48} color={themeColors.text.secondary} />
              <Text style={{ color: themeColors.text.secondary }}
                className="mt-4 text-base font-medium">
                No transactions in selected period
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: themeColors.text.accent }}
                className="px-6 py-3 mt-4 rounded-lg"
                onPress={handleAddNew}
              >
                <Text className="font-medium text-white">Add Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={paginatedTransactions}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            maxToRenderPerBatch={RENDER_BATCH_SIZE}
            windowSize={5}
            removeClippedSubviews={true}
            initialNumToRender={INITIAL_RENDER_COUNT}
            updateCellsBatchingPeriod={50}
            onEndReachedThreshold={0.5}
            onEndReached={handleLoadMore}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <TransactionItem
                item={item}
                category={getCategoryById(item.categoryId)}
                onEdit={handleEdit}
                onDelete={deleteTransaction}
                onDuplicate={(item) => {
                  const duplicateData = {
                    title: `${item.title} (Copy)`,
                    amount: item.amount,
                    type: item.type,
                    date: new Date().toISOString(),
                    categoryId: item.categoryId,
                    note: item.note,
                  };
                  addTransaction(duplicateData);
                }}
                showBalance={showBalance}
                formatAmount={formatAmount}
                themeColors={themeColors}
                theme={theme}
              />
            )}
            getItemLayout={(data, index) => ({
              length: 100,
              offset: 100 * index,
              index,
            })}
            ListHeaderComponent={() => (
              <View className="flex-row justify-between items-center px-2 mb-2">
                <Text style={{ color: themeColors.text.secondary }}
                  className="text-sm font-medium">
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </Text>
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={handleAddNew}
                >
                  <FontAwesome name="plus" size={14} color={themeColors.text.accent} />
                  <Text style={{ color: themeColors.text.accent }}
                    className="ml-1 text-sm font-medium">
                    Add New
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={() => (
              isLoadingMore ? (
                <View className="py-4">
                  <Text style={{ color: themeColors.text.secondary }} className="text-center">
                    Loading more...
                  </Text>
                </View>
              ) : null
            )}
          />
        )}

        <AddTransactionModal
          visible={isAddModalVisible}
          onClose={handleCloseModal}
          editTransaction={editingTransaction || undefined}
        />

        <DateRangePickerModal
          visible={datePickerVisible}
          onClose={() => setDatePickerVisible(false)}
          onSave={handleDateRangeChange}
          initialRange={dateRange}
        />

        {showScrollTop && (
          <TouchableOpacity
            onPress={scrollToTop}
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              backgroundColor: themeColors.text.accent,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <FontAwesome name="arrow-up" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontSize: 16,
  },
});
