import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { logoutUser } from "../../../store/slices/authSlice"; // تأكد من المسار

export default function SettingsScreen() {
  const [isNotifications, setIsNotifications] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

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

  const SettingItem = ({
    icon,
    title,
    value,
    onValueChange,
    isSwitch,
    onPress,
    subTitle,
  }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={isSwitch}>
      <View style={styles.leftSection}>
        <Ionicons name={icon} size={22} color="#555" style={styles.icon} />
        <View>
          <Text style={styles.rowText}>{title}</Text>
          {subTitle && <Text style={styles.subText}>{subTitle}</Text>}
        </View>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#ddd", true: "#007AFF" }}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>العامة</Text>
      <View style={styles.card}>
        <SettingItem
          icon="notifications-outline"
          title="التنبيهات"
          isSwitch
          value={isNotifications}
          onValueChange={setIsNotifications}
        />
        <SettingItem
          icon="moon-outline"
          title="الوضع الليلي"
          isSwitch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
        />
        <SettingItem
          icon="language-outline"
          title="اللغة"
          subTitle="العربية"
          onPress={() => console.log("Change Language")}
        />
      </View>

      <Text style={styles.sectionTitle}>الحساب</Text>
      <View style={styles.card}>
        <SettingItem
          icon="lock-closed-outline"
          title="تغيير كلمة المرور"
          onPress={() => router.push("/(screens)/reset-password")}
        />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  sectionTitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "right",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row-reverse", // عشان العربي
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: "#E5E5EA",
  },
  leftSection: { flexDirection: "row-reverse", alignItems: "center" },
  icon: { marginLeft: 12 },
  rowText: { fontSize: 16, color: "#000", textAlign: "right" },
  subText: { fontSize: 12, color: "#8E8E93", textAlign: "right" },
  logoutBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 15,
    marginTop: 5,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
});
