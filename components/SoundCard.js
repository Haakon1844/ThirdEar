import { View, Text, StyleSheet } from 'react-native';

export default function SoundCard({ event, compact = false }) {
  const timeStr = formatTime(event.timestamp);
  const isCritical = event.urgency === 'critical';
  const isHigh = event.urgency === 'high';

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={[styles.accentBar, { backgroundColor: event.color }]} />
      <View style={styles.emojiCol}>
        <Text style={[styles.emoji, compact && styles.compactEmoji]}>
          {event.emoji}
        </Text>
      </View>
      <View style={styles.infoCol}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{event.label}</Text>
          {(isCritical || isHigh) && (
            <View style={[styles.urgencyDot, { backgroundColor: event.color }]} />
          )}
        </View>
        {!compact && (
          <Text style={styles.desc} numberOfLines={1}>
            {event.description}
          </Text>
        )}
        <Text style={styles.time}>{timeStr}</Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.confidence, { color: event.color }]}>
          {event.confidence}%
        </Text>
        <Text style={styles.dirLabel}>
          {getDirectionLabel(event.direction)}
        </Text>
      </View>
    </View>
  );
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
}

function getDirectionLabel(degrees) {
  if (degrees === undefined) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#0F1525',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 5,
    overflow: 'hidden',
    alignItems: 'center',
  },
  compactCard: {
    marginVertical: 3,
    marginHorizontal: 12,
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
  },
  emojiCol: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  emoji: {
    fontSize: 28,
  },
  compactEmoji: {
    fontSize: 22,
  },
  infoCol: {
    flex: 1,
    paddingVertical: 12,
    gap: 3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '700',
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  desc: {
    color: '#4A5568',
    fontSize: 12,
  },
  time: {
    color: '#2D3748',
    fontSize: 11,
    fontWeight: '500',
  },
  rightCol: {
    paddingHorizontal: 14,
    alignItems: 'flex-end',
    gap: 4,
  },
  confidence: {
    fontSize: 14,
    fontWeight: '800',
  },
  dirLabel: {
    color: '#2D3748',
    fontSize: 12,
    fontWeight: '600',
  },
});
