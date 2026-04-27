import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import HistoryScreen from './screens/HistoryScreen';

const TABS = [
  { id: 'home', label: '👂', title: 'Listen' },
  { id: 'history', label: '🕐', title: 'History' },
  { id: 'settings', label: '⚙️', title: 'Settings' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [soundHistory, setSoundHistory] = useState([]);
  const [enabledSounds, setEnabledSounds] = useState({
    car_horn: true,
    siren: true,
    dog_bark: true,
    smoke_alarm: true,
    doorbell: true,
    glass_break: true,
    scream: true,
  });

  const addToHistory = (event) => {
    setSoundHistory(prev => [event, ...prev].slice(0, 50));
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            enabledSounds={enabledSounds}
            onSoundDetected={addToHistory}
          />
        );
      case 'history':
        return <HistoryScreen history={soundHistory} />;
      case 'settings':
        return (
          <SettingsScreen
            enabledSounds={enabledSounds}
            onToggle={(key) =>
              setEnabledSounds(prev => ({ ...prev, [key]: !prev[key] }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.screenContainer}>{renderScreen()}</View>
          <View style={styles.tabBar}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
                accessibilityLabel={tab.title}
              >
                <Text style={styles.tabEmoji}>{tab.label}</Text>
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.activeTabLabel,
                  ]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F1525',
    borderTopWidth: 1,
    borderTopColor: '#1E2740',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#1A2340',
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 11,
    color: '#4A5568',
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#4ECDC4',
  },
});
