import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap } from 'lucide-react-native';
import { Easing } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.background}
      />
      
      <MotiView
        from={{
          opacity: 0,
          scale: 0.5,
          shadowOpacity: 0,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          shadowOpacity: 0.5,
        }}
        transition={{
          type: 'timing',
          duration: 1000,
          easing: Easing.out(Easing.back(1.5)),
        }}
        style={styles.logoContainer}
      >
        {/* Glow Pulse */}
        <MotiView
          from={{ opacity: 0.3, scale: 1 }}
          animate={{ opacity: 0.6, scale: 1.2 }}
          transition={{
            type: 'timing',
            duration: 2000,
            loop: true,
            easing: Easing.inOut(Easing.ease),
          }}
          style={styles.glow}
        />
        
        {/* Floating Motion */}
        <MotiView
          animate={{
            translateY: [-10, 10, -10],
          }}
          transition={{
            loop: true,
            duration: 3000,
            type: 'timing',
            easing: Easing.inOut(Easing.ease),
          }}
        >
          <GraduationCap size={100} color="#8b5cf6" strokeWidth={1.5} />
        </MotiView>
      </MotiView>

      <MotiView
        from={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 500, type: 'timing', duration: 800 }}
        style={styles.textContainer}
      >
        <MotiText 
          style={styles.title}
          from={{ letterSpacing: 2 }}
          animate={{ letterSpacing: 8 }}
          transition={{ type: 'timing', duration: 1500, easing: Easing.out(Easing.exp) }}
        >
          ACADEMIX
        </MotiText>
        <Text style={styles.subtitle}>Parent Portal</Text>
      </MotiView>

      {/* Premium Loading Indicator */}
      <View style={styles.loaderContainer}>
        <MotiView
          from={{ width: 0 }}
          animate={{ width: width * 0.4 }}
          transition={{
            type: 'timing',
            duration: 2500,
            easing: Easing.inOut(Easing.quad),
          }}
          style={styles.progressBar}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={['#8b5cf6', '#a855f7']}
            style={StyleSheet.absoluteFill}
          />
        </MotiView>
        <View style={styles.progressTrack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 20,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    elevation: 20,
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.4,
    height: 4,
    justifyContent: 'center',
  },
  progressTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    zIndex: 1,
    overflow: 'hidden',
  },
});
