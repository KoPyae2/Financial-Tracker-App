import { View, Text, TouchableOpacity, Alert, Share, Switch, ScrollView, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useStore } from '@/store/useStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATEGORIES } from '@/types/category';
import * as LocalAuthentication from 'expo-local-authentication';
import { useState, useEffect } from 'react';
import { CURRENCIES } from '@/types/currency';
import { themes } from '@/types/theme';
import { mockTransactions, mockCategories } from "@/data/mockTransactions";

const isDevelopment = process.env.NODE_ENV === 'development';

export default function Settings() {
  const { 
    transactions, 
    categories, 
    balance, 
    importData,
    showBalance,
    toggleBalanceVisibility,
    currency = 'USD',
    setCurrency,
    theme = 'light',
    setTheme,
    notificationsEnabled = true,
    toggleNotifications,
    isBiometricEnabled,
    toggleBiometric,
    addTransaction,
    addCategory,
  } = useStore();

  const [isCompatible, setIsCompatible] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const themeColors = themes[theme];

  useEffect(() => {
    checkDeviceCompatibility();
  }, []);

  const checkDeviceCompatibility = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsCompatible(compatible);
  };

  const handleBiometricSetup = async () => {
    if (!isCompatible) {
      Alert.alert(
        'Incompatible Device',
        'Your device doesn\'t support biometric authentication'
      );
      return;
    }

    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert(
          'No Biometrics Found',
          'Please set up biometric authentication in your device settings first.'
        );
        return;
      }

      // Verify current biometric before changing setting
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: isBiometricEnabled 
          ? 'Authenticate to disable biometric lock'
          : 'Authenticate to enable biometric lock',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        await toggleBiometric();
        Alert.alert(
          'Success',
          `Biometric lock has been ${isBiometricEnabled ? 'disabled' : 'enabled'}`
        );
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      Alert.alert('Error', 'Failed to setup biometric authentication');
    }
  };

  const handleExportData = async () => {
    try {
      const data = {
        transactions,
        categories,
        balance,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `financial_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, jsonString);

      await Share.share({
        url: filePath,
        title: 'Financial Tracker Backup',
        message: 'Here is your Financial Tracker backup file'
      });
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json'
      });

      if (result.canceled) {
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const importedData = JSON.parse(fileContent);

      // Validate imported data structure
      if (!importedData.transactions || !importedData.categories || !importedData.balance) {
        throw new Error('Invalid backup file format');
      }

      Alert.alert(
        'Import Data',
        'This will replace all your current data. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Import',
            onPress: async () => {
              await importData(importedData);
              Alert.alert('Success', 'Data imported successfully');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Import failed:', error);
      Alert.alert('Import Failed', 'Failed to import data. Please ensure the file is valid.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions and categories. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                '@transactions',
                '@categories',
                '@balance'
              ]);

              await importData({
                transactions: [],
                categories: DEFAULT_CATEGORIES,
                balance: { total: 0, isInitialized: true },
                exportDate: new Date().toISOString(),
                version: '1.0'
              });
              
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Failed to clear data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const TestDataSection = () => {
    if (!isDevelopment) return null;

    const handleAddTestData = () => {
      Alert.alert(
        "Add Test Data",
        "This will add 100 sample transactions to your data. Continue?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Add Data",
            onPress: () => {
              // Add mock transactions to store
              mockTransactions.forEach(transaction => {
                addTransaction(transaction);
              });
              
              // Add mock categories if they don't exist
              mockCategories.forEach(category => {
                if (!categories.find(c => c.name === category.name)) {
                  addCategory(category);
                }
              });

              Alert.alert("Success", "Test data has been added successfully!");
            }
          }
        ]
      );
    };

    return (
      <View className="mt-6">
        <Text style={{ color: themeColors.text.primary }} className="mb-2 text-lg font-semibold">
          Development
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: themeColors.card }}
          className="flex-row justify-between items-center p-4 rounded-lg"
          onPress={handleAddTestData}
        >
          <View className="flex-row items-center">
            <View style={{ backgroundColor: theme === 'dark' ? '#3b82f620' : '#dbeafe' }}
              className="justify-center items-center mr-3 w-10 h-10 rounded-full">
              <FontAwesome 
                name="database" 
                size={20} 
                color={theme === 'dark' ? '#60a5fa' : '#2563eb'} 
              />
            </View>
            <View>
              <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                Add Test Data
              </Text>
              <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                Add sample transactions
              </Text>
            </View>
          </View>
          <FontAwesome 
            name="chevron-right" 
            size={16} 
            color={themeColors.text.secondary} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: themeColors.background }} className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">

          {/* Preferences Section */}
          <View style={{ backgroundColor: themeColors.card }} className="mb-6 rounded-lg shadow-sm">
            <Text style={{ color: themeColors.text.primary }} className="p-4 text-lg font-semibold">
              Preferences
            </Text>
            
            {/* Balance Visibility Toggle */}
            <View style={{ borderTopColor: themeColors.border }} 
              className="flex-row justify-between items-center p-4 border-t">
              <View>
                <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                  Show Balance
                </Text>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                  Toggle balance visibility
                </Text>
              </View>
              <Switch
                value={showBalance}
                onValueChange={toggleBalanceVisibility}
                trackColor={{ false: themeColors.border, true: themeColors.text.accent }}
                thumbColor={showBalance ? themeColors.text.accent : themeColors.card}
              />
            </View>

            {/* Theme Toggle */}
            <View style={{ borderTopColor: themeColors.border }} 
              className="flex-row justify-between items-center p-4 border-t">
              <View>
                <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                  Dark Mode
                </Text>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                  Switch app theme
                </Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                trackColor={{ false: themeColors.border, true: themeColors.text.accent }}
                thumbColor={theme === 'dark' ? themeColors.text.accent : themeColors.card}
              />
            </View>

            {/* Notifications Toggle */}
            <View style={{ borderTopColor: themeColors.border }} 
              className="flex-row justify-between items-center p-4 border-t">
              <View>
                <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                  Notifications
                </Text>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                  Enable push notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: themeColors.border, true: themeColors.text.accent }}
                thumbColor={notificationsEnabled ? themeColors.text.accent : themeColors.card}
              />
            </View>

            {/* Currency Selector */}
            <TouchableOpacity
              style={{ borderTopColor: themeColors.border }}
              className="flex-row items-center p-4 border-t"
              onPress={() => setShowCurrencyModal(true)}
            >
              <View style={{ backgroundColor: theme === 'dark' ? '#ca8a0420' : '#fef9c3' }}
                className="justify-center items-center mr-4 w-10 h-10 rounded-full">
                <FontAwesome name="money" size={20} color={theme === 'dark' ? '#fcd34d' : '#ca8a04'} />
              </View>
              <View className="flex-1">
                <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                  Currency
                </Text>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                  {CURRENCIES.find(c => c.code === currency)?.name || 'US Dollar'}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={themeColors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Data Management Section */}
          <View style={{ backgroundColor: themeColors.card }} className="mb-6 rounded-lg shadow-sm">
            <Text style={{ color: themeColors.text.primary }} className="p-4 text-lg font-semibold">
              Data Management
            </Text>
            
            <TouchableOpacity
              style={{ borderTopColor: themeColors.border }}
              className="flex-row items-center p-4 border-t"
              onPress={handleExportData}
            >
              <View style={{ backgroundColor: theme === 'dark' ? '#3b82f620' : '#dbeafe' }}
                className="justify-center items-center mr-4 w-10 h-10 rounded-full">
                <FontAwesome name="download" size={20} color={themeColors.text.accent} />
              </View>
              <View className="flex-1">
                <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                  Export Data
                </Text>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                  Backup your financial data
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={themeColors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderTopColor: themeColors.border }}
              className="flex-row items-center p-4 border-t"
              onPress={handleImportData}
            >
              <View style={{ backgroundColor: theme === 'dark' ? '#7c3aed20' : '#f3e8ff' }}
                className="justify-center items-center mr-4 w-10 h-10 rounded-full">
                <FontAwesome name="upload" size={20} color={theme === 'dark' ? '#a78bfa' : '#7c3aed'} />
              </View>
              <View className="flex-1">
                <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                  Import Data
                </Text>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                  Restore from backup
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={themeColors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderTopColor: themeColors.border }}
              className="flex-row items-center p-4 border-t"
              onPress={handleClearData}
            >
              <View style={{ backgroundColor: theme === 'dark' ? '#dc262620' : '#fee2e2' }}
                className="justify-center items-center mr-4 w-10 h-10 rounded-full">
                <FontAwesome name="trash" size={20} color={theme === 'dark' ? '#f87171' : '#dc2626'} />
              </View>
              <View className="flex-1">
                <Text style={{ color: theme === 'dark' ? '#f87171' : '#dc2626' }} className="text-base font-medium">
                  Clear All Data
                </Text>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                  Delete all transactions and categories
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={themeColors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Security Section */}
          <View style={{ backgroundColor: themeColors.card }} className="mb-6 rounded-lg shadow-sm">
            <Text style={{ color: themeColors.text.primary }} className="p-4 text-lg font-semibold">
              Security
            </Text>
            
            <TouchableOpacity
              style={{ borderTopColor: themeColors.border }}
              className="flex-row items-center p-4 border-t"
              onPress={handleBiometricSetup}
            >
              <View style={{ backgroundColor: theme === 'dark' ? '#22c55e20' : '#dcfce7' }}
                className="justify-center items-center mr-4 w-10 h-10 rounded-full">
                <FontAwesome name="lock" size={20} color={themeColors.indicators.income.text} />
              </View>
              <View className="flex-1">
                <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                  Biometric Lock
                </Text>
                <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                  {isCompatible 
                    ? `${isBiometricEnabled ? 'Disable' : 'Enable'} biometric authentication`
                    : 'Device not compatible'
                  }
                </Text>
              </View>
              {isCompatible && (
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={handleBiometricSetup}
                  trackColor={{ 
                    false: themeColors.cardAlt, 
                    true: `${themeColors.text.accent}80` 
                  }}
                  thumbColor={isBiometricEnabled ? themeColors.text.accent : themeColors.card}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={{ backgroundColor: themeColors.card }} className="rounded-lg shadow-sm">
            <Text style={{ color: themeColors.text.primary }} className="p-4 text-lg font-semibold">
              About
            </Text>
            
            <View style={{ borderTopColor: themeColors.border }} className="p-4 border-t">
              <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                Version
              </Text>
              <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                1.0.0
              </Text>
            </View>

            <TouchableOpacity
              style={{ borderTopColor: themeColors.border }}
              className="p-4 border-t"
              onPress={() => {/* Handle privacy policy */}}
            >
              <Text style={{ color: themeColors.text.accent }} className="text-base font-medium">
                Privacy Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderTopColor: themeColors.border }}
              className="p-4 border-t"
              onPress={() => {/* Handle terms of service */}}
            >
              <Text style={{ color: themeColors.text.accent }} className="text-base font-medium">
                Terms of Service
              </Text>
            </TouchableOpacity>
          </View>

          <TestDataSection />
        </View>
      </ScrollView>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} className="flex-1 justify-end">
          <View style={{ backgroundColor: themeColors.card }} className="rounded-t-3xl">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text style={{ color: themeColors.text.primary }} className="text-xl font-bold">
                  Select Currency
                </Text>
                <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                  <FontAwesome name="times" size={24} color={themeColors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView className="max-h-96">
                {CURRENCIES.map((curr) => (
                  <TouchableOpacity
                    key={curr.code}
                    style={{ 
                      backgroundColor: currency === curr.code 
                        ? `${themeColors.text.accent}20`
                        : 'transparent',
                      borderBottomColor: themeColors.border
                    }}
                    className="flex-row items-center p-4 border-b"
                    onPress={() => {
                      setCurrency(curr.code);
                      setShowCurrencyModal(false);
                    }}
                  >
                    <Text style={{ color: themeColors.text.primary }} className="mr-4 text-2xl">
                      {curr.symbol}
                    </Text>
                    <View className="flex-1">
                      <Text style={{ color: themeColors.text.primary }} className="text-base font-medium">
                        {curr.name}
                      </Text>
                      <Text style={{ color: themeColors.text.secondary }} className="text-sm">
                        {curr.code}
                      </Text>
                    </View>
                    {currency === curr.code && (
                      <FontAwesome name="check" size={20} color={themeColors.text.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 