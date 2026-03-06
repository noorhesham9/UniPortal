import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchCompletedHours } from '../../store/slices/enrollmentSlice';

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { completedHours, loading } = useSelector((state) => state.enrollment);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadDashboardData();
    }
  }, [user?._id]);

  const loadDashboardData = async () => {
    if (user?._id) {
      await dispatch(fetchCompletedHours(user._id));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const calculateGPA = () => {
    return 2.48;
  };

  const paymentStatus = 'مفروغ'; 
  const gpa = calculateGPA();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >

      <View style={styles.header}>
        <Text style={styles.greeting}>مرحباً بك</Text>
        <Text style={styles.name}>{user?.name || 'الطالب'}</Text>
        <Text style={styles.studentId}>
          رقم الطالب: {user?.studentId || 'N/A'}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.card, styles.gpaCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>المعدل التراكمي</Text>
          </View>
          <Text style={styles.gpaValue}>{gpa}</Text>
          <Text style={styles.cardSubtitle}>من 5.0</Text>
        </View>

        
        <View style={[styles.card, styles.hoursCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={24} color="#34C759" />
            <Text style={styles.cardTitle}>الساعات المنجزة</Text>
          </View>
          {loading ? (
            <ActivityIndicator color="#34C759" />
          ) : (
            <>
              <Text style={styles.hoursValue}>{completedHours}</Text>
              <Text style={styles.cardSubtitle}>ساعة معتمدة</Text>
            </>
          )}
        </View>

        
        <View style={[styles.card, styles.paymentCard]}>
          <View style={styles.cardHeader}>
            <Ionicons
              name={paymentStatus === 'مفروغ' ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color={paymentStatus === 'مفروغ' ? '#34C759' : '#FF3B30'}
            />
            <Text style={styles.cardTitle}>حالة الدفع</Text>
          </View>
          <Text
            style={[
              styles.paymentValue,
              {
                color: paymentStatus === 'مفروغ' ? '#34C759' : '#FF3B30',
              },
            ]}
          >
            {paymentStatus}
          </Text>
          <Text style={styles.cardSubtitle}>الفصل الحالي</Text>
        </View>

        {/* Level/Year Card */}
        <View style={[styles.card, styles.levelCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="school" size={24} color="#FF9500" />
            <Text style={styles.cardTitle}>المستوى</Text>
          </View>
          <Text style={styles.levelValue}>
            {user?.level || 'First Year'}
          </Text>
          <Text style={styles.cardSubtitle}>السنة الدراسية</Text>
        </View>
      </View>

      

      {/* Important Notice */}
      <View style={styles.noticeContainer}>
        <Ionicons name="information-circle" size={24} color="#FF9500" />
        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>تنبيه هام</Text>
          <Text style={styles.noticeText}>
            تأكد من استكمال بيانات ملفك الشخصي وسداد رسوم التسجيل في الموعد المحدد
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 12,
    color: '#999',
  },
  statsContainer: {
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    textAlign: 'right',
  },
  gpaCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  gpaValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  hoursCard: {
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  hoursValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 4,
  },
  paymentCard: {
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  paymentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelCard: {
    backgroundColor: 'rgba(255, 149, 0, 0.05)',
  },
  levelValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  
  noticeContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    padding: 12,
    borderRadius: 8,
  },
  noticeContent: {
    marginLeft: 12,
    flex: 1,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
