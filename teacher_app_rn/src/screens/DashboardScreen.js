import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/api';
import { QrCode, Users, RotateCcw, LogOut, CheckCircle2, TrendingUp, CalendarDays } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

export default function DashboardScreen({ navigation }) {
  const { userData, logout, selectedClass, setSelectedClass } = useAuth();
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const todayDate = new Date().toISOString().split('T')[0];

  const fetchDailyStatus = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getDailyStatus({ date: todayDate });
      const allStudents = res.data?.data || [];
      const filtered = selectedClass ? allStudents.filter(s => s.class === selectedClass) : allStudents;
      setStudentList(filtered);
    } catch (err) {
      console.log('Fetch status error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDailyStatus();
    });
    return unsubscribe;
  }, [navigation, selectedClass]);

  useEffect(() => {
    fetchDailyStatus();
  }, [selectedClass]);

  const handleReset = () => {
    Alert.alert(
      'Reset Attendance',
      `Are you sure you want to reset today's attendance for Class ${selectedClass || 'All'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              await attendanceService.resetDaily({ date: todayDate, class: selectedClass });
              Alert.alert('Success', `Attendance for Class ${selectedClass || 'All'} has been reset.`);
              fetchDailyStatus();
            } catch (err) {
              Alert.alert('Error', 'Failed to reset attendance.');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  const presentCount = studentList.filter(s => s.status === 'Present').length;
  const avgAttendance = studentList.length > 0
    ? (studentList.reduce((acc, curr) => acc + (curr.attendancePercentage || 0), 0) / studentList.length).toFixed(1)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, {userData?.name}</Text>
          <Text style={styles.schoolName}>{userData?.schoolName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <LogOut color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Class Selector Dropdown */}
        <View style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <CalendarDays color="#8b5cf6" size={20} />
            <Text style={styles.pickerTitle}>Select Class Roster</Text>
          </View>
          <View style={styles.pickerContainer}>
            {userData?.assignedClasses && userData.assignedClasses.length > 0 ? (
              <Picker
                selectedValue={selectedClass}
                onValueChange={(itemValue) => setSelectedClass(itemValue)}
                style={styles.picker}
              >
                {userData.assignedClasses.map((cls) => (
                  <Picker.Item key={cls} label={`Class ${cls}`} value={cls} />
                ))}
              </Picker>
            ) : (
              <Text style={styles.noClassText}>No Classes Assigned by Admin</Text>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.bgPurple]}>
            <Users color="#c4b5fd" size={28} />
            <Text style={styles.statLabel}>Class Strength</Text>
            <Text style={styles.statValue}>{loading ? '-' : studentList.length}</Text>
          </View>
          <View style={[styles.statCard, styles.bgEmerald]}>
            <CheckCircle2 color="#a7f3d0" size={28} />
            <Text style={styles.statLabel}>Present Today</Text>
            <Text style={styles.statValue}>{loading ? '-' : presentCount}</Text>
          </View>
          <View style={[styles.statCard, styles.bgIndigo]}>
            <TrendingUp color="#a5b4fc" size={28} />
            <Text style={styles.statLabel}>Avg Attendance</Text>
            <Text style={styles.statValue}>{loading ? '-' : `${avgAttendance}%`}</Text>
          </View>
        </View>

        {/* Action Grid */}
        <Text style={styles.sectionTitle}>Daily Attendance Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, styles.borderEmerald]}
            onPress={() => navigation.navigate('Scanner')}
          >
            <View style={[styles.actionIconContainer, styles.bgEmeraldLight]}>
              <QrCode color="#10b981" size={32} />
            </View>
            <Text style={styles.actionCardTitle}>Smart QR Scanner</Text>
            <Text style={styles.actionCardSubtitle}>Scan student ID cards via camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.borderPurple]}
            onPress={() => navigation.navigate('ManualRoster')}
          >
            <View style={[styles.actionIconContainer, styles.bgPurpleLight]}>
              <Users color="#8b5cf6" size={32} />
            </View>
            <Text style={styles.actionCardTitle}>Manual Roster</Text>
            <Text style={styles.actionCardSubtitle}>Toggle Present / Absent status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.borderRose]}
            onPress={handleReset}
            disabled={resetting}
          >
            <View style={[styles.actionIconContainer, styles.bgRoseLight]}>
              {resetting ? (
                <ActivityIndicator color="#f43f5e" size="small" />
              ) : (
                <RotateCcw color="#f43f5e" size={32} />
              )}
            </View>
            <Text style={styles.actionCardTitle}>Reset Attendance</Text>
            <Text style={styles.actionCardSubtitle}>Clear today's class markings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    gap: 4,
  },
  greeting: {
    fontSize: 22,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  schoolName: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  pickerCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pickerContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 54,
    width: '100%',
  },
  noClassText: {
    padding: 16,
    textAlign: 'center',
    fontFamily: 'Outfit_700Bold',
    color: '#9ca3af',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  bgPurple: { backgroundColor: '#8b5cf6' },
  bgEmerald: { backgroundColor: '#10b981' },
  bgIndigo: { backgroundColor: '#6366f1' },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  actionGrid: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  borderEmerald: { borderColor: '#a7f3d0' },
  borderPurple: { borderColor: '#e9d5ff' },
  borderRose: { borderColor: '#fecdd3' },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bgEmeraldLight: { backgroundColor: '#ecfdf5' },
  bgPurpleLight: { backgroundColor: '#faf5ff' },
  bgRoseLight: { backgroundColor: '#fff1f2' },
  actionCardTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  actionCardSubtitle: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#6b7280',
    marginTop: 4,
  },
});
