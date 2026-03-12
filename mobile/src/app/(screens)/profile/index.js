import { useRouter } from "expo-router";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../store/slices/authSlice";

export function Profile() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/120" }}
        style={styles.image}
      />

      <Text style={styles.name}>{user?.name || "Student"}</Text>
      <Text style={styles.email}>{user?.email || "email@university.edu"}</Text>
      {user?.studentId && (
        <Text style={styles.studentId}>ID: {user.studentId}</Text>
      )}
      {user?.level && <Text style={styles.level}>Level: {user.level}</Text>}

      <View style={styles.button}>
        <Button
          title="Settings"
          onPress={() => router.push("/(screens)/settings")}
        />
      </View>

      <View style={styles.button}>
        <Button
          title="Contact Us"
          onPress={() => router.push("/(screens)/contact")}
        />
      </View>
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
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  logoutIconBtn: {
    padding: 10,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "gray",
    marginBottom: 5,
  },
  studentId: {
    fontSize: 14,
    color: "gray",
    marginBottom: 5,
  },
  level: {
    fontSize: 14,
    color: "gray",
    marginBottom: 20,
  },
  button: {
    width: "70%",
    marginVertical: 5,
  },
});
