import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../store/slices/authSlice";
import { useAppTheme } from "../../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export function Profile() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { theme: t } = useAppTheme();

  const handleLogout = async () => {
    dispatch(logoutUser());
    // Navigation handled by TabLayout's useEffect when isAuthenticated becomes false
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <Image
        source={
          user?.profilePhoto?.url
            ? { uri: user.profilePhoto.url }
            : {
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "S")}&background=facc15&color=0f172a&size=120`,
              }
        }
        style={styles.image}
      />

      <Text style={[styles.name, { color: t.text }]}>
        {user?.name || "Student"}
      </Text>
      <Text style={[styles.sub, { color: t.textSub }]}>
        {user?.email || "email@university.edu"}
      </Text>
      {user?.studentId && (
        <Text style={[styles.sub, { color: t.textSub }]}>
          ID: {user.studentId}
        </Text>
      )}
      {user?.level && (
        <Text style={[styles.sub, { color: t.textSub }]}>
          Level: {user.level}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.btn,
          { backgroundColor: t.cardAlt, borderColor: t.border },
        ]}
        onPress={() => router.push("/(screens)/settings")}
      >
        <Ionicons name="settings-outline" size={18} color={t.textSub} />
        <Text style={[styles.btnText, { color: t.text }]}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.btn,
          { backgroundColor: t.cardAlt, borderColor: t.border },
        ]}
        onPress={() => router.push("/(screens)/contact")}
      >
        <Ionicons name="mail-outline" size={18} color={t.textSub} />
        <Text style={[styles.btnText, { color: t.text }]}>Contact Us</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ProfileScreen() {
  return <Profile />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  sub: { fontSize: 14, marginBottom: 4 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "70%",
    marginVertical: 6,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnText: { fontSize: 15, fontWeight: "500" },
});
