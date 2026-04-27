import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AlertBanner({ event, onDismiss }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!event) return;

    // Entrance animation
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    // Pulse for critical urgency
    if (event.urgency === 'critical') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Auto-dismiss after delay
    const autoDismissDelay = event.urgency === 'critical' ? 6000 : 4000;
    const timer = setTimeout(() => {
      dismissAlert();
    }, autoDismissDelay);

    return () => {
      clearTimeout(timer);
      pulseAnim.stopAnimation();
    };
  }, [event]);

  const dismissAlert = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss && onDismiss());
  };

  if (!event) return null;

  const isCritical = event.urgency === 'critical';
  const borderColor = event.color || '#FF6B35';

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: fadeAnim },
      ]}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            borderColor,
            shadowColor: borderColor,
          },
          isCritical && styles.criticalCard,
        ]}
      >
        {/* Urgency stripe */}
        <View style={[styles.urgencyStripe, { backgroundColor: borderColor }]} />

        <View style={styles.content}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={[styles.urgencyBadge, { backgroundColor: borderColor + '22', borderColor }]}>
              <Text style={[styles.urgencyText, { color: borderColor }]}>
                {isCritical ? '⚠ ALERT' : event.urgency === 'high' ? '! WARNING' : 'ℹ NOTICE'}
              </Text>
            </View>
            <TouchableOpacity onPress={dismissAlert} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Sound emoji + label */}
          <View style={styles.soundRow}>
            <Text style={styles.emoji}>{event.emoji}</Text>
            <View style={styles.soundInfo}>
              <Text style={styles.soundLabel}>{event.label}</Text>
              <Text style={styles.soundDesc}>{event.description}</Text>
            </View>
          </View>

          {/* Confidence + direction */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>CONFIDENCE</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${event.confidence}%`,
                      backgroundColor: borderColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.metaValue, { color: borderColor }]}>
                {event.confidence}%
              </Text>
            </View>

            {event.direction !== undefined && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>DIRECTION</Text>
                <Text style={styles.directionArrow}>
                  {getDirectionEmoji(event.direction)}
                </Text>
                <Text style={[styles.metaValue, { color: borderColor }]}>
                  {getDirectionLabel(event.direction)}
                </Text>
              </View>
            )}
          </View>

          {/* Dismiss hint */}
          <TouchableOpacity style={[styles.dismissFullBtn, { borderColor }]} onPress={dismissAlert}>
            <Text style={[styles.dismissFullText, { color: borderColor }]}>
              TAP TO DISMISS
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function getDirectionLabel(degrees) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

function getDirectionEmoji(degrees) {
  const arrows = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
  return arrows[Math.round(degrees / 45) % 8];
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#0F1525',
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  criticalCard: {
    backgroundColor: '#130A0A',
  },
  urgencyStripe: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  dismissBtn: {
    padding: 4,
  },
  dismissText: {
    color: '#4A5568',
    fontSize: 18,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 52,
  },
  soundInfo: {
    flex: 1,
  },
  soundLabel: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  soundDesc: {
    color: '#8892A4',
    fontSize: 14,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    color: '#4A5568',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#1E2740',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 4,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  directionArrow: {
    fontSize: 24,
    marginVertical: 2,
  },
  dismissFullBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dismissFullText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
