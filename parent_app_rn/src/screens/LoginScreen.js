import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Mail, ShieldCheck, ArrowRight, CheckCircle2, Smartphone, Sun, Moon, Languages } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [parentKey, setParentKey] = useState('');
  const { verifyOtp, isLoading, isDarkMode, toggleDarkMode } = useAuth();
  const { t } = useTranslation();

  const theme = {
    bg: isDarkMode ? '#0F172A' : '#FFFFFF',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    subText: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#F1F5F9',
    inputBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    inputBorder: isDarkMode ? '#334155' : '#E2E8F0',
  };

  const changeLanguage = () => {
    const langs = ['en', 'bn', 'hi'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    i18n.changeLanguage(langs[nextIndex]);
  };

  const handleLogin = async () => {
    if (!email || !parentKey) {
      Alert.alert("Error", "Please enter both Email and Parent Key");
      return;
    }
    try {
      await verifyOtp(email, parentKey);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Unknown Error";
      const status = error.response?.status ? `[${error.response.status}] ` : "";
      Alert.alert("Login Failed", status + msg);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} bounces={false} contentContainerStyle={{flexGrow: 1}}>
      <View style={styles.header}>
        <View style={styles.topControls}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.8)' }]} onPress={changeLanguage}>
            <Languages size={18} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.8)' }]} onPress={toggleDarkMode}>
            {isDarkMode ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#8b5cf6" />}
          </TouchableOpacity>
        </View>
        <Image 
          source={require('../../assets/teacher-duo.png')} 
          style={[styles.headerImage, { resizeMode: 'contain', marginTop: 20 }]}
        />
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.2)']}
          style={styles.gradient}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
        />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.titleWrapper}>
          <Text style={[styles.title, { color: theme.text }]}>{t('Parent Portal')}</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>{t('Secure access to your child\'s data')}</Text>
        </View>

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Mail size={20} color="#8b5cf6" style={styles.icon} />
            <TextInput
              placeholder={t("Parent Email")}
              placeholderTextColor="#94A3B8"
              style={[styles.input, { color: theme.text }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: 15, backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <ShieldCheck size={20} color="#8b5cf6" style={styles.icon} />
            <TextInput
              placeholder={t("Parent Key (8 characters)")}
              placeholderTextColor="#94A3B8"
              style={[styles.input, { color: theme.text }]}
              value={parentKey}
              onChangeText={setParentKey}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity 
            onPress={handleLogin} 
            disabled={isLoading}
            style={styles.buttonMargin}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>{t('Secure Login')}</Text>
                  <ArrowRight size={20} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1000, type: 'timing', duration: 1000 }}
        style={styles.premiumFooter}
      >
        <View style={styles.separator} />
        <Text style={styles.copyrightText}>
          © 2026 <Text style={styles.brandHighlight}>Academix</Text> • Developed by Ahammed Sohan And Team
        </Text>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: height * 0.35,
    width: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  formContainer: {
    paddingHorizontal: 25,
    marginTop: -40,
    flex: 1,
  },
  titleWrapper: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 5,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 30,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
  },
  buttonMargin: {
    marginTop: 20,
  },
  button: {
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  otpHeaderText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 14,
  },
  resendButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  resendText: {
    color: '#8b5cf6',
    fontWeight: 'bold',
    fontSize: 14,
  },
  premiumFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  separator: {
    width: 40,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 15,
    opacity: 0.5,
  },
  copyrightText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  brandHighlight: {
    color: '#8b5cf6',
    fontWeight: '800',
    textShadowColor: 'rgba(139, 92, 246, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
});
