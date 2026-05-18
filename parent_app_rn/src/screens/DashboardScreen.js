import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Alert, Dimensions, Linking, Image } from 'react-native';
import { LogOut, Calendar, Wallet, GraduationCap, BookOpen, TrendingUp, CheckCircle2, AlertCircle, Bell, Clock, QrCode, ArrowRight, Sun, Moon, Languages, Truck, User, Home } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');
const API_URL = 'https://school-management-web-h75u.onrender.com/api';

export default function DashboardScreen({ navigation }) {
  const { userData, token, logout, isDarkMode, toggleDarkMode } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [academicSubTab, setAcademicSubTab] = useState('marks');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const theme = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    subText: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#F1F5F9',
    itemBg: isDarkMode ? '#1E293B' : '#FFFFFF',
  };

  const changeLanguage = () => {
    const langs = ['en', 'bn', 'hi'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    i18n.changeLanguage(langs[nextIndex]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/parent/child-data`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      setData(res.data.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Sync Error", "Could not connect to the school server. Please check if your backend API server is running.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePayUPI = async (amount) => {
    const vpa = data?.school?.upi_id; 
    const name = data?.school?.name || "Academix School";

    if (!vpa || vpa === 'school@upi' || vpa === 'pending@upi') {
      Alert.alert("Setup Required", "The school has not set up their UPI ID yet. Please contact the school admin.");
      return;
    }

    const upiUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
        setShowConfirm(true);
      } else {
        Alert.alert("UPI Error", "No UPI app (GPay, PhonePe, Paytm) found on this device.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not open UPI apps.");
    }
  };

  const confirmPayment = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/parent/process-payment`, {
        amount: data?.student?.balance,
        method: 'UPI',
        transactionId: `UPI_TRANS_${Date.now()}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        Alert.alert("Success", "Payment confirmed! Your record has been updated.");
        setShowConfirm(false);
        fetchData();
      } else {
        throw new Error(res.data.error || "Server error");
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      Alert.alert("Save Failed", `Error: ${msg}\n\nPlease ensure your database tables are updated via SQL.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackBus = async () => {
    try {
      const res = await axios.get(`${API_URL}/tracking/locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const locations = res.data.data;
      if (locations && locations.length > 0) {
        const { latitude, longitude } = locations[0];
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        Linking.openURL(url);
      } else {
        Alert.alert("Not Found", "The school bus is not currently sharing its location.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch vehicle location.");
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'present') return { bg: '#ECFDF5', text: '#10B981' };
    if (s === 'absent') return { bg: '#FEF2F2', text: '#EF4444' };
    if (s === 'late') return { bg: '#FFFBEB', text: '#F59E0B' };
    if (s === 'half day') return { bg: '#EFF6FF', text: '#3B82F6' };
    return { bg: '#F1F5F9', text: '#64748B' };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  const { student, attendance, marks, fees, notifications, school, homework } = data || {};
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStatus = attendance?.history?.find(a => a.date?.startsWith(todayStr))?.status || 'Not Marked';

  const bottomTabs = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fees', icon: Wallet },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Top Header */}
      <View style={[styles.appBar, { backgroundColor: theme.card, borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
        <View>
          <Text style={styles.appSubtitle}>{school?.name || t('Parent Portal')}</Text>
          <Text style={[styles.appTitle, { color: theme.text }]}>{t('Academix')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.border }]} onPress={changeLanguage}>
            <Languages size={18} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.border }]} onPress={toggleDarkMode}>
            {isDarkMode ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#8b5cf6" />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.studentCard}>
          {student?.photo ? (
            <Image source={{ uri: student.photo }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{(student?.name || userData?.childName || 'S').charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{student?.name || userData?.childName || 'Student'}</Text>
            <Text style={styles.studentDetails}>Class {student?.class || 'N/A'} | Roll #{student?.rollNumber || 'N/A'}</Text>
          </View>
        </LinearGradient>

        <TouchableOpacity 
          style={{ backgroundColor: '#10B981', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}
          onPress={handleTrackBus}
        >
          <Truck size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Live Track School Bus</Text>
        </TouchableOpacity>

        {activeTab === 'overview' && (
          <MotiView from={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <View style={[styles.todayStatusBar, { backgroundColor: theme.card, borderLeftColor: getStatusColor(todayStatus).text }]}>
               <View>
                 <Text style={styles.todayTitle}>{t("Today's Status")}</Text>
                 <Text style={[styles.todayValue, { color: getStatusColor(todayStatus).text }]}>{t(todayStatus)}</Text>
               </View>
               <View style={[styles.todayBadge, { backgroundColor: getStatusColor(todayStatus).bg }]}>
                  {todayStatus === 'Present' ? <CheckCircle2 size={16} color="#10B981" /> : <Clock size={16} color="#64748B" />}
               </View>
            </View>

            <View style={styles.statsGrid}>
              <StatCard title={t("Attendance")} value={`${attendance?.percentage || 0}%`} Icon={CheckCircle2} color="#10B981" bgColor="#ECFDF5" theme={theme} />
              <StatCard title={t("Due Fees")} value={`₹${student?.balance || 0}`} Icon={Wallet} color="#F43F5E" bgColor="#FFF1F2" theme={theme} />
            </View>
            <View style={styles.statsGrid}>
              <StatCard title={t("Last Mark")} value="92/100" Icon={TrendingUp} color="#6366F1" bgColor="#EEF2FF" theme={theme} />
              <StatCard title={t("Alerts")} value={notifications?.length || 0} Icon={Bell} color="#8B5CF6" bgColor="#F5F3FF" theme={theme} />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("Recent Notifications")}</Text>
            {notifications?.length > 0 ? notifications.map((n, i) => (
              <View key={i} style={[styles.notifItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.notifIcon, { backgroundColor: n.title?.includes('Attendance') ? '#FEF2F2' : '#EEF2FF' }]}>
                  <Bell size={16} color={n.title?.includes('Attendance') ? '#EF4444' : '#8b5cf6'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.notifTitle, { color: theme.text }]}>{n.title}</Text>
                  <Text style={[styles.notifTime, { color: theme.subText }]}>{n.message}</Text>
                </View>
              </View>
            )) : (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={styles.emptyText}>{t("No recent updates")}</Text></View>
            )}
          </MotiView>
        )}

        {activeTab === 'attendance' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("Attendance Logs")}</Text>
            {attendance?.history?.length > 0 ? attendance.history.map((a, i) => {
              const colors = getStatusColor(a.status);
              return (
                <View key={i} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Clock size={18} color="#8b5cf6" />
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>{new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                    <Text style={styles.itemSubtitle}>Marked by School</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusTagText, { color: colors.text }]}>{t(a.status)}</Text>
                  </View>
                </View>
              );
            }) : (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={styles.emptyText}>{t("No history available")}</Text></View>
            )}
          </View>
        )}

        {activeTab === 'fees' && (
          <View>
            <View style={styles.feesSummary}>
              <StatCard title={t("Paid")} value={`₹${student?.paidFees || 0}`} Icon={CheckCircle2} color="#10B981" bgColor="#ECFDF5" theme={theme} />
              <StatCard title={t("Balance")} value={`₹${student?.balance || 0}`} Icon={AlertCircle} color="#EF4444" bgColor="#FEF2F2" theme={theme} />
            </View>

            {student?.balance > 0 && (
              <View style={[styles.paymentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.paymentHeader}>
                  <QrCode size={24} color={theme.text} />
                  <Text style={[styles.paymentTitle, { color: theme.text }]}>{t("Quick Pay (UPI)")}</Text>
                </View>
                <View style={[styles.qrContainer, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: theme.border, height: 'auto', minHeight: 180, padding: 15 }]}>
                  {school?.qr_code_url ? (
                    <Image 
                      source={{ uri: school.qr_code_url }} 
                      style={{ width: 130, height: 130, resizeMode: 'contain', borderRadius: 10 }} 
                    />
                  ) : (
                    <View style={styles.qrPlaceholder}>
                       <Text style={[styles.qrText, { color: theme.text }]}>Scan to Pay ₹{student?.balance}</Text>
                    </View>
                  )}
                  <Text style={[styles.qrSub, { color: theme.text, fontWeight: 'bold', marginTop: 10 }]}>UPI ID: {school?.upi_id || 'Not Set'}</Text>
                </View>
                
                {!showConfirm ? (
                  <TouchableOpacity style={styles.payBtn} onPress={() => handlePayUPI(student?.balance)}>
                     <Text style={styles.payBtnText}>{t("Pay via UPI App")}</Text>
                     <ArrowRight size={18} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#10B981' }]} onPress={confirmPayment}>
                     <Text style={styles.payBtnText}>{t("Verify & Save Payment")}</Text>
                     <CheckCircle2 size={18} color="#fff" />
                  </TouchableOpacity>
                )}
                <Text style={styles.paymentNote}>* Payment will be verified within 24 hours.</Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("Payment History")}</Text>
            {fees?.payments?.length > 0 ? fees.payments.map((f, i) => (
              <View key={i} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Wallet size={18} color="#6366F1" />
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: theme.text }]}>Fee Payment</Text>
                  <Text style={styles.itemSubtitle}>{new Date(f.payment_date).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                   <Text style={{ fontWeight: 'bold', color: '#10B981' }}>+₹{f.amount_paid}</Text>
                   <TouchableOpacity onPress={() => {
                     const url = `${API_URL}/parent/invoice/latest?token=${token}`;
                     Linking.openURL(url).catch(err => {
                       console.error('Failed to open URL:', err);
                       Alert.alert("Error", "Could not open browser for download.");
                     });
                   }}>
                     <Text style={{ color: '#8b5cf6', fontSize: 10, fontWeight: 'bold' }}>Download PDF</Text>
                   </TouchableOpacity>
                </View>
              </View>
            )) : (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={styles.emptyText}>{t("No payment history")}</Text></View>
            )}
          </View>
        )}

        {activeTab === 'academics' && (
          <MotiView from={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Sub-tabs for Marks and Homework */}
            <View style={[styles.academicSubTabBar, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]}>
              <TouchableOpacity 
                style={[styles.academicSubTabItem, academicSubTab === 'marks' && [styles.academicSubTabItemActive, { backgroundColor: isDarkMode ? '#1E293B' : '#fff' }]]}
                onPress={() => setAcademicSubTab('marks')}
              >
                <Text style={[styles.academicSubTabText, academicSubTab === 'marks' && styles.academicSubTabTextActive]}>
                  {t('Exam Marks')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.academicSubTabItem, academicSubTab === 'homework' && [styles.academicSubTabItemActive, { backgroundColor: isDarkMode ? '#1E293B' : '#fff' }]]}
                onPress={() => setAcademicSubTab('homework')}
              >
                <Text style={[styles.academicSubTabText, academicSubTab === 'homework' && styles.academicSubTabTextActive]}>
                  {t('Assignments')}
                </Text>
              </TouchableOpacity>
            </View>

            {academicSubTab === 'marks' ? (
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("Subject Marks")}</Text>
                {marks?.length > 0 ? marks.map((mark, idx) => (
                  <View key={idx} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <GraduationCap size={20} color="#8b5cf6" />
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{mark.subjects?.name || 'Subject'}</Text>
                      <Text style={styles.itemSubtitle}>{mark.exams?.name || 'Academic Exam'}</Text>
                    </View>
                    <Text style={styles.markValue}>{mark.marks_obtained}/{mark.subjects?.max_marks || 100}</Text>
                  </View>
                )) : (
                  <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={styles.emptyText}>{t("Marks not uploaded yet")}</Text></View>
                )}
              </View>
            ) : (
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("Homework & Assignments")}</Text>
                {homework?.length > 0 ? homework.map((hw, idx) => {
                  const isOverdue = new Date(hw.due_date) < new Date();
                  return (
                    <View key={idx} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border, flexDirection: 'column', alignItems: 'stretch' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <BookOpen size={20} color="#8b5cf6" />
                        <View style={styles.itemContent}>
                          <Text style={[styles.itemTitle, { color: theme.text }]}>{hw.subjects?.name || 'Subject'}</Text>
                          <Text style={[styles.itemSubtitle, { color: isOverdue ? '#EF4444' : theme.subText }]}>
                            Due: {new Date(hw.due_date).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={[styles.statusTag, { backgroundColor: isOverdue ? '#FEF2F2' : '#EEF2FF' }]}>
                          <Text style={[styles.statusTagText, { color: isOverdue ? '#EF4444' : '#6366F1' }]}>
                            {isOverdue ? 'Overdue' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: theme.text, fontSize: 13, lineHeight: 18, marginTop: 4 }}>{hw.description}</Text>
                    </View>
                  );
                }) : (
                  <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={styles.emptyText}>{t("No homework assigned")}</Text></View>
                )}
              </View>
            )}
          </MotiView>
        )}

        {activeTab === 'profile' && (
          <MotiView from={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Parent Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.profileHeader}>
                <View style={[styles.profileAvatar, { backgroundColor: '#8b5cf6' }]}>
                  <Text style={styles.profileAvatarText}>
                    {userData?.email?.charAt(0).toUpperCase() || 'P'}
                  </Text>
                </View>
                <View style={styles.profileMeta}>
                  <Text style={[styles.profileName, { color: theme.text }]}>
                    {t('Parent / Guardian')}
                  </Text>
                  <Text style={[styles.profileEmail, { color: theme.subText }]}>
                    {userData?.email || student?.parentEmail}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <Text style={[styles.profileSubtitle, { color: theme.subText }]}>
                {t('Linked Student')}
              </Text>
              <View style={[styles.linkedStudentBox, { backgroundColor: theme.bg }]}>
                <Image 
                  source={{ uri: student?.photo || `https://ui-avatars.com/api/?name=${student?.name || userData?.childName || 'Student'}&background=8B5CF6&color=fff` }} 
                  style={styles.linkedStudentAvatar} 
                />
                <View>
                  <Text style={[styles.linkedStudentName, { color: theme.text }]}>{student?.name || userData?.childName}</Text>
                  <Text style={[styles.linkedStudentDesc, { color: theme.subText }]}>
                    {t('Class')} {student?.class || 'N/A'} | Roll #{student?.rollNumber || 'N/A'}
                  </Text>
                  <Text style={[styles.linkedStudentRelation, { color: '#8b5cf6' }]}>
                    {t('Parent of')} {student?.name || userData?.childName}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <Text style={[styles.profileSubtitle, { color: theme.subText }]}>
                {t('Institution Details')}
              </Text>
              <View style={[styles.institutionBox, { backgroundColor: theme.bg }]}>
                <GraduationCap size={24} color="#8b5cf6" style={{ marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.institutionName, { color: theme.text }]}>{school?.name || 'Academix School'}</Text>
                  <Text style={[styles.institutionDetails, { color: theme.subText }]}>
                    UPI ID: {school?.upi_id || 'Not Set'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Logout Button inside Profile */}
            <TouchableOpacity style={styles.profileLogoutBtn} onPress={logout}>
              <LogOut size={20} color="#fff" />
              <Text style={styles.profileLogoutBtnText}>{t('Sign Out')}</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {bottomTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity 
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.bottomTabItem}
            >
              <MotiView 
                animate={{ scale: isActive ? 1.15 : 1 }} 
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                style={[styles.bottomTabIconContainer, isActive && { backgroundColor: '#8b5cf6' }]}
              >
                <Icon size={20} color={isActive ? '#fff' : theme.subText} />
              </MotiView>
              <Text style={[styles.bottomTabText, { color: isActive ? '#8b5cf6' : theme.subText }]}>
                {t(tab.label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function StatCard({ title, value, Icon, color, bgColor, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.iconBg, { backgroundColor: bgColor }]}>
        <Icon size={22} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, backgroundColor: '#fff' },
  appSubtitle: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
  appTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  logoutBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#fff', gap: 10 },
  tabItem: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  tabItemActive: { backgroundColor: '#8b5cf6' },
  tabText: { fontSize: 12, fontWeight: 'bold', color: '#64748B', textTransform: 'capitalize', fontFamily: 'Outfit_700Bold' },
  tabTextActive: { color: '#fff' },
  scrollContent: { padding: 20 },
  studentCard: { padding: 20, borderRadius: 30, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarContainer: { width: 55, height: 55, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  avatarImg: { width: 55, height: 55, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  studentInfo: { marginLeft: 15, flex: 1 },
  studentName: { color: '#fff', fontSize: 18, fontFamily: 'Outfit_700Bold' },
  studentDetails: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'Outfit_400Regular' },
  todayStatusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 25, marginBottom: 20, borderLeftWidth: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  todayTitle: { fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 1 },
  todayValue: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  todayBadge: { width: 35, height: 35, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statCard: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#1E293B', fontFamily: 'Outfit_700Bold' },
  statTitle: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold', fontFamily: 'Outfit_400Regular' },
  sectionTitle: { fontSize: 16, fontFamily: 'Outfit_700Bold', fontWeight: '900', color: '#1E293B', marginTop: 20, marginBottom: 15 },
  paymentCard: { backgroundColor: '#fff', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  paymentTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  qrContainer: { height: 150, backgroundColor: '#F8FAFC', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1' },
  qrPlaceholder: { alignItems: 'center' },
  qrText: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  qrSub: { fontSize: 12, color: '#64748B', marginTop: 5 },
  payBtn: { backgroundColor: '#1E293B', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  paymentNote: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  itemContent: { flex: 1, marginLeft: 15 },
  itemTitle: { fontWeight: '700', color: '#1E293B', fontSize: 14 },
  itemSubtitle: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  statusTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusTagText: { fontSize: 11, fontWeight: 'bold' },
  markValue: { fontWeight: '900', color: '#8b5cf6', fontSize: 15 },
  notifItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  notifIcon: { width: 35, height: 35, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  notifTitle: { fontWeight: '700', color: '#1E293B', fontSize: 13 },
  notifTime: { color: '#94A3B8', fontSize: 11, fontWeight: 'medium', marginTop: 2 },
  emptyCard: { padding: 30, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  emptyText: { color: '#94A3B8', fontStyle: 'italic', fontSize: 13 },
  feesSummary: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },

  // Bottom Navigation Bar Styles
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 15,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottomTabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bottomTabText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Outfit_700Bold',
  },

  // Profile View Styles
  profileCard: {
    padding: 24,
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Outfit_700Bold',
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    marginTop: 2,
  },
  profileSubtitle: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  linkedStudentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    gap: 15,
  },
  linkedStudentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
  },
  linkedStudentName: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Outfit_700Bold',
  },
  linkedStudentDesc: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    marginTop: 2,
  },
  linkedStudentRelation: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
  },
  institutionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
  },
  institutionName: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'Outfit_700Bold',
  },
  institutionDetails: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    marginTop: 2,
  },
  profileLogoutBtn: {
    backgroundColor: '#F43F5E',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  profileLogoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
  },

  // Academic Sub Tab Bar Styles
  academicSubTabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 15,
    marginBottom: 20,
  },
  academicSubTabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  academicSubTabItemActive: {
    // Background color determined dynamically via props
  },
  academicSubTabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    fontFamily: 'Outfit_700Bold',
  },
  academicSubTabTextActive: {
    color: '#8b5cf6',
  },
});
