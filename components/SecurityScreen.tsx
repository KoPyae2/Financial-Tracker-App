import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useStore } from '@/store/useStore';

interface SecurityScreenProps {
  onAuthenticate: (success: boolean) => void;
}

export default function SecurityScreen({ onAuthenticate }: SecurityScreenProps) {
  const [isCompatible, setIsCompatible] = useState(false);
  const { isBiometricEnabled } = useStore();

  useEffect(() => {
    checkDeviceCompatibility();
  }, []);

  useEffect(() => {
    if (isBiometricEnabled) {
      authenticate();
    } else {
      onAuthenticate(true);
    }
  }, [isBiometricEnabled]);

  const checkDeviceCompatibility = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsCompatible(compatible);

    if (!compatible) {
      Alert.alert(
        'Incompatible Device',
        'Your device doesn\'t support biometric authentication'
      );
    }
  };

  const authenticate = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your financial data',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        onAuthenticate(true);
      } else {
        // Handle authentication failure
        Alert.alert(
          'Authentication Failed',
          'Please try again',
          [
            {
              text: 'Try Again',
              onPress: authenticate
            }
          ]
        );
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Failed to authenticate. Please try again.');
    }
  };

  if (!isBiometricEnabled) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Required</Text>
      <Text style={styles.subtitle}>
        Please authenticate to access your financial data
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 30,
  },
}); 