import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, Alert, Pressable, Platform, KeyboardAvoidingView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useStore } from "@/store/useStore";
import { Transaction } from "@/types/transaction";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { HoldItem } from "react-native-hold-menu";
import { themes } from "@/types/theme";


type FilterPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (range: { startDate: Date; endDate: Date }) => void;
  initialRange: { startDate: Date; endDate: Date };
}

function DateRangePickerModal({ visible, onClose, onSave, initialRange }: DatePickerModalProps) {
  const [tempRange, setTempRange] = useState(initialRange);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const { theme } = useStore();
  const themeColors = themes[theme];

  const handleDateConfirm = (date: Date) => {
    if (selectingStartDate) {
      setTempRange(prev => ({ ...prev, startDate: date }));
      setSelectingStartDate(false);
      setShowPicker(false);
    } else {
      if (date < tempRange.startDate) {
        Alert.alert('Invalid Date', 'End date must be after start date');
        return;
      }
      setTempRange(prev => ({ ...prev, endDate: date }));
      setShowPicker(false);
      onSave({ startDate: tempRange.startDate, endDate: date });
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        
        <View className="flex-1 justify-end bg-black/50">
          <View style={{ backgroundColor: themeColors.card }} className="p-5 rounded-t-lg">
            <View className="flex-row justify-between items-center mb-5">
              <Text style={{ color: themeColors.text.primary }} className="text-lg font-semibold">
                Select Date Range
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 -mr-2"
              >
                <FontAwesome name="times" size={20} color={themeColors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 justify-between mb-5">
              <TouchableOpacity
                style={{ 
                  backgroundColor: selectingStartDate 
                    ? `${themeColors.text.accent}20` 
                    : themeColors.cardAlt 
                }}
                className="flex-1 p-3 rounded-lg"
                onPress={() => {
                  setSelectingStartDate(true);
                  setShowPicker(true);
                }}
              >
                <Text style={{ color: themeColors.text.secondary }} className="text-xs">
                  Start Date
                </Text>
                <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                  {tempRange.startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ 
                  backgroundColor: !selectingStartDate 
                    ? `${themeColors.text.accent}20` 
                    : themeColors.cardAlt 
                }}
                className="flex-1 p-3 rounded-lg"
                onPress={() => {
                  setSelectingStartDate(false);
                  setShowPicker(true);
                }}
              >
                <Text style={{ color: themeColors.text.secondary }} className="text-xs">
                  End Date
                </Text>
                <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                  {tempRange.endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={showPicker}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={() => setShowPicker(false)}
              maximumDate={new Date()}
              minimumDate={selectingStartDate ? undefined : tempRange.startDate}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

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

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range);
    setFilterPeriod('custom');
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const filteredTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDateRange = () => {
      switch (filterPeriod) {
        case 'today': {
          const start = new Date(today);
          const end = new Date(today);
          end.setHours(23, 59, 59, 999);
          return { start, end };
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
    };

    const { start, end } = getDateRange();

    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const matchesDate = transactionDate >= start && transactionDate <= end;
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(transaction.categoryId);
        return matchesDate && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterPeriod, dateRange, selectedCategories]);

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
            style={{ backgroundColor: selectedCategories.length === 0 
              ? '#ffffff40' 
              : themeColors.card }}
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
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
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
            renderItem={({ item }) => {
              const category = getCategoryById(item.categoryId);
              const isNoteExpanded = expandedNotes.has(item.id);

              const menuItems = [
                {
                  text: "Edit",
                  icon: "edit",
                  isDestructive: false,
                  onPress: () => handleEdit(item)
                },
                {
                  text: "Duplicate",
                  icon: "copy",
                  isDestructive: false,
                  onPress: () => {
                    const duplicateData = {
                      title: `${item.title} (Copy)`,
                      amount: item.amount,
                      type: item.type,
                      date: new Date().toISOString(),
                      categoryId: item.categoryId,
                      note: item.note,
                    };
                    addTransaction(duplicateData);
                  }
                },
                {
                  text: item.note ? "Edit Note" : "Add Note",
                  icon: "sticky-note",
                  isDestructive: false,
                  onPress: () => {
                    handleEdit(item);
                  }
                },
                {
                  text: "Change Category",
                  icon: "tag",
                  isDestructive: false,
                  onPress: () => {
                    handleEdit(item);
                  }
                },
                {
                  text: "Delete",
                  icon: "trash",
                  isDestructive: true,
                  onPress: () => {
                    Alert.alert(
                      'Delete Transaction',
                      'Are you sure you want to delete this transaction?',
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => deleteTransaction(item.id),
                        },
                      ]
                    );
                  }
                }
              ];

              return (
                <HoldItem
                  items={menuItems}
                  closeOnTap
                  hapticFeedback="Heavy"
                >
                  <View style={{ backgroundColor: themeColors.card }} 
                    className="p-4 mb-3 rounded-md shadow-sm">
                    <View className="flex-row">
                      <View 
                        className="w-[50px] h-[50px] rounded-full items-center justify-center"
                        style={{ backgroundColor: category?.color + '20' }}
                      >
                        <FontAwesome
                          name={category?.icon || 'question'}
                          size={20}
                          color={category?.color}
                        />
                      </View>
                      <View className="flex-1 ml-4">
                        <View className="flex-row justify-between items-center">
                          <Text style={{ color: themeColors.text.primary }} className="text-lg font-bold">
                            {item.title}
                          </Text>
                          <Text className={`text-lg font-semibold ${item.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
                          </Text>
                        </View>
                        <View className="flex-row items-center mt-2">
                          <View style={{ backgroundColor: theme === 'dark' ? `${category?.color}20` : themeColors.cardAlt }}
                            className="px-3 py-1 mr-2 rounded-md">
                            <Text className="text-sm font-medium" style={{ color: category?.color }}>
                              {category?.name || 'Uncategorized'}
                            </Text>
                          </View>
                          <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                        {item.note && (
                          <TouchableOpacity
                            onPress={() => {
                              setExpandedNotes(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(item.id)) {
                                  newSet.delete(item.id);
                                } else {
                                  newSet.add(item.id);
                                }
                                return newSet;
                              });
                            }}
                          >
                            <Text
                              style={{ color: themeColors.text.secondary }}
                              className="mt-2 text-sm"
                              numberOfLines={isNoteExpanded ? undefined : 2}
                            >
                              {item.note}
                            </Text>
                            {item.note.split('\n').length > 2 && (
                              <Text style={{ color: themeColors.text.accent }} className="mt-1 text-xs">
                                {isNoteExpanded ? 'Show less' : 'Show more'}
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </HoldItem>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
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
