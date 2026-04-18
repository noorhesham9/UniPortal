import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../context/ThemeContext";
import Settings from "../(screens)/settings/index";

export default function SettingsRoute() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <Settings />
    </SafeAreaView>
  );
}
