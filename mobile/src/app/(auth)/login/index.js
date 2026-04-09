import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../../store/slices/authSlice";
import { useAppTheme } from "../../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { theme: t } = useAppTheme();

  const [activeTab, setActiveTab] = useState("login");

  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  // استرجاع آخر مكان كان فيه المستخدم عند الريفرش
  useEffect(() => {
    const loadLastTab = async () => {
      try {
        const savedTab = await AsyncStorage.getItem("lastLoginTab");
        if (savedTab) setActiveTab(savedTab);
      } catch (e) {
        console.log("Error loading saved tab", e);
      }
    };
    loadLastTab();
  }, []);

  const handleTabChange = async (tabName) => {
    setActiveTab(tabName);
    try {
      await AsyncStorage.setItem("lastLoginTab", tabName);
    } catch (e) {
      console.log("Error saving tab", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) router.replace("(tabs)");
  }, [isAuthenticated]);

  const handleGoogleLogin = async () => {};

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Required Fields", "Please fill in all fields");
      return;
    }
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      await AsyncStorage.removeItem("lastLoginTab");
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Error", error || "An error occurred");
    }
  };

  // ─── محتوى صفحة تسجيل الدخول (بدون أي تعديل نهائياً) ──────────────────────
  const LoginContent = () => (
    <View
      style={[styles.card, { backgroundColor: t.card, shadowColor: t.shadow }]}
    >
      <View style={styles.cardHeader}>
        <Ionicons
          name="school"
          size={80}
          color={t.accent}
          style={styles.logoIcon}
        />
        <Text style={[styles.title, { color: t.text }]}>University Portal</Text>
        <Text style={[styles.subtitle, { color: t.textSub }]}>
          Secure Access Login
        </Text>
        <Text style={[styles.welcomeText, { color: t.text }]}>
          Welcome Back
        </Text>
        <Text style={[styles.instructionText, { color: t.textSub }]}>
          Please sign in to continue.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: t.text }]}>
            Student ID or Email
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: t.input, borderColor: t.inputBorder },
            ]}
          >
            <Ionicons
              name="person"
              size={20}
              color={t.textSub}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: t.text }]}
              placeholder="Enter your ID or email"
              placeholderTextColor={t.textMuted}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: t.text }]}>Password</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/forget-password")}
            >
              <Text style={[styles.forgotLink, { color: t.accent }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
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
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={t.textSub}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rememberMe}>
          <TouchableOpacity
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.checkbox}
          >
            <Ionicons
              name={rememberMe ? "checkbox" : "square-outline"}
              size={20}
              color={t.accent}
            />
          </TouchableOpacity>
          <Text style={[styles.checkboxText, { color: t.textSub }]}>
            Remember me on this device
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[
            styles.loginBtn,
            { backgroundColor: t.accent },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={t.accentFg} />
          ) : (
            <Text style={[styles.buttonText, { color: t.accentFg }]}>
              Log In
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleBtn, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={styles.googleBtnText}>Log In with Google</Text>
        </TouchableOpacity>

        <View style={styles.newStudent}>
          <Text style={[styles.newStudentText, { color: t.textSub }]}>
            New student?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={[styles.highlight, { color: t.accent }]}>
              Activate your account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ─── محتوى الأخبار والإعلانات المدمج ──────────────────────────
  const UpdatesContent = () => {
    const today = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
      <View style={[styles.card, { backgroundColor: t.card, shadowColor: t.shadow }]}>
        <Text style={[styles.title, { color: t.text, textAlign: "center" }]}>News & Ads </Text>
        <Text style={[styles.subtitle, { color: t.accent, textAlign: "center", marginBottom: 20 }]}>أخبار وإعلانات</Text>

        <View style={{ marginBottom: 20 }}>
          {[
            { en: "Semester results announced.", ar: "تم إعلان نتائج الفصل الدراسي." },
            { en: "Tuition fees via Fawry.", ar: "دفع المصروفات متاح عبر فوري." },
          ].map((item, index) => (
            <View key={index} style={[styles.newsCard, { borderLeftColor: t.accent }]}>
              <Text style={[styles.newsTextEn, { color: t.text }]}>{item.en}</Text>
              <Text style={[styles.newsTextAr, { color: t.textSub }]}>{item.ar}</Text>
              <Text style={styles.dateLabel}>📅 {today} - {item.time}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: t.inputBorder, marginBottom: 20 }} />

        <View>
          <Image source={{ uri: "https://science-cairo.com/HomePageAdverticements/1328.jpg" }} style={styles.flexibleImage} resizeMode="contain" />
          <Text style={styles.dateLabelCenter}> بتاريخ: {today}</Text>

          <View style={{ height: 25 }} />

          <Image source={{ uri: "https://science-cairo.com/HomePageAdverticements/1326.jpg" }} style={styles.flexibleImage} resizeMode="contain" />
          <Text style={styles.dateLabelCenter}> بتاريخ: {today}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: t.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "login" ? <LoginContent /> : <UpdatesContent />}

        {activeTab === "login" && (
          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: t.textSub }]}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: t.textSub }]}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.copyright, { color: t.textMuted }]}>© 2026 University Portal. All rights reserved.</Text>
          </View>
        )}
      </ScrollView>

      {/* البار السفلي النحيف جداً بخيارين فقط */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: t.card, borderTopColor: t.inputBorder },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabChange("updates")}
        >
          <Ionicons
            name="megaphone"
            size={18}
            color={activeTab === "updates" ? t.accent : t.textSub}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === "updates" ? t.accent : t.textSub },
            ]}
          >
           News & Ads
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabChange("login")}
        >
          <Ionicons
            name="log-in"
            size={18}
            color={activeTab === "login" ? t.accent : t.textSub}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === "login" ? t.accent : t.textSub },
            ]}
          >
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 60,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: { alignItems: "center", marginBottom: 30 },
  logoIcon: { marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  welcomeText: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  instructionText: { fontSize: 14, marginBottom: 20 },
  form: { width: "100%" },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  forgotLink: { fontSize: 12, textDecorationLine: "underline" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16 },
  eyeIcon: { padding: 5 },
  rememberMe: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  checkbox: { marginRight: 10 },
  checkboxText: { fontSize: 14 },
  error: {
    color: "#ff3b30",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  loginBtn: {
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  googleBtn: {
    backgroundColor: "#4285F4",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: "600" },
  googleBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  newStudent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  newStudentText: { fontSize: 14 },
  highlight: { fontSize: 14, fontWeight: "600" },
  footer: { marginTop: 30, alignItems: "center" },
  footerLinks: { flexDirection: "row", marginBottom: 10 },
  footerLink: {
    fontSize: 12,
    marginHorizontal: 10,
    textDecorationLine: "underline",
  },
  copyright: { fontSize: 12 },

  // البار النحيف
  bottomBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    height: 45,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === "ios" ? 10 : 0,
  },
  tabItem: { alignItems: "center", flex: 1, justifyContent: "center" },
  tabLabel: { fontSize: 9, marginTop: 1, fontWeight: "500" },

  // الأخبار والتحديثات
  newsCard: { padding: 12, borderLeftWidth: 4, backgroundColor: "rgba(0,0,0,0.02)", marginBottom: 10, borderRadius: 8 },
  newsTextEn: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  newsTextAr: { fontSize: 12, textAlign: "right", lineHeight: 18 },
  dateLabel: { fontSize: 9, color: "#888", marginTop: 5 },
  dateLabelCenter: { fontSize: 9, color: "#888", textAlign: "center", marginTop: 3 },
  flexibleImage: { width: "85%", aspectRatio: 16 / 9, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.05)", alignSelf: "center" },
});