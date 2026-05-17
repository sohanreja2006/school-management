import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/api';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react-native';

export default function ManualRosterScreen({ navigation }) {
  const { selectedClass } = useAuth();
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const todayDate = new Date().toISOString().split('T')[0];

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getDailyStatus({ date: todayDate });
      const allStudents = res.data?.data || [];
      const filtered = selectedClass ? allStudents.filter(s => s.class === selectedClass) : allStudents;
      setStudentList(filtered);
    } catch (err) {
      console.log('Fetch roster error:', err);
      Alert.alert('Error', 'Failed to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const handleStatusChange = async (studentId, status) => {
    setMarkingId(studentId);
    try {
      await attendanceService.mark({ studentId, date: todayDate, status });
      // Update local state instantly
      setStudentList(prev => prev.map(s => {
        if ((s.id || s._id) === studentId) {
          return { ...s, status };
        }
        return s;
      }));
    } catch (err) {
      Alert.alert('Marking Failed', err.response?.data?.error || 'Failed to update attendance status.');
    } finally {
      setMarkingId(null);
    }
  };

  const renderStudentItem = ({ item }) => {
    const studentId = item.id || item._id;
    const isMarking = markingId === studentId;

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.metaContainer}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.rollNumber}>Roll No: {item.rollNumber} • Class {item.class}</Text>
          </View>
        </View>

        <View style={styles.toggleContainer}>
          {[
            { label: 'Present', icon: CheckCircle, activeBg: '#10b981', activeText: '#fff' },
            { label: 'Absent', icon: XCircle, activeBg: '#f43f5e', activeText: '#fff' },
            { label: 'Late', icon: Clock, activeBg: '#f59e0b', activeText: '#fff' },
          ].map(btn => {
            const isActive = item.status === btn.label;
            return (
              <TouchableOpacity
                key={btn.label}
                style={[
                  styles.toggleButton,
                  isActive ? { backgroundColor: btn.activeBg, borderColor: btn.activeBg } : styles.inactiveButton,
                ]}
                onPress={() => handleStatusChange(studentId, btn.label)}
                disabled={isMarking}
              >
                <Text
                  style={[
                    styles.toggleText,
                    isActive ? { color: btn.activeText } : styles.inactiveText,
                  ]}
                >
                  {btn.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {isMarking && (
          <View style={styles.itemOverlay}>
            <ActivityIndicator color="#8b5cf6" size="small" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Roster</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          Class Roster: <Text style={styles.highlightText}>Class {selectedClass || 'All'}</Text>
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : (
        <FlatList
          data={studentList}
          keyExtractor={item => (item.id || item._id).toString()}
          renderItem={renderStudentItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No students found in Class {selectedClass || 'All'}.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  subHeader: {
    backgroundColor: '#ede9fe',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd6fe',
  },
  subHeaderText: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  highlightText: {
    color: '#8b5cf6',
  },
  listContent: {
    padding: 24,
    gap: 16,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  metaContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  rollNumber: {
    fontSize: 12,
    fontFamily: 'Outfit_700Bold',
    color: '#6b7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveButton: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inactiveText: {
    color: '#6b7280',
  },
  itemOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Outfit_400Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
});
