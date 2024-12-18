import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { themes } from '@/types/theme';

const ICON_OPTIONS = [
  'cutlery', 'shopping-cart', 'car', 'film', 'file-text-o',
  'fire', 'medkit', 'money', 'coffee', 'glass', 'home',
  'plane', 'gift', 'gamepad', 'book', 'venus-mars',
] as const;

const COLOR_OPTIONS = [
  '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#f43f5e',
  '#64748b', '#22c55e', '#eab308', '#3b82f6', '#a855f7',
];

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  initialType?: boolean;
}

interface FormErrors {
  name?: string;
  icon?: string;
  color?: string;
}

export function AddCategoryModal({ visible, onClose, initialType = false }: AddCategoryModalProps) {
  const { addCategory, theme } = useStore();
  const themeColors = themes[theme];
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<typeof ICON_OPTIONS[number] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isIncome, setIsIncome] = useState(initialType);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (visible) {
      setIsIncome(initialType);
    } else {
      setName('');
      setSelectedIcon(null);
      setSelectedColor(null);
      setErrors({});
    }
  }, [visible, initialType]);

  const handleSubmit = () => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!selectedIcon) newErrors.icon = 'Icon is required';
    if (!selectedColor) newErrors.color = 'Color is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addCategory({
      name: name.trim(),
      icon: selectedIcon as typeof ICON_OPTIONS[number],
      color: selectedColor!,
      isIncome,
      amount: 0,
      count: 0
    });

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
          <View style={{ backgroundColor: themeColors.card }} className="rounded-t-3xl">
            <ScrollView>
              <View className="p-6">
                <View className="flex-row justify-between items-center mb-6">
                  <Text style={{ color: themeColors.text.primary }} className="text-xl font-bold">
                    Add Category
                  </Text>
                  <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                    <FontAwesome name="times" size={24} color={themeColors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Category Type */}
                <View className="mb-6">
                  <Text style={{ color: themeColors.text.primary }} className="mb-2 text-base font-medium">
                    Type
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      style={{ 
                        backgroundColor: !isIncome 
                          ? themeColors.text.accent 
                          : themeColors.cardAlt 
                      }}
                      className="flex-1 py-3 rounded-lg"
                      onPress={() => setIsIncome(false)}
                    >
                      <Text style={{ 
                        color: !isIncome ? '#ffffff' : themeColors.text.secondary 
                      }} className="font-medium text-center">
                        Expense
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ 
                        backgroundColor: isIncome 
                          ? themeColors.text.accent 
                          : themeColors.cardAlt 
                      }}
                      className="flex-1 py-3 rounded-lg"
                      onPress={() => setIsIncome(true)}
                    >
                      <Text style={{ 
                        color: isIncome ? '#ffffff' : themeColors.text.secondary 
                      }} className="font-medium text-center">
                        Income
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Name Input */}
                <View className="mb-6">
                  <Text style={{ color: themeColors.text.primary }} className="mb-2 text-base font-medium">
                    Name *
                  </Text>
                  <TextInput
                    style={{ 
                      backgroundColor: themeColors.cardAlt,
                      color: themeColors.text.primary,
                      borderColor: errors.name ? '#ef4444' : 'transparent'
                    }}
                    className="px-4 py-3 text-base rounded-lg border"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Enter category name"
                    placeholderTextColor={themeColors.text.secondary}
                  />
                  {errors.name && (
                    <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>
                  )}
                </View>

                {/* Icon Selection */}
                <View className="mb-6">
                  <Text style={{ color: themeColors.text.primary }} className="mb-2 text-base font-medium">
                    Icon *
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className={`-mx-6 px-6 ${errors.icon ? 'border border-red-500 rounded-lg' : ''}`}
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <TouchableOpacity
                        key={icon}
                        style={{ 
                          backgroundColor: selectedIcon === icon 
                            ? themeColors.text.accent 
                            : themeColors.cardAlt 
                        }}
                        className="items-center p-3 mr-4 rounded-lg"
                        onPress={() => {
                          setSelectedIcon(icon);
                          setErrors(prev => ({ ...prev, icon: undefined }));
                        }}
                      >
                        <FontAwesome
                          name={icon}
                          size={24}
                          color={selectedIcon === icon ? '#fff' : themeColors.text.secondary}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {errors.icon && (
                    <Text className="mt-1 text-sm text-red-500">{errors.icon}</Text>
                  )}
                </View>

                {/* Color Selection */}
                <View className="mb-6">
                  <Text style={{ color: themeColors.text.primary }} className="mb-2 text-base font-medium">
                    Color *
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className={`-mx-6 px-6 ${errors.color ? 'border border-red-500 rounded-lg' : ''}`}
                  >
                    {COLOR_OPTIONS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={{ 
                          borderColor: selectedColor === color 
                            ? themeColors.text.accent 
                            : 'transparent' 
                        }}
                        className="p-1 mr-4 rounded-full border-2"
                        onPress={() => {
                          setSelectedColor(color);
                          setErrors(prev => ({ ...prev, color: undefined }));
                        }}
                      >
                        <View
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {errors.color && (
                    <Text className="mt-1 text-sm text-red-500">{errors.color}</Text>
                  )}
                </View>

                {/* Submit Buttons */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    style={{ backgroundColor: themeColors.cardAlt }}
                    className="flex-1 py-4 rounded-lg"
                    onPress={onClose}
                  >
                    <Text style={{ color: themeColors.text.secondary }} className="font-semibold text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: themeColors.text.accent }}
                    className="flex-1 py-4 rounded-lg"
                    onPress={handleSubmit}
                  >
                    <Text className="font-semibold text-center text-white">
                      Add Category
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    borderRadius: 8,
  },
  typeOptionActive: {
    backgroundColor: '#f1f5f9',
  },
  typeText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#1e293b',
  },
  switch: {
    marginHorizontal: 16,
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedIcon: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedColor: {
    borderColor: '#2563eb',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
    marginTop: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  containerError: {
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
  },
  switchContainer: {
    marginBottom: 20,
  },
  iconContainer: {
    marginVertical: 8,
    padding: 4,
  },
  colorContainer: {
    marginVertical: 8,
    padding: 4,
  },
}); 