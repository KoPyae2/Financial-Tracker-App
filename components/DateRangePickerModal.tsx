import { TouchableOpacity, View } from "react-native";

import { KeyboardAvoidingView, Modal, Platform, Text } from "react-native";

import { useStore } from "@/store/useStore";
import { themes } from "@/types/theme";

import { useState } from "react";
import { Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface DatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (range: { startDate: Date; endDate: Date }) => void;
    initialRange: { startDate: Date; endDate: Date };
}

export function DateRangePickerModal({ visible, onClose, onSave, initialRange }: DatePickerModalProps) {
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