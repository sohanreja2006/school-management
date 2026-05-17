import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Key, ShieldCheck } from 'lucide-react-native';

export default function LoginScreen() {
  const [staffId, setStaffId] = useState('');
  const [staffKey, setStaffKey] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!staffId.trim() || !staffKey.trim()) {
      Alert.alert('Validation Error', 'Please enter both your Staff ID and 4-Digit PIN.');
      return;
    }
    try {
      await login(staffId.trim(), staffKey.trim());
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid Staff ID or 4-Digit PIN. Please check your credentials.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <ShieldCheck color="#8b5cf6" size={48} />
            </View>
            <Text style={styles.title}>Academix Teacher</Text>
            <Text style={styles.subtitle}>Enter your Staff ID and 4-Digit PIN to access your classroom attendance roster.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Staff ID</Text>
              <View style={styles.inputContainer}>
                <UserCheck color="#8b5cf6" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. TCH-8392"
                  placeholderTextColor="#9ca3af"
                  value={staffId}
                  onChangeText={setStaffId}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>4-Digit PIN</Text>
              <View style={styles.inputContainer}>
                <Key color="#8b5cf6" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 4821"
                  placeholderTextColor="#9ca3af"
                  value={staffKey}
                  onChangeText={setStaffKey}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
            </Text>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Secure Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  loginButton: {
    backgroundColor: '#8b5cf6',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
