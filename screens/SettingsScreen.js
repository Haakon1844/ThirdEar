import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SOUND_TYPES } from '../hooks/useSoundDetection';

const URGENCY_COLORS = {
  critical: '#FF2D55',
  high: '#FF6B35',
  medium: '#FFB800',
  low: '#4ECDC4',
};

export default function SettingsScreen({ enabledSounds, onToggle }) {
  const allEnabled = Object.values(enabledSounds).every(Boolean);
  const noneEnabled = Object.values(enabledSounds).every(v => !v);

  const toggleAll = (value) => {
    Object.keys(enabledSounds).forEach(key => {
      if (enabledSounds[key] !== value) onToggle(key);
    });
  };

  const groupedSounds = {
    critical: Object.entries(SOUND_TYPES).filter(([, v]) => v.urgency === 'critical'),
    high: Object.entries(SOUND_TYPES).filter(([, v]) => v.urgency === 'high'),
    medium: Object.entries(SOUND_TYPES).filter(([, v]) => v.urgency === 'medium'),
    low: Object.entries(SOUND_TYPES).filter(([, v]) => v.urgency === 'low'),
  };

  const urgencyLabels = {
    critical: '🔴 Critical',
    high: '🟠 High Priority',
    medium: '🟡 Medium',
    low: '🟢 Low',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Quick actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={[styles.quickBtn, allEnabled && styles.quickBtnActive]}
            onPress={() => toggleAll(true)}
          >
            <Text style={[styles.quickBtnText, allEnabled && styles.quickBtnTextActive]}>
              Enable All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, noneEnabled && styles.quickBtnActive]}
            onPress={() => toggleAll(false)}
          >
            <Text style={[styles.quickBtnText, noneEnabled && styles.quickBtnTextActive]}>
              Disable All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sound groups */}
        {Object.entries(groupedSounds).map(([urgency, sounds]) => {
          if (sounds.length === 0) return null;
          return (
            <View key={urgency} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupLabel}>{urgencyLabels[urgency]}</Text>
                <View style={[styles.urgencyLine, { backgroundColor: URGENCY_COLORS[urgency] }]} />
              </View>

              <View style={styles.groupCard}>
                {sounds.map(([key, sound], idx) => (
                  <View
                    key={key}
                    style={[
                      styles.soundRow,
                      idx < sounds.length - 1 && styles.soundRowBorder,
                    ]}
                  >
                    <Text style={styles.soundEmoji}>{sound.emoji}</Text>
                    <View style={styles.soundInfo}>
                      <Text style={styles.soundLabel}>{sound.label}</Text>
                      <Text style={styles.soundDesc}>{sound.description}</Text>
                    </View>
                    <Switch
                      value={enabledSounds[key] ?? true}
                      onValueChange={() => onToggle(key)}
                      trackColor={{ false: '#1E2740', true: URGENCY_COLORS[urgency] + '55' }}
                      thumbColor={enabledSounds[key] ? URGENCY_COLORS[urgency] : '#2D3748'}
                      ios_backgroundColor="#1E2740"
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Info section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Detection</Text>
          <Text style={styles.infoBody}>
            ThirdEar uses machine learning to identify environmental sounds in real time.
            Disabling sounds you don't need helps reduce false alerts and saves battery.
          </Text>
          <Text style={styles.infoBody}>
            Critical and high-priority sounds trigger screen flash and vibration in addition
            to visual alerts.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 20,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#0F1525',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E2740',
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickBtnActive: {
    borderColor: '#4ECDC4',
    backgroundColor: '#0A1F1E',
  },
  quickBtnText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '700',
  },
  quickBtnTextActive: {
    color: '#4ECDC4',
  },
  group: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 4,
  },
  groupLabel: {
    color: '#8892A4',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  urgencyLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  groupCard: {
    backgroundColor: '#0F1525',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2740',
    overflow: 'hidden',
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  soundRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1A2035',
  },
  soundEmoji: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  soundInfo: {
    flex: 1,
  },
  soundLabel: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
  },
  soundDesc: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: '#0F1525',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2740',
    padding: 16,
    gap: 10,
  },
  infoTitle: {
    color: '#8892A4',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  infoBody: {
    color: '#4A5568',
    fontSize: 13,
    lineHeight: 19,
  },
});
