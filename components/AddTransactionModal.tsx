import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { Transaction } from '@/types/transaction';
import { AddCategoryModal } from './AddCategoryModal';
import { themes } from '@/types/theme';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  editTransaction?: Transaction;
}

interface FormErrors {
  title?: string;
  amount?: string;
  category?: string;
}

export function AddTransactionModal({ visible, onClose, editTransaction }: AddTransactionModalProps) {
  const { categories, addTransaction, updateTransaction,theme } = useStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const categoryRef = useRef<ScrollView>(null);
  const themeColors = themes[theme];

  useEffect(() => {
    if (visible) {
      if (editTransaction) {
        setTitle(editTransaction.title);
        setAmount(editTransaction.amount.toString());
        setType(editTransaction.type);
        setCategoryId(editTransaction.categoryId);
        setNote(editTransaction.note || '');
      }
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategoryId('');
      setNote('');
    }
  }, [visible, editTransaction]);

  useEffect(() => {
    const currentCategory = categories.find(cat => cat.id === categoryId);
    if (currentCategory && currentCategory.isIncome !== (type === 'income')) {
      setCategoryId('');
    }
    categoryRef.current?.scrollTo({ x: 0, animated: true });
  }, [type]);


  const filteredCategories = categories.filter(cat => cat.isIncome === (type === 'income'));

  const handleSubmit = () => {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!amount || isNaN(Number(amount))) newErrors.amount = 'Valid amount is required';
    if (!categoryId) newErrors.category = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const transactionData = {
      title: title.trim(),
      amount: Number(amount),
      type,
      date: new Date().toISOString(),
      categoryId,
      note: note.trim(),
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    onClose();
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
          <View className="rounded-t-3xl" style={{ backgroundColor: themeColors.card }}>
            <ScrollView>
              <View className="p-6">
                <View className="flex-row justify-between items-center mb-6">
                  <Text style={{ color: themeColors.text.primary }} className="text-xl font-bold">
                    {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
                  </Text>
                  <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                    <FontAwesome name="times" size={24} color={themeColors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Transaction Type */}
                <View className="mb-6">
                  <Text style={{ color: themeColors.text.secondary }} className="mb-2 text-base font-medium">
                    Type
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      style={{ 
                        backgroundColor: type === 'expense' 
                          ? themeColors.text.accent 
                          : themeColors.cardAlt 
                      }}
                      className="flex-1 py-3 rounded-xl"
                      onPress={() => setType('expense')}
                    >
                      <Text style={{ 
                        color: type === 'expense' 
                          ? '#ffffff' 
                          : themeColors.text.secondary 
                      }} className="font-medium text-center">
                        Expense
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ 
                        backgroundColor: type === 'income' 
                          ? themeColors.text.accent 
                          : themeColors.cardAlt 
                      }}
                      className="flex-1 py-3 rounded-xl"
                      onPress={() => setType('income')}
                    >
                      <Text style={{ 
                        color: type === 'income' 
                          ? '#ffffff' 
                          : themeColors.text.secondary 
                      }} className="font-medium text-center">
                        Income
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Title Input */}
                <View className="mb-4">
                  <Text style={{ color: themeColors.text.secondary }} className="mb-2 text-base font-medium">
                    Title *
                  </Text>
                  <TextInput
                    style={{ 
                      backgroundColor: themeColors.cardAlt,
                      color: themeColors.text.primary,
                      borderColor: errors.title ? '#ef4444' : 'transparent'
                    }}
                    className="px-4 py-3 text-base rounded-xl border"
                    value={title}
                    onChangeText={(text) => {
                      setTitle(text);
                      setErrors(prev => ({ ...prev, title: undefined }));
                    }}
                    placeholder="Enter title"
                    placeholderTextColor={themeColors.text.secondary}
                  />
                  {errors.title && (
                    <Text className="mt-1 text-sm text-red-500">{errors.title}</Text>
                  )}
                </View>

                {/* Amount Input */}
                <View className="mb-4">
                  <Text style={{ color: themeColors.text.secondary }} className="mb-2 text-base font-medium">
                    Amount *
                  </Text>
                  <TextInput
                    style={{ 
                      backgroundColor: themeColors.cardAlt,
                      color: themeColors.text.primary,
                      borderColor: errors.amount ? '#ef4444' : 'transparent'
                    }}
                    className="px-4 py-3 text-base rounded-xl border"
                    value={amount}
                    onChangeText={(text) => {
                      setAmount(text);
                      setErrors(prev => ({ ...prev, amount: undefined }));
                    }}
                    placeholder="Enter amount"
                    keyboardType="decimal-pad"
                    placeholderTextColor={themeColors.text.secondary}
                  />
                  {errors.amount && (
                    <Text className="mt-1 text-sm text-red-500">{errors.amount}</Text>
                  )}
                </View>

                {/* Category Selection */}
                <View className="mb-4">
                  <Text style={{ color: themeColors.text.secondary }} className="mb-2 text-base font-medium">
                    Category *
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    ref={categoryRef}
                    className="px-6 py-2 -mx-6"
                    style={{ 
                      borderColor: errors.category ? '#ef4444' : 'transparent',
                      borderWidth: errors.category ? 1 : 0,
                      borderRadius: 12
                    }}
                  >
                    {filteredCategories.length > 0 ? (
                      <ScrollView horizontal className="flex-row">
                        {filteredCategories.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={{ 
                              backgroundColor: categoryId === category.id 
                                ? themeColors.text.accent 
                                : themeColors.cardAlt 
                            }}
                            className="items-center p-3 mr-4 rounded-xl"
                            onPress={() => {
                              setCategoryId(category.id);
                              setErrors(prev => ({ ...prev, category: undefined }));
                            }}
                          >
                            <View 
                              className="justify-center items-center mb-1 w-12 h-12 rounded-full"
                              style={{ 
                                backgroundColor: categoryId === category.id 
                                  ? '#ffffff40' 
                                  : category.color + '20' 
                              }}
                            >
                              <FontAwesome
                                name={category.icon}
                                size={24}
                                color={categoryId === category.id ? '#fff' : category.color}
                              />
                            </View>
                            <Text style={{ 
                              color: categoryId === category.id 
                                ? '#ffffff' 
                                : themeColors.text.primary 
                            }} className="text-sm font-medium">
                              {category.name}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        {/* Add Category Button */}
                        <TouchableOpacity
                          style={{ backgroundColor: themeColors.cardAlt,marginRight: 40 }}
                          className="items-center p-3 mr-4 rounded-xl"
                          onPress={() => setShowCategoryModal(true)}
                        >
                          <View style={{ backgroundColor: themeColors.border }}
                            className="justify-center items-center mb-1 w-12 h-12 rounded-full">
                            <FontAwesome
                              name="plus"
                              size={24}
                              color={themeColors.text.secondary}
                            />
                          </View>
                          <Text style={{ color: themeColors.text.secondary }} 
                            className="text-sm font-medium">
                            Add New
                          </Text>
                        </TouchableOpacity>
                      </ScrollView>
                    ) : (
                      <View className="flex-row items-center py-4">
                        <Text style={{ color: themeColors.text.secondary }} className="mr-2">
                          No categories available for {type}.
                        </Text>
                        <TouchableOpacity
                          style={{ backgroundColor: themeColors.text.accent }}
                          className="px-3 py-1 rounded-full"
                          onPress={() => setShowCategoryModal(true)}
                        >
                          <Text className="font-medium text-white">Add Category</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                  {errors.category && (
                    <Text className="mt-1 text-sm text-red-500">{errors.category}</Text>
                  )}
                </View>

                {/* Note Input */}
                <View className="mb-6">
                  <Text style={{ color: themeColors.text.secondary }} className="mb-2 text-base font-medium">
                    Note (Optional)
                  </Text>
                  <TextInput
                    style={{ 
                      backgroundColor: themeColors.cardAlt,
                      color: themeColors.text.primary
                    }}
                    className="px-4 py-3 max-h-32 text-base rounded-xl"
                    value={note}
                    onChangeText={setNote}
                    placeholder="Add a note"
                    multiline
                    textAlignVertical="top"
                    numberOfLines={4}
                    placeholderTextColor={themeColors.text.secondary}
                  />
                </View>

                {/* Submit Button */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    style={{ backgroundColor: themeColors.cardAlt }}
                    className="flex-1 py-4 rounded-xl"
                    onPress={onClose}
                  >
                    <Text style={{ color: themeColors.text.secondary }} 
                      className="font-semibold text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: themeColors.text.accent }}
                    className="flex-1 py-4 rounded-xl"
                    onPress={handleSubmit}
                  >
                    <Text className="font-semibold text-center text-white">
                      {editTransaction ? 'Update' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      <AddCategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        initialType={type === 'income'}
      />
    </Modal>
  );
} 