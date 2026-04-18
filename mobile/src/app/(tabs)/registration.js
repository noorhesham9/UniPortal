import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../context/ThemeContext";
import CourseRegistrationScreen from "../../screens/main/CourseRegistrationScreen";

export default function RegistrationRoute() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <CourseRegistrationScreen />
    </SafeAreaView>
  );
}
