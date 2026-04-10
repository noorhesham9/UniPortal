import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { forgetPassword } from "../../../store/slices/authSlice";
import { useAppTheme } from "../../../context/ThemeContext";

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector((state) => state.auth);
  const { theme: t } = useAppTheme();

  const handleForgetPassword = async () => {
    if (!email) { Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني"); return; }
    try {
      await dispatch(forgetPassword(email)).unwrap();
      Alert.alert("نجح", "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("خطأ", error);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: t.bg }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="lock-closed-outline" size={80} color={t.accent} />
          <Text style={[styles.title, { color: t.text }]}>نسيت كلمة المرور؟</Text>
          <Text style={[styles.subtitle, { color: t.textSub }]}>
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: t.input, borderColor: t.inputBorder, borderWidth: 1 }]}>
            <Ionicons name="mail-outline" size={20} color={t.textSub} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: t.text }]}
              placeholder="البريد الإلكتروني"
              placeholderTextColor={t.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: t.accent }, loading && styles.buttonDisabled]}
            onPress={handleForgetPassword}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: t.accentFg }]}>
              {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={t.accent} />
          <Text style={[styles.backText, { color: t.accent }]}>العودة إلى تسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  header:          { alignItems: "center", marginBottom: 40 },
  title:           { fontSize: 24, fontWeight: "bold", marginTop: 20 },
  subtitle:        { fontSize: 16, textAlign: "center", marginTop: 10 },
  form:            { marginBottom: 30 },
  inputContainer:  { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 50 },
  inputIcon:       { marginRight: 10 },
  input:           { flex: 1, fontSize: 16 },
  button:          { borderRadius: 12, height: 50, justifyContent: "center", alignItems: "center" },
  buttonDisabled:  { opacity: 0.6 },
  buttonText:      { fontSize: 18, fontWeight: "600" },
  backButton:      { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20 },
  backText:        { fontSize: 16, marginLeft: 5 },
});
