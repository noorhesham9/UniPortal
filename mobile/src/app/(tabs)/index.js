import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../context/ThemeContext";
import DashboardScreen from "../../screens/main/DashboardScreen";

export default function HomeScreen() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <DashboardScreen />
    </SafeAreaView>
  );
}
