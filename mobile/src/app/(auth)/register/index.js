import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../../context/ThemeContext";
import axios from "axios";

const API = "https://uni-portal-blue.vercel.app/api/v1";

export default function RegisterScreen() {
  const { theme: t } = useAppTheme();

  const [step, setStep] = useState("form"); // form | success
  const [loading, setLoading] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [examSeat, setExamSeat] = useState("");
  const [fullName, setFullName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [idCardImage, setIdCardImage] = useState(null); // { uri, name, type }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("إذن مطلوب", "يرجى السماح بالوصول إلى معرض الصور");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.uri.split(".").pop() || "jpg";
      setIdCardImage({
        uri: asset.uri,
        name: `id-card.${ext}`,
        type: `image/${ext}`,
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("إذن مطلوب", "يرجى السماح بالوصول إلى الكاميرا");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setIdCardImage({
        uri: asset.uri,
        name: "id-card.jpg",
        type: "image/jpeg",
      });
    }
  };

  const showImageOptions = () => {
    Alert.alert("رفع صورة البطاقة", "اختر مصدر الصورة", [
      { text: "الكاميرا", onPress: takePhoto },
      { text: "معرض الصور", onPress: pickImage },
      { text: "إلغاء", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (!studentId || !nationalId || !examSeat || !fullName || !personalEmail) {
      Alert.alert("حقول مطلوبة", "يرجى ملء جميع الحقول");
      return;
    }
    if (!idCardImage) {
      Alert.alert("صورة مطلوبة", "يرجى رفع صورة بطاقة الهوية");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("studentId", studentId.trim());
      formData.append("nationalId", nationalId.trim());
      formData.append("examSeatNumber", examSeat.trim());
      formData.append("fullName", fullName.trim());
      formData.append("personalEmail", personalEmail.trim().toLowerCase());
      formData.append("idCardImage", {
        uri: idCardImage.uri,
        name: idCardImage.name,
        type: idCardImage.type,
      });

      await axios.post(`${API}/registration-requests`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStep("success");
    } catch (err) {
      const msg = err.response?.data?.message || "حدث خطأ، حاول مرة أخرى";
      Alert.alert("خطأ", msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: t.bg,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={72} color="#22c55e" />
        <Text style={[styles.title, { color: t.text, marginTop: 16 }]}>
          تم إرسال الطلب
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: t.textSub, textAlign: "center", marginTop: 8 },
          ]}
        >
          تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من بريدك ثم
          انتظار موافقة الإدارة.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.accent, marginTop: 32 }]}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={[styles.buttonText, { color: t.accentFg }]}>
            العودة لتسجيل الدخول
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: t.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="school" size={56} color={t.accent} />
            <Text style={[styles.title, { color: t.text }]}>طلب تسجيل</Text>
            <Text style={[styles.subtitle, { color: t.textSub }]}>
              أدخل بياناتك للتحقق من هويتك وإرسال طلب التسجيل
            </Text>
          </View>

          {[
            {
              label: "رقم الطالب",
              icon: "card-outline",
              ph: "مثال: 2024-10452",
              val: studentId,
              set: setStudentId,
              kb: "default",
            },
            {
              label: "الرقم القومي",
              icon: "finger-print-outline",
              ph: "14 رقم",
              val: nationalId,
              set: setNationalId,
              kb: "numeric",
              max: 14,
            },
            {
              label: "رقم الجلوس",
              icon: "document-text-outline",
              ph: "رقم جلوس الثانوية",
              val: examSeat,
              set: setExamSeat,
              kb: "default",
            },
            {
              label: "الاسم الكامل",
              icon: "person-outline",
              ph: "الاسم كما في الوثائق الرسمية",
              val: fullName,
              set: setFullName,
              kb: "default",
            },
            {
              label: "البريد الإلكتروني الشخصي",
              icon: "mail-outline",
              ph: "example@gmail.com",
              val: personalEmail,
              set: setPersonalEmail,
              kb: "email-address",
            },
          ].map(({ label, icon, ph, val, set, kb, max }) => (
            <View key={label} style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.textSub }]}>{label}</Text>
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
                  maxLength={max}
                  editable={!loading}
                />
              </View>
            </View>
          ))}

          {/* ID Card Image Upload */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.textSub }]}>
              صورة بطاقة الهوية
            </Text>
            <TouchableOpacity
              style={[
                styles.uploadZone,
                {
                  borderColor: idCardImage ? t.accent : t.inputBorder,
                  backgroundColor: t.input,
                },
              ]}
              onPress={showImageOptions}
              disabled={loading}
            >
              {idCardImage ? (
                <View style={styles.imagePreviewWrap}>
                  <Image
                    source={{ uri: idCardImage.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="camera-outline" size={20} color="#fff" />
                    <Text style={styles.imageOverlayText}>تغيير الصورة</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={36}
                    color={t.textSub}
                  />
                  <Text style={[styles.uploadText, { color: t.textSub }]}>
                    اضغط لرفع صورة البطاقة
                  </Text>
                  <Text style={[styles.uploadHint, { color: t.textMuted }]}>
                    من الكاميرا أو معرض الصور
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: t.accent },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={t.accentFg} />
            ) : (
              <Text style={[styles.buttonText, { color: t.accentFg }]}>
                إرسال الطلب
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: t.textSub }]}>
              لديك حساب بالفعل؟{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={[styles.link, { color: t.accent }]}>
                تسجيل الدخول
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { borderRadius: 12, padding: 24, elevation: 8 },
  cardHeader: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: { fontSize: 13, textAlign: "center", marginTop: 6 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 48, fontSize: 14 },
  uploadZone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 10,
    overflow: "hidden",
    minHeight: 120,
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 6,
  },
  uploadText: { fontSize: 14, fontWeight: "500" },
  uploadHint: { fontSize: 11 },
  imagePreviewWrap: { position: "relative" },
  imagePreview: { width: "100%", height: 160 },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    gap: 6,
  },
  imageOverlayText: { color: "#fff", fontSize: 13 },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { fontSize: 13 },
  link: { fontSize: 13, fontWeight: "600" },
});
