import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updatePasswordThunk } from "../../../store/slices/authSlice";
import { useAppTheme } from "../../../context/ThemeContext";

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector((state) => state.auth);
  const { theme: t } = useAppTheme();

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) { Alert.alert("خطأ", "يرجى ملء جميع الحقول"); return; }
    if (newPassword !== confirmPassword) { Alert.alert("خطأ", "كلمات المرور غير متطابقة"); return; }
    try {
      await dispatch(updatePasswordThunk(newPassword)).unwrap();
      Alert.alert("نجح", "تم تحديث كلمة المرور بنجاح");
      router.back();
    } catch (error) {
      Alert.alert("خطأ", error);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: t.bg }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="key-outline" size={80} color={t.accent} />
          <Text style={[styles.title, { color: t.text }]}>تغيير كلمة المرور</Text>
          <Text style={[styles.subtitle, { color: t.textSub }]}>أدخل كلمة المرور الجديدة ثم أكدها</Text>
        </View>

        <View style={styles.form}>
          {[
            { val: newPassword, set: setNewPassword, ph: "كلمة المرور الجديدة" },
            { val: confirmPassword, set: setConfirmPassword, ph: "تأكيد كلمة المرور" },
          ].map(({ val, set, ph }) => (
            <View key={ph} style={[styles.inputContainer, { backgroundColor: t.input, borderColor: t.inputBorder, borderWidth: 1 }]}>
              <Ionicons name="lock-closed-outline" size={20} color={t.textSub} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: t.text }]} placeholder={ph} placeholderTextColor={t.textMuted} value={val} onChangeText={set} secureTextEntry />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: t.accent }, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: t.accentFg }]}>
              {loading ? "جاري الإعادة..." : "إعادة تعيين كلمة المرور"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={t.accent} />
          <Text style={[styles.backText, { color: t.accent }]}>العودة</Text>
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
  button:          { borderRadius: 12, height: 50, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonDisabled:  { opacity: 0.6 },
  buttonText:      { fontSize: 18, fontWeight: "600" },
  backButton:      { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20 },
  backText:        { fontSize: 16, marginLeft: 5 },
});
