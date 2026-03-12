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

  // التحقق من token - إذا كان المستخدم مسجل دخول بالفعل ، يتم إعادة توجيهه إلى Profile
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !StudentID) {
      console.log("object not");
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
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="school"
              size={60}
              color="#F59E0B"
              style={styles.icon}
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join the University Portal to manage your academic journey
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>STUDENT ID</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="card"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 32-2024"
                  placeholderTextColor="#6B7280"
                  value={StudentID}
                  onChangeText={setStudentID}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Jane Doe"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>UNIVERSITY EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="student@university.edu"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>YOUR PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
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
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#6B7280"
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
                    color="#9CA3AF"
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
                  color={agreeTerms ? "#F59E0B" : "#6B7280"}
                />
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#1F2937" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("(auth)/login")}>
                <Text style={styles.link}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F9FAFB",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F3F4F6",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: "#F9FAFB",
    paddingRight: 10,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  checkbox: {
    marginRight: 10,
  },
  termsText: {
    fontSize: 13,
    color: "#D1D5DB",
    flex: 1,
  },
  termsLink: {
    color: "#F59E0B",
    fontWeight: "600",
  },
  error: {
    color: "#FCA5A5",
    marginBottom: 16,
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#F59E0B",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  link: {
    color: "#F59E0B",
    fontSize: 13,
    fontWeight: "600",
  },
});
