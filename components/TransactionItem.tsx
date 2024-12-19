import { FontAwesome } from '@expo/vector-icons';
import React, { useState, memo } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { HoldItem } from 'react-native-hold-menu';
import { Transaction } from '@/types/transaction';
import { Category } from '@/types/category';

interface TransactionItemProps {
  item: Transaction;
  category: Category | undefined;
  onEdit: (item: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: Transaction) => void;
  showBalance: boolean;
  formatAmount: (amount: number) => string;
  themeColors: any;
  theme: string;
}

const TransactionItem = memo(({
  item,
  category,
  onEdit,
  onDelete,
  onDuplicate,
  showBalance,
  formatAmount,
  themeColors,
  theme
}: TransactionItemProps) => {
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  const menuItems = [
    {
      text: 'Edit',
      icon: 'edit',
      isDestructive: false,
      onPress: () => onEdit(item),
    },
    {
      text: 'Duplicate',
      icon: 'copy',
      isDestructive: false,
      onPress: () => onDuplicate(item),
    },
    {
      text: item.note ? 'Edit Note' : 'Add Note',
      icon: 'sticky-note',
      isDestructive: false,
      onPress: () => onEdit(item),
    },
    {
      text: 'Delete',
      icon: 'trash',
      isDestructive: true,
      onPress: handleDelete,
    },
  ];

  return (
    <HoldItem items={menuItems} closeOnTap hapticFeedback="Heavy">
      <View
        style={{ backgroundColor: themeColors.card }}
        className="p-4 mb-3 rounded-md shadow-sm"
      >
        <View className="flex-row">
          {/* Category Icon */}
          <View
            className="w-[50px] h-[50px] rounded-full items-center justify-center"
            style={{ backgroundColor: `${category?.color}20` }}
          >
            <FontAwesome
              name={category?.icon || 'question'}
              size={20}
              color={category?.color}
            />
          </View>

          {/* Transaction Details */}
          <View className="flex-1 ml-4">
            {/* Title and Amount */}
            <View className="flex-row justify-between items-center">
              <Text
                style={{ color: themeColors.text.primary }}
                className="text-lg font-bold"
              >
                {item.title}
              </Text>
              <Text
                className={`text-lg font-semibold ${
                  item.type === 'income' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
              </Text>
            </View>

            {/* Category and Date */}
            <View className="flex-row items-center mt-2">
              <View
                style={{
                  backgroundColor:
                    theme === 'dark' ? `${category?.color}20` : themeColors.cardAlt,
                }}
                className="px-3 py-1 mr-2 rounded-md"
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: category?.color }}
                >
                  {category?.name || 'Uncategorized'}
                </Text>
              </View>
              <Text
                style={{ color: themeColors.text.secondary }}
                className="text-sm"
              >
                {new Date(item.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {/* Note Section */}
            {item.note && (
              <TouchableOpacity
                onPress={() => setIsNoteExpanded((prev) => !prev)}
              >
                <Text
                  style={{ color: themeColors.text.secondary }}
                  className="mt-2 text-sm"
                  numberOfLines={isNoteExpanded ? undefined : 2}
                >
                  {item.note}
                </Text>
                {item.note.split('\n').length > 2 && (
                  <Text
                    style={{ color: themeColors.text.accent }}
                    className="mt-1 text-xs"
                  >
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
});

export default TransactionItem;
