import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, Alert, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// IMPORTANT: Replace with your actual backend IP address
const API_URL = 'http://192.168.31.230:5000/api';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [driverKey, setDriverKey] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    checkLoginStatus();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const checkLoginStatus = async () => {
    try {
      const savedVehicleId = await AsyncStorage.getItem('vehicleId');
      const savedDriverKey = await AsyncStorage.getItem('driverKey');
      const savedSchoolId = await AsyncStorage.getItem('schoolId');
      if (savedVehicleId && savedDriverKey) {
        setVehicleId(savedVehicleId);
        setDriverKey(savedDriverKey);
        if (savedSchoolId) setSchoolId(savedSchoolId);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!vehicleId.trim() || !driverKey.trim()) {
      Alert.alert('Error', 'Please enter Vehicle Number and Driver Key');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/tracking/driver-login`, {
        vehicle_number: vehicleId.trim(),
        driver_key: driverKey.trim()
      });

      if (res.data.success) {
        const fetchedSchoolId = res.data.data?.school_id || '';
        await AsyncStorage.setItem('vehicleId', vehicleId.trim());
        await AsyncStorage.setItem('driverKey', driverKey.trim());
        if (fetchedSchoolId) await AsyncStorage.setItem('schoolId', fetchedSchoolId);
        
        setSchoolId(fetchedSchoolId);
        setIsLoggedIn(true);
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    // Stop tracking before logout
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setIsTracking(false);
    
    await AsyncStorage.removeItem('vehicleId');
    await AsyncStorage.removeItem('driverKey');
    await AsyncStorage.removeItem('schoolId');
    setVehicleId('');
    setDriverKey('');
    setSchoolId('');
    setIsLoggedIn(false);
  };

  const toggleTracking = async (value) => {
    if (value) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      setIsTracking(true);
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          setLocation(loc);
          sendLocationToServer(loc.coords);
        }
      );
      setSubscription(sub);
    } else {
      setIsTracking(false);
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }
    }
  };

  const sendLocationToServer = async (coords) => {
    try {
      await axios.post(`${API_URL}/tracking/location`, {
        vehicle_id: vehicleId,
        school_id: schoolId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading,
        speed: coords.speed,
      });
    } catch (error) {
      console.error('Failed to send location', error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Academix Driver</Text>
        <View style={styles.card}>
          <Text style={styles.headerText}>Driver Authentication</Text>
          
          <Text style={styles.label}>Vehicle Number</Text>
          <TextInput 
            style={styles.input}
            value={vehicleId}
            onChangeText={setVehicleId}
            placeholder="e.g. BUS-01"
            placeholderTextColor="#64748b"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Unique Driver Key</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput}
              value={driverKey}
              onChangeText={setDriverKey}
              placeholder="6-digit key"
              placeholderTextColor="#64748b"
              secureTextEntry={!showKey}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowKey(!showKey)}>
              <Text style={styles.eyeText}>{showKey ? 'Hide' : 'View'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login Securely</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.titleSmall}>Academix Driver</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Logged in as Vehicle:</Text>
        <Text style={styles.vehicleText}>{vehicleId}</Text>

        <View style={styles.divider} />

        <Text style={styles.statusText}>
          {isTracking ? 'GPS Tracking is ACTIVE' : 'GPS Tracking is OFF'}
        </Text>
        
        <Switch
          trackColor={{ false: '#767577', true: '#10B981' }}
          thumbColor={isTracking ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTracking}
          value={isTracking}
          style={styles.switch}
        />
      </View>

      {location && isTracking && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Lat: {location.coords.latitude.toFixed(6)}</Text>
          <Text style={styles.infoText}>Lng: {location.coords.longitude.toFixed(6)}</Text>
          <Text style={styles.infoText}>Speed: {(location.coords.speed * 3.6).toFixed(1)} km/h</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 50,
  },
  titleSmall: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
  },
  headerText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 25,
  },
  statusText: {
    fontSize: 18,
    color: '#F8FAFC',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  vehicleText: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 5,
  },
  label: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
    width: '100%'
  },
  input: {
    backgroundColor: '#0F172A',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  eyeBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  eyeText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#10B981',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#334155',
    marginVertical: 25,
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
  },
  infoBox: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    width: '100%',
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 16,
    marginVertical: 5,
    fontFamily: 'monospace'
  }
});
