import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { useAppTheme } from "../../../context/ThemeContext";
import { logoutUser } from "../../../store/slices/authSlice";

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useAppTheme();
  const dispatch = useDispatch();
  const router = useRouter();

  // Dynamic colors based on theme
  const bg       = isDark ? "#0d1b2e" : "#ffffff";
  const cardBg   = isDark ? "#0f172a" : "#ffffff";
  const border   = isDark ? "#1e293b" : "#E5E5EA";
  const text     = isDark ? "#f8fafc" : "#000000";
  const subText  = isDark ? "#94a3b8" : "#8E8E93";
  const iconColor = isDark ? "#94a3b8" : "#555";

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد أنك تريد الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          await dispatch(logoutUser());
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const SettingItem = ({ icon, title, value, onValueChange, isSwitch, onPress, subTitle }) => (
    <TouchableOpacity
      style={[styles.row, { borderColor: border }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.leftSection}>
        <Ionicons name={icon} size={22} color={iconColor} style={styles.icon} />
        <View>
          <Text style={[styles.rowText, { color: text }]}>{title}</Text>
          {subTitle && <Text style={[styles.subText, { color: subText }]}>{subTitle}</Text>}
        </View>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#e2e8f0", true: "#facc15" }}
          thumbColor={value ? "#0f172a" : "#ffffff"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={subText} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.sectionTitle, { color: subText }]}>العامة</Text>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
        <SettingItem
          icon="moon-outline"
          title="الوضع الليلي"
          isSwitch
          value={isDark}
          onValueChange={toggleTheme}
        />
        <SettingItem
          icon="language-outline"
          title="اللغة"
          subTitle="العربية"
          onPress={() => {}}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: subText }]}>الحساب</Text>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
        <SettingItem
          icon="lock-closed-outline"
          title="تغيير كلمة المرور"
          onPress={() => router.push("/(screens)/reset-password")}
        />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: {
    fontSize: 14,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "right",
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
  },
  leftSection: { flexDirection: "row-reverse", alignItems: "center" },
  icon: { marginLeft: 12 },
  rowText: { fontSize: 16, textAlign: "right" },
  subText: { fontSize: 12, textAlign: "right" },
  logoutBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 15,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
});
