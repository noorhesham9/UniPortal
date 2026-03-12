import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>أهلاً بك يا طالب</Text>
        <Text style={styles.subText}>متابعة حالتك الأكاديمية</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>المعدل التراكمي (GPA)</Text>
          <Text style={styles.statValue}>3.5</Text>
          {/* هنا هيسمع الـ gpa من الـ User model  */}
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>الساعات المنجزة</Text>
          <Text style={styles.statValue}>72</Text>
          {/* هنا الـ total_completed_hours  */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { marginBottom: 30, alignItems: "center" },
  welcomeText: { fontSize: 24, fontWeight: "bold" },
  subText: { color: "#666", marginTop: 5 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between" },
  statCard: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 15,
    width: "48%",
    alignItems: "center",
  },
  statLabel: { fontSize: 12, color: "#888" },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    color: "#007AFF",
  },
});
