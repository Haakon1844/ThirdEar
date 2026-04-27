import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSoundDetection, SOUND_TYPES } from '../hooks/useSoundDetection';
import AlertBanner from '../components/AlertBanner';
import SoundCard from '../components/SoundCard';

const { width } = Dimensions.get('window');

export default function HomeScreen({ enabledSounds, onSoundDetected }) {
  const [isListening, setIsListening] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);

  // Animated values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.3)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const alertFlash = useRef(new Animated.Value(0)).current;

  const handleDetected = (event) => {
    // Add to local recent list
    setRecentEvents(prev => [event, ...prev].slice(0, 5));

    // Notify parent
    onSoundDetected(event);

    // Show alert banner
    setActiveAlert(event);

    // Flash screen for critical
    if (event.urgency === 'critical' || event.urgency === 'high') {
      Animated.sequence([
        Animated.timing(alertFlash, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(alertFlash, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(alertFlash, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(alertFlash, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }

    // Vibrate based on urgency
    if (event.urgency === 'critical') {
      Vibration.vibrate([0, 200, 100, 200, 100, 400]);
    } else if (event.urgency === 'high') {
      Vibration.vibrate([0, 300, 100, 200]);
    } else {
      Vibration.vibrate(150);
    }
  };

  useSoundDetection({
    enabledSounds,
    onDetected: handleDetected,
    isListening,
  });

  // Listening pulse animation
  useEffect(() => {
    let pulseLoop;
    let rippleLoop;

    if (isListening) {
      // Inner pulse
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          ]),
        ])
      );
      pulseLoop.start();

      // Ripple rings — staggered
      const runRipple = (anim, delay) => {
        return setTimeout(() => {
          Animated.loop(
            Animated.timing(anim, {
              toValue: 1,
              duration: 2200,
              useNativeDriver: true,
            })
          ).start();
        }, delay);
      };

      const t1 = runRipple(ripple1, 0);
      const t2 = runRipple(ripple2, 700);
      const t3 = runRipple(ripple3, 1400);

      return () => {
        pulseLoop.stop();
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        ripple1.stopAnimation(() => ripple1.setValue(0));
        ripple2.stopAnimation(() => ripple2.setValue(0));
        ripple3.stopAnimation(() => ripple3.setValue(0));
      };
    } else {
      pulseAnim.setValue(1);
      pulseOpacity.setValue(0.3);
      ripple1.setValue(0);
      ripple2.setValue(0);
      ripple3.setValue(0);
    }
  }, [isListening]);

  const toggleListening = () => {
    Animated.spring(btnScale, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start(() => {
      Animated.spring(btnScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
    setIsListening(prev => !prev);
    if (isListening) setActiveAlert(null);
  };

  const rippleStyle = (anim) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.2, 0] }),
  });

  const enabledCount = Object.values(enabledSounds).filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Screen flash overlay for alerts */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.flashOverlay,
          {
            opacity: alertFlash,
            backgroundColor: activeAlert?.color || '#FF2D55',
          },
        ]}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>ThirdEar</Text>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isListening ? '#4ECDC4' : '#2D3748' },
              ]}
            />
            <Text style={[styles.statusText, { color: isListening ? '#4ECDC4' : '#4A5568' }]}>
              {isListening ? 'Listening' : 'Idle'}
            </Text>
          </View>
        </View>

        {/* Main orb + ripples */}
        <View style={styles.orbSection}>
          {/* Ripple rings */}
          {isListening && (
            <>
              <Animated.View style={[styles.rippleRing, rippleStyle(ripple1)]} />
              <Animated.View style={[styles.rippleRing, rippleStyle(ripple2)]} />
              <Animated.View style={[styles.rippleRing, rippleStyle(ripple3)]} />
            </>
          )}

          {/* Orb button */}
          <Animated.View
            style={[
              styles.orbOuter,
              {
                transform: [{ scale: Animated.multiply(btnScale, pulseAnim) }],
                opacity: isListening ? Animated.add(pulseOpacity, 0.4) : 0.8,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.orbInner}
              onPress={toggleListening}
              activeOpacity={0.85}
              accessibilityLabel={isListening ? 'Stop listening' : 'Start listening'}
              accessibilityRole="button"
            >
              <Text style={styles.orbIcon}>{isListening ? '👂' : '🔇'}</Text>
              <Text style={styles.orbLabel}>
                {isListening ? 'LISTENING' : 'TAP TO START'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Status card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>{enabledCount}</Text>
              <Text style={styles.infoLabel}>Sounds{'\n'}Active</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>{recentEvents.length}</Text>
              <Text style={styles.infoLabel}>Detected{'\n'}This Session</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoNumber, { color: isListening ? '#4ECDC4' : '#2D3748' }]}>
                {isListening ? 'ON' : 'OFF'}
              </Text>
              <Text style={styles.infoLabel}>Mic{'\n'}Status</Text>
            </View>
          </View>
        </View>

        {/* Recent detections */}
        {recentEvents.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>RECENT DETECTIONS</Text>
            {recentEvents.map(event => (
              <SoundCard key={event.id} event={event} compact />
            ))}
          </View>
        )}

        {/* Empty state */}
        {recentEvents.length === 0 && isListening && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎧</Text>
            <Text style={styles.emptyText}>Monitoring your environment...</Text>
            <Text style={styles.emptySubtext}>
              Alerts will appear here when sounds are detected
            </Text>
          </View>
        )}

        {!isListening && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💤</Text>
            <Text style={styles.emptyText}>Sound detection is off</Text>
            <Text style={styles.emptySubtext}>
              Tap the button above to start monitoring
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Alert overlay */}
      {activeAlert && (
        <AlertBanner
          event={activeAlert}
          onDismiss={() => setActiveAlert(null)}
        />
      )}
    </View>
  );
}

const ORB_SIZE = width * 0.48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 500,
    pointerEvents: 'none',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F1525',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2740',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Orb section
  orbSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.7,
    marginVertical: 10,
  },
  rippleRing: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 1.5,
    borderColor: '#4ECDC4',
  },
  orbOuter: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: '#0F1F3D',
    borderWidth: 2,
    borderColor: '#1E3A6E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  orbInner: {
    alignItems: 'center',
    gap: 8,
  },
  orbIcon: {
    fontSize: 52,
  },
  orbLabel: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  // Info card
  infoCard: {
    backgroundColor: '#0F1525',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2740',
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoNumber: {
    color: '#4ECDC4',
    fontSize: 28,
    fontWeight: '800',
  },
  infoLabel: {
    color: '#4A5568',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 15,
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#1E2740',
  },

  // Recent section
  recentSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#2D3748',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginHorizontal: 20,
    marginBottom: 10,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#2D3748',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
