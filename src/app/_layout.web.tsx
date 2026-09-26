import { ScrollView, Text } from 'react-native';

export default function WebLayout() {
  return <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 }} style={{ backgroundColor: '#F7F8F3' }}>
    <Text style={{ fontSize: 44 }}>🌱</Text>
    <Text selectable style={{ fontSize: 28, fontWeight: '600', color: '#253229' }}>Habit Tracker</Text>
    <Text selectable style={{ maxWidth: 380, textAlign: 'center', fontSize: 17, lineHeight: 26, color: '#667168' }}>Open the app on iOS or Android to start tracking. Your habits and progress are saved on your phone.</Text>
  </ScrollView>;
}
