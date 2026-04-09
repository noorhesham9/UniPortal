import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TranscriptScreen() {
  const router = useRouter();

  const semesters = [
    {
      title: 'يناير 2026',
      courses: [
        { id: '1', code: 'ر351', score: 72, symbol: 'ج', fails: 0, status: 'ح' },
        { id: '2', code: 'ر411', score: 91, symbol: 'أ', fails: 0, status: 'ح' },
        { id: '3', code: 'ر481', score: 60, symbol: 'د', fails: 0, status: 'ح' },
        { id: '4', code: 'ر212', score: 65, symbol: 'ج', fails: 2, status: 'ح' },     
      ]
    },
    {
      title: 'سبتمبر 2025',
      courses: [
        { id: '5', code: 'ر212', score: 45, symbol: 'ر', fails: 2, status: 'ح' },
        { id: '6', code: 'ر272', score: 96, symbol: 'أ', fails: 1, status: 'ح' },
        { id: '7', code: 'ر232', score: 69, symbol: 'ج', fails: 0, status: 'ح' },
        { id: '8', code: 'س309', score: 41, symbol: 'ر', fails: 1, status: 'ح' },
      ]
    },
    {
      title: 'يناير 2025',
      courses: [
        { id: '9', code: 'ر212', score: 0, symbol: 'غ', fails: 1, status: 'غ' },    
        { id: '10', code: 'ر211', score: 24, symbol: 'ر', fails: 1, status: 'ح' },
        { id: '11', code: 'ر271', score: 55, symbol: 'د', fails: 0, status: 'ح' },
      ]
    },
    
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── الهيدر: الزرار دلوقت على الشمال ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#1a252f" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>السجل الأكاديمي</Text>
        
        <View style={{ width: 40 }} /> {/* موازنة ليبقى العنوان في المنتصف */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {semesters.map((semester, index) => (
          <View key={index} style={styles.semesterSection}>
            <View style={styles.semesterHeader}>
              <Text style={styles.semesterTitle}>● {semester.title}</Text>
            </View>

            {semester.courses.map((course) => {
              const isFail = course.symbol === 'ر' || course.symbol === 'غ';

              return (
                <View key={course.id} style={[styles.card, isFail && styles.failCard]}>
                  <View style={styles.dataGrid}>
                    <View style={styles.dataItem}>
                      <Text style={styles.label}>كود المادة</Text>
                      <Text style={styles.value}>{course.code}</Text>
                    </View>

                    <View style={styles.dataItem}>
                      <Text style={styles.label}>الدرجة</Text>
                      <Text style={[styles.value, isFail && { color: '#e74c3c' }]}>
                        {isFail && course.symbol === 'غ' ? '--' : course.score}
                      </Text>
                    </View>

                    <View style={styles.dataItem}>
                      <Text style={styles.label}>الرمز</Text>
                      <View style={[styles.symbolBox, isFail ? styles.failBox : styles.successBox]}>
                        <Text style={[styles.symbolText, isFail && { color: '#c0392b' }]}>{course.symbol}</Text>
                      </View>
                    </View>

                    <View style={styles.dataItem}>
                      <Text style={styles.label}>مرات الرسوب</Text>
                      <Text style={[styles.value, course.fails > 0 && { color: '#e74c3c' }]}>{course.fails}</Text>
                    </View>

                    <View style={styles.dataItem}>
                      <Text style={styles.label}>الحالة</Text>
                      <Text style={[styles.value, isFail && course.status === 'غ' && { color: '#e74c3c' }]}>
                        {course.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc', paddingHorizontal: 10, paddingTop: 45 },
  
  headerRow: {
    flexDirection: 'row', // تغيير الاتجاه ليبدأ من الشمال
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a252f' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  semesterSection: { marginBottom: 20 },
  semesterHeader: { flexDirection: 'row-reverse', marginBottom: 8, paddingRight: 5 },
  semesterTitle: { fontSize: 13, fontWeight: 'bold', color: '#546e7a' },
  card: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 5, marginBottom: 6, elevation: 1, borderWidth: 1, borderColor: '#eee' },
  failCard: { borderColor: '#fab1a0', backgroundColor: '#fff9f9' },
  dataGrid: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  dataItem: { alignItems: 'center', flex: 1 },
  label: { fontSize: 8, color: '#95a5a6', marginBottom: 5, fontWeight: 'bold' },
  value: { fontSize: 13, color: '#2c3e50', fontWeight: 'bold' },
  symbolBox: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, minWidth: 25, alignItems: 'center' },
  successBox: { backgroundColor: '#e3f2fd' },
  failBox: { backgroundColor: '#ffebee' },
  symbolText: { fontSize: 14, fontWeight: 'bold', color: '#2980b9' }
});