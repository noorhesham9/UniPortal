import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardScreen from '../../screens/main/DashboardScreen';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <DashboardScreen />
    </SafeAreaView>
  );
}

