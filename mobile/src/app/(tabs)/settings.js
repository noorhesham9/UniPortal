import { SafeAreaView } from "react-native-safe-area-context";
import Settings from "../(screens)/settings/index";

export default function RegistrationRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Settings />
    </SafeAreaView>
  );
}
