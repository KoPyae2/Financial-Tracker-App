import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useStore } from "@/store/useStore";
import { FontAwesome } from "@expo/vector-icons";
import { themes } from "@/types/theme";

interface SetInitialAmountModalProps {
  visible: boolean;
  close: () => void;
}

export default function SetInitialAmountModal({
  visible,
  close,
}: SetInitialAmountModalProps) {
  const { setInitialBalance, theme } = useStore();
  const themeColors = themes[theme];
  const [initialAmount, setInitialAmount] = useState("");

  const handleSetInitialAmount = () => {
    const parsedAmount = parseFloat(initialAmount);
    if (!initialAmount || isNaN(parsedAmount)) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    setInitialBalance(parsedAmount);
    close();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View style={{ backgroundColor: themeColors.card }} className="rounded-t-3xl">
            <View className="p-6">
              <View className="mb-6">
                <Text style={{ color: themeColors.text.primary }} className="text-xl font-bold">
                  Welcome!
                </Text>
                <TouchableOpacity 
                  onPress={close}
                  className="absolute top-0 right-0"
                >
                  <FontAwesome name="times" size={24} color={themeColors.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={{ color: themeColors.text.secondary }} className="mb-6 text-base">
                To get started, please set your current account balance. This will help us track your expenses and income accurately.
              </Text>

              <TextInput
                style={{ 
                  backgroundColor: themeColors.cardAlt,
                  color: themeColors.text.primary
                }}
                className="px-4 py-3 mb-6 text-base rounded-lg"
                placeholder="Enter current balance"
                placeholderTextColor={themeColors.text.secondary}
                value={initialAmount}
                onChangeText={setInitialAmount}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity
                style={{ backgroundColor: themeColors.text.accent }}
                className="py-4 rounded-lg"
                onPress={handleSetInitialAmount}
              >
                <Text className="text-lg font-semibold text-center text-white">
                  Set Initial Balance
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

