import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export function Admin() {
  return (
    <View style={styles.container}>
      <Ionicons name="shield" size={80} color="#007AFF" />
      <Text style={styles.title}>صفحة الإدارة</Text>
      <Text style={styles.subtitle}>هذه الصفحة متاحة فقط للمدراء</Text>
      <Text style={styles.subtitle}> Hello admin</Text>
    </View>
  );
}

export default function AdminScreen() {
  return <Admin />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 10,
  },
});
