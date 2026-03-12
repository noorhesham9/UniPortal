import { SafeAreaView } from "react-native-safe-area-context";
import CourseRegistrationScreen from "../../screens/main/CourseRegistrationScreen";

export default function RegistrationRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <CourseRegistrationScreen />
    </SafeAreaView>
  );
}
