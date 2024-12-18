import { 
    View, 
    TouchableOpacity, 
    Text, 
    Alert, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView,
    TextInput 
  } from 'react-native';
  import { useState } from 'react';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useStore } from '@/store/useStore';
  import { FontAwesome } from '@expo/vector-icons';
  
  interface FeatureItemProps {
    icon: keyof typeof FontAwesome.glyphMap;
    title: string;
    description: string;
  }
  
  const FeatureItem = ({ icon, title, description }: FeatureItemProps) => {
    return (
      <View className="flex-row gap-4 items-center p-4 space-x-4 rounded-lg bg-slate-50">
        <View className="justify-center items-center w-10 h-10 bg-blue-100 rounded-full">
          <FontAwesome name={icon} size={20} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-800">{title}</Text>
          <Text className="text-sm text-slate-500">{description}</Text>
        </View>
      </View>
    );
  };
  
  export default function GetStartedPage() {
    const [initialAmount, setInitialAmount] = useState('');
    const { setInitialBalance } = useStore();
  
    const handleSetInitialBalance = () => {
      const amount = parseFloat(initialAmount);
      if (!initialAmount || isNaN(amount)) {
        Alert.alert('Invalid Amount', 'Please enter a valid number');
        return;
      }
      setInitialBalance(amount);
    };
  
    return (
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-6 pt-12 pb-6">
              {/* Header Section */}
              <View className="items-center mb-12">
                <View className="justify-center items-center mb-6 w-20 h-20 bg-blue-500 rounded-full">
                  <FontAwesome name="balance-scale" size={40} color="white" />
                </View>
                <Text className="mb-2 text-3xl font-bold text-center text-slate-800">
                  Welcome to Financial Tracker
                </Text>
                <Text className="px-6 text-base text-center text-slate-500">
                  Take control of your finances with easy tracking and smart insights
                </Text>
              </View>
  
              {/* Amount Input Section */}
              <View className="mb-8 space-y-6">
                <Text className="mb-2 text-lg font-semibold text-slate-700">
                  What's your current balance?
                </Text>
                
                <View className="relative">
                  <View className="absolute top-0 bottom-0 left-4 justify-center">
                    <Text className="text-lg text-slate-600">$</Text>
                  </View>
                  <TextInput
                    className="px-10 py-4 text-lg rounded-md border bg-slate-50 border-slate-200"
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={initialAmount}
                    onChangeText={setInitialAmount}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
  
              {/* Features Section */}
              <View className="mb-8 space-y-4">
                <FeatureItem 
                  icon="pie-chart"
                  title="Track Expenses"
                  description="Monitor your spending patterns"
                />
                <FeatureItem 
                  icon="line-chart"
                  title="View Analytics"
                  description="Get insights about your finances"
                />
                <FeatureItem 
                  icon="tags"
                  title="Categorize"
                  description="Organize transactions by category"
                />
              </View>
  
              {/* Get Started Button */}
              <TouchableOpacity
                className="py-4 bg-blue-600 rounded-md shadow-lg shadow-blue-600/30"
                onPress={handleSetInitialBalance}
              >
                <Text className="text-lg font-semibold text-center text-white">
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  } 