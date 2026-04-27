import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import SoundCard from '../components/SoundCard';

const URGENCY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function HistoryScreen({ history }) {
  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No sounds detected yet</Text>
          <Text style={styles.emptySubtext}>
            Start listening on the home screen to see your detection history here
          </Text>
        </View>
      </View>
    );
  }

  const criticalCount = history.filter(e => e.urgency === 'critical').length;
  const highCount = history.filter(e => e.urgency === 'high').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.count}>{history.length} events</Text>
      </View>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryChip, { borderColor: '#FF2D55' }]}>
          <Text style={[styles.summaryNum, { color: '#FF2D55' }]}>{criticalCount}</Text>
          <Text style={styles.summaryLabel}>Critical</Text>
        </View>
        <View style={[styles.summaryChip, { borderColor: '#FF6B35' }]}>
          <Text style={[styles.summaryNum, { color: '#FF6B35' }]}>{highCount}</Text>
          <Text style={styles.summaryLabel}>High</Text>
        </View>
        <View style={[styles.summaryChip, { borderColor: '#4A5568' }]}>
          <Text style={[styles.summaryNum, { color: '#8892A4' }]}>
            {history.length - criticalCount - highCount}
          </Text>
          <Text style={styles.summaryLabel}>Other</Text>
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <SoundCard event={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  count: {
    color: '#4A5568',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: '#0F1525',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  summaryNum: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    color: '#4A5568',
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    color: '#4A5568',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#2D3748',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
