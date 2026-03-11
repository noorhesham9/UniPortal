import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, Switch, Platform, KeyboardAvoidingView,
  ActivityIndicator, Alert 
} from 'react-native';
import { MaxContentWidth } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { courseAPI } from '@/utils/api';
import { useRouter } from 'expo-router';

const THEME_COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  inputBg: '#0F172A',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  primary: '#EBB72F',
  border: '#334155',
  danger: '#7F1D1D',
  dangerText: '#F87171'
};

export default function EditCourseScreen() {
  const router = useRouter();
  const COURSE_ID = 'CS-402';

  // 1. States للتحكم في كل خانات الديزاين
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [department, setDepartment] = useState("");
  const [credits, setCredits] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isLabIncluded, setIsLabIncluded] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 2. سحب البيانات عند الفتح
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getCourseById(COURSE_ID);
        const data = response.data;
        
        setCourseName(data.name || "");
        setCourseCode(data.code || "");
        setDepartment(data.department || "Computer Science & Engineering");
        setCredits(String(data.credits || "4"));
        setDescription(data.description || "");
        setIsActive(data.isActive ?? true);
        setIsLabIncluded(data.isLabIncluded ?? true);
      } catch (error) {
        console.error("Fetch Error:", error);
        Alert.alert("خطأ", "مش عارف أجيب بيانات الكورس");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, []);

  // 3. حفظ التعديلات
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await courseAPI.updateCourse(COURSE_ID, {
        name: courseName,
        code: courseCode,
        department,
        credits: Number(credits),
        description,
        isActive,
        isLabIncluded
      });
      Alert.alert("عاش يا مو", "تم تحديث البيانات بنجاح");
    } catch (error) {
      Alert.alert("فشل", "حصلت مشكلة في الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <View style={[styles.mainContainer, styles.centered, { backgroundColor: THEME_COLORS.background }]}>
      <ActivityIndicator size="large" color={THEME_COLORS.primary} />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.mainContainer, { backgroundColor: THEME_COLORS.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: THEME_COLORS.text }]}>Edit Course</Text>
              <Text style={[styles.subtitle, { color: THEME_COLORS.textSecondary }]}>
                Update the curriculum and administrative details for this unit.
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={() => router.back()} style={[styles.cancelBtn, { borderColor: THEME_COLORS.border }]}>
                <Text style={{ color: THEME_COLORS.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: THEME_COLORS.primary, opacity: isSaving ? 0.7 : 1 }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gridContainer}>
            {/* Identification Card */}
            <View style={[styles.card, { backgroundColor: THEME_COLORS.card, borderColor: THEME_COLORS.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={20} color={THEME_COLORS.primary} />
                <Text style={[styles.cardTitle, { color: THEME_COLORS.text }]}>Course Identification</Text>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: THEME_COLORS.text }]}>Course Name</Text>
                  <TextInput style={styles.input} value={courseName} onChangeText={setCourseName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: THEME_COLORS.text }]}>Course Code</Text>
                  <TextInput style={styles.input} value={courseCode} onChangeText={setCourseCode} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: THEME_COLORS.text }]}>Department</Text>
                  <TextInput style={styles.input} value={department} onChangeText={setDepartment} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: THEME_COLORS.text }]}>Credits</Text>
                  <TextInput style={styles.input} value={credits} onChangeText={setCredits} keyboardType="numeric" />
                </View>
              </View>
            </View>

            {/* Description Card */}
            <View style={[styles.card, { backgroundColor: THEME_COLORS.card, borderColor: THEME_COLORS.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text" size={20} color={THEME_COLORS.primary} />
                <Text style={[styles.cardTitle, { color: THEME_COLORS.text }]}>Course Description</Text>
              </View>
              <TextInput 
                multiline numberOfLines={4} 
                style={styles.textArea} 
                value={description} onChangeText={setDescription} 
              />
            </View>

            {/* Settings Card */}
            <View style={[styles.card, { backgroundColor: THEME_COLORS.card, borderColor: THEME_COLORS.border }]}>
              <Text style={[styles.cardTitle, { color: THEME_COLORS.text, marginBottom: 16 }]}>Settings</Text>
              <View style={styles.switchRow}>
                <Text style={[styles.label, { color: THEME_COLORS.text }]}>Active Status</Text>
                <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: THEME_COLORS.primary }} />
              </View>
              <View style={styles.switchRow}>
                <Text style={[styles.label, { color: THEME_COLORS.text }]}>Lab Included</Text>
                <Switch value={isLabIncluded} onValueChange={setIsLabIncluded} trackColor={{ true: THEME_COLORS.primary }} />
              </View>
            </View>

            <TouchableOpacity style={[styles.deleteBtn, { borderColor: THEME_COLORS.danger }]}>
              <Text style={{ color: THEME_COLORS.dangerText, fontWeight: 'bold' }}>Delete Course</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { alignItems: 'center', paddingVertical: 24 },
  contentWrapper: { width: '92%', maxWidth: MaxContentWidth },
  header: { marginBottom: 32, gap: 16, flexDirection: Platform.OS === 'web' ? 'row' : 'column' },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  headerButtons: { flexDirection: 'row', gap: 12 },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, minWidth: 120, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontWeight: 'bold', color: '#000' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderRadius: 8, justifyContent: 'center' },
  gridContainer: { width: '100%', gap: 16 },
  card: { padding: 20, borderRadius: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  inputRow: { gap: 16 },
  inputGroup: { width: '100%' },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  input: { padding: 12, borderRadius: 6, fontSize: 14, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A', color: '#FFF' },
  textArea: { padding: 12, borderRadius: 6, minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A', color: '#FFF' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  deleteBtn: { marginTop: 16, padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, backgroundColor: 'rgba(127, 29, 29, 0.1)' },
});