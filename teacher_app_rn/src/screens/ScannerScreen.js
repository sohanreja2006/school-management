import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/api';
import { ArrowLeft, CheckCircle2, AlertCircle, Camera } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const { selectedClass } = useAuth();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [studentMap, setStudentMap] = useState({});
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await attendanceService.getDailyStatus({ date: todayDate });
        const allStudents = res.data?.data || [];
        const map = {};
        allStudents.forEach(s => {
          map[s.id || s._id] = s;
        });
        setStudentMap(map);
      } catch (err) {
        console.log('Fetch students error:', err);
      }
    };
    fetchStudents();
  }, []);

  if (!permission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.permissionCard}>
          <Camera color="#8b5cf6" size={64} style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionSubtitle}>
            Academix Teacher needs access to your camera to scan student QR attendance cards.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    const studentId = data.trim();
    const student = studentMap[studentId];

    if (!student) {
      setScanResult({
        success: false,
        title: 'Student Not Found',
        message: `No student matches QR ID: ${studentId}`,
      });
      setLoading(false);
      return;
    }

    if (selectedClass && student.class !== selectedClass) {
      setScanResult({
        success: false,
        title: 'Class Mismatch',
        message: `${student.name} belongs to Class ${student.class}, but you are currently scanning for Class ${selectedClass}.`,
      });
      setLoading(false);
      return;
    }

    try {
      await attendanceService.mark({ studentId, date: todayDate, status: 'Present' });
      setScanResult({
        success: true,
        title: 'Attendance Marked!',
        studentName: student.name,
        rollNumber: student.rollNumber,
        className: student.class,
        time: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      setScanResult({
        success: false,
        title: 'Marking Failed',
        message: err.response?.data?.error || 'Failed to record attendance on server.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextScan = () => {
    setScanResult(null);
    setScanned(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart QR Kiosk</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          Scanning for: <Text style={styles.highlightText}>Class {selectedClass || 'All'}</Text>
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.targetBox} />
            <Text style={styles.overlayPrompt}>Hold student QR card inside the frame</Text>
          </View>
        </CameraView>
      </View>

      {/* Result Popup Overlay */}
      {scanResult && (
        <View style={styles.resultContainer}>
          <View style={[styles.resultCard, scanResult.success ? styles.borderEmerald : styles.borderRose]}>
            <View style={[styles.resultIconContainer, scanResult.success ? styles.bgEmeraldLight : styles.bgRoseLight]}>
              {scanResult.success ? (
                <CheckCircle2 color="#10b981" size={40} />
              ) : (
                <AlertCircle color="#f43f5e" size={40} />
              )}
            </View>

            <Text style={[styles.resultTitle, scanResult.success ? styles.textEmerald : styles.textRose]}>
              {scanResult.title}
            </Text>

            {scanResult.success ? (
              <View style={styles.resultDetails}>
                <Text style={styles.studentName}>{scanResult.studentName}</Text>
                <Text style={styles.studentMeta}>
                  Class {scanResult.className} • Roll No: {scanResult.rollNumber}
                </Text>
                <Text style={styles.timestamp}>Marked Present at {scanResult.time}</Text>
              </View>
            ) : (
              <Text style={styles.errorMessage}>{scanResult.message}</Text>
            )}

            <TouchableOpacity style={styles.nextScanButton} onPress={handleNextScan}>
              <Text style={styles.nextScanButtonText}>Tap to Scan Next Student</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Verifying & Saving...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6b7280',
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
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
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBox: {
    width: 280,
    height: 280,
    borderWidth: 4,
    borderColor: '#8b5cf6',
    borderRadius: 32,
    backgroundColor: 'transparent',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  overlayPrompt: {
    color: '#fff',
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  borderEmerald: { borderColor: '#10b981' },
  borderRose: { borderColor: '#f43f5e' },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bgEmeraldLight: { backgroundColor: '#ecfdf5' },
  bgRoseLight: { backgroundColor: '#fff1f2' },
  resultTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  textEmerald: { color: '#10b981' },
  textRose: { color: '#f43f5e' },
  resultDetails: {
    alignItems: 'center',
    marginBottom: 24,
  },
  studentName: {
    fontSize: 22,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  studentMeta: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#10b981',
    backgroundColor: '#ecfdf5',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  errorMessage: {
    fontSize: 15,
    fontFamily: 'Outfit_400Regular',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  nextScanButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  nextScanButtonText: {
    color: '#fff',
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 16,
  },
});
