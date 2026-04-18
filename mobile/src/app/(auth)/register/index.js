import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../../store/slices/authSlice";
import { useAppTheme } from "../../../context/ThemeContext";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [StudentID, setStudentID] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );
  const { theme: t } = useAppTheme();

  // التحقق من token - إذا كان المستخدم مسجل دخول بالفعل ، يتم إعادة توجيهه إلى Profile
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !StudentID) {
      Alert.alert("Required Fields", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords Don't Match",
        "Make sure both passwords are identical",
      );
      return;
    }

    if (!agreeTerms) {
      Alert.alert(
        "Terms Agreement",
        "Please agree to the Terms of Service and Privacy Policy",
      );
      return;
    }

    const result = await dispatch(
      registerUser({ email, password, name, StudentID }),
    );

    if (registerUser.fulfilled.match(result)) {
      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully",
      );
      router.replace("/(tabs)");
    } else {
      Alert.alert("Registration Error", error || "An error occurred");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: t.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="school"
              size={60}
              color={t.accent}
              style={styles.icon}
            />
            <Text style={[styles.title, { color: t.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: t.textSub }]}>
              Join the University Portal to manage your academic journey
            </Text>
          </View>

          <View style={styles.form}>
            {[
              {
                label: "STUDENT ID",
                icon: "card",
                ph: "Ex: 32-2024",
                val: StudentID,
                set: setStudentID,
                kb: "default",
              },
              {
                label: "FULL NAME",
                icon: "person",
                ph: "Ex: Jane Doe",
                val: name,
                set: setName,
                kb: "default",
              },
              {
                label: "UNIVERSITY EMAIL",
                icon: "mail",
                ph: "student@university.edu",
                val: email,
                set: setEmail,
                kb: "email-address",
              },
            ].map(({ label, icon, ph, val, set, kb }) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={[styles.label, { color: t.text }]}>{label}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: t.input, borderColor: t.inputBorder },
                  ]}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={t.textSub}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: t.text }]}
                    placeholder={ph}
                    placeholderTextColor={t.textMuted}
                    keyboardType={kb}
                    value={val}
                    onChangeText={set}
                    editable={!loading}
                  />
                </View>
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.text }]}>
                YOUR PASSWORD
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: t.input, borderColor: t.inputBorder },
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={t.textSub}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: t.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={t.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={t.textSub}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.text }]}>
                CONFIRM PASSWORD
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: t.input, borderColor: t.inputBorder },
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={t.textSub}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: t.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={t.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={t.textSub}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.termsContainer}>
              <TouchableOpacity
                onPress={() => setAgreeTerms(!agreeTerms)}
                style={styles.checkbox}
              >
                <Ionicons
                  name={agreeTerms ? "checkbox" : "square-outline"}
                  size={20}
                  color={agreeTerms ? t.accent : t.textSub}
                />
              </TouchableOpacity>
              <Text style={[styles.termsText, { color: t.textSub }]}>
                I agree to the{" "}
                <Text style={[styles.termsLink, { color: t.accent }]}>
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text style={[styles.termsLink, { color: t.accent }]}>
                  Privacy Policy
                </Text>
              </Text>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: t.accent },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={t.accentFg} />
              ) : (
                <Text style={[styles.buttonText, { color: t.accentFg }]}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: t.textSub }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("(auth)/login")}>
                <Text style={[styles.link, { color: t.accent }]}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: { alignItems: "center", marginBottom: 30 },
  icon: { marginBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 12, textAlign: "center" },
  form: { width: "100%" },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 48, fontSize: 14, paddingRight: 10 },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  checkbox: { marginRight: 10 },
  termsText: { fontSize: 13, flex: 1 },
  termsLink: { fontWeight: "600" },
  error: {
    color: "#FCA5A5",
    marginBottom: 16,
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { fontSize: 13 },
  link: { fontSize: 13, fontWeight: "600" },
});
