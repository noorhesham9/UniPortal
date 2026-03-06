import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchAvailableCourses,
  registerForCourse,
  joinWaitlist,
} from '../../store/slices/enrollmentSlice';

export default function CourseRegistrationScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courses, loading, registrationLoading, error } = useSelector(
    (state) => state.enrollment
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    await dispatch(fetchAvailableCourses());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleRegisterCourse = async (course) => {
    if (!user?._id) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    const result = await dispatch(
      registerForCourse({
        studentId: user._id,
        sectionId: course._id,
      })
    );

    if (registerForCourse.fulfilled.match(result)) {
      Alert.alert(
        'نجح التسجيل',
        'تم تسجيلك في المادة بنجاح'
      );
    } else {
      Alert.alert('خطأ', error || 'حدث خطأ أثناء التسجيل');
    }
  };

  const handleJoinWaitlist = async (course) => {
    if (!user?._id) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    const result = await dispatch(
      joinWaitlist({
        studentId: user._id,
        sectionId: course._id,
      })
    );

    if (joinWaitlist.fulfilled.match(result)) {
      Alert.alert(
        'تمت الإضافة',
        'تمت إضافتك إلى قائمة الانتظار'
      );
    } else {
      Alert.alert('خطأ', error || 'حدث خطأ أثناء الإضافة لقائمة الانتظار');
    }
  };

  const CourseCard = ({ item }) => {
    const isFull = item.enrolledStudents >= item.capacity;
    const isRegistered = item.isStudentEnrolled;

    return (
      <View style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{item.courseCode}</Text>
            <Text style={styles.courseTitle}>{item.courseName}</Text>
          </View>
          {isFull && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>ممتلئة</Text>
            </View>
          )}
        </View>

        <View style={styles.courseDetails}>
          <View style={styles.detail}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.instructor || 'معلم'}: {item.enrolledStudents}/{item.capacity}
            </Text>
          </View>

          <View style={styles.detail}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.schedule || 'الجدول سيرسل لاحقاً'}
            </Text>
          </View>

          <View style={styles.detail}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.room || 'الموقع قريب'}
            </Text>
          </View>

          {item.prerequisites && (
            <View style={styles.detail}>
              <Ionicons name="checkmark-circle" size={16} color="#666" />
              <Text style={styles.detailText}>
                المتطلبات: {item.prerequisites}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.courseFooter}>
          <Text style={styles.creditHours}>
            {item.creditHours} ساعات معتمدة
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {isRegistered ? (
            <View style={styles.registeredBadge}>
              <Ionicons name="checkmark" size={18} color="#34C759" />
              <Text style={styles.registeredText}>مسجل</Text>
            </View>
          ) : isFull ? (
            <TouchableOpacity
              style={[styles.button, styles.waitlistButton]}
              onPress={() => handleJoinWaitlist(item)}
              disabled={registrationLoading}
            >
              {registrationLoading ? (
                <ActivityIndicator color="#FF9500" size="small" />
              ) : (
                <>
                  <Ionicons name="hourglass" size={18} color="#FF9500" />
                  <Text style={styles.waitlistButtonText}>الانضمام للانتظار</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.registerButton]}
              onPress={() => handleRegisterCourse(item)}
              disabled={registrationLoading}
            >
              {registrationLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={18} color="#fff" />
                  <Text style={styles.registerButtonText}>تسجيل</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>تسجيل المواد</Text>
        <Text style={styles.subtitle}>
          عدد المواد المتاحة: {courses.length}
        </Text>
      </View>

      {loading && courses.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>جاري تحميل المواد...</Text>
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color="#ccc" />
          <Text style={styles.emptyText}>لا توجد مواد متاحة حالياً</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={({ item }) => <CourseCard item={item} />}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  courseName: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fullBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  fullBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  courseDetails: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  courseFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  creditHours: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 40,
  },
  registerButton: {
    backgroundColor: '#007AFF',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  waitlistButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  waitlistButtonText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  registeredText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
