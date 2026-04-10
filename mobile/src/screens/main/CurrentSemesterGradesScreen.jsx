import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Animated,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchCurrentSemesterGrades } from "../../store/slices/enrollmentSlice";

const theme = {
  primary: "#ffd16c",
  surface: "#080e1d",
  containerHigh: "#171f33",
  containerLow: "#0c1324",
  onSurface: "#e0e5fb",
  onSurfaceVariant: "#a5aabf",
  outline: "#6f7588",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#FF5252",
};

export default function CurrentSemesterGradesScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentSemesterGrades, loading, error } = useSelector(
    (state) => state.enrollment,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user?._id) {
      loadCurrentGrades();
    }
  }, [user?._id]);

  useEffect(() => {
    if (currentSemesterGrades?.courses?.length > 0) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [currentSemesterGrades]);

  const loadCurrentGrades = async () => {
    if (user?._id) {
      await dispatch(fetchCurrentSemesterGrades(user._id));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCurrentGrades();
    setRefreshing(false);
  };

  if (loading && !currentSemesterGrades) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { marginTop: 16 }]}>
          جاري تحميل الدرجات...
        </Text>
      </SafeAreaView>
    );
  }

  if (error && !currentSemesterGrades) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color={theme.error}
          />
          <Text
            style={[styles.errorText, { marginTop: 16, textAlign: "center" }]}
          >
            {error || "خطأ في تحميل الدرجات"}
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 24 }]}
            onPress={loadCurrentGrades}
          >
            <Text style={styles.buttonText}>إعادة محاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const data = currentSemesterGrades || {};
  const semester = data.semester || {};
  const courses = data.courses || [];
  const averageCoursework = data.averageCoursework || 0;
  const averageFinal = data.averageFinal || 0;
  const overallAverage = data.overallAverage || 0;

  const getGradeColor = (grade) => {
    if (grade >= 90) return theme.success;
    if (grade >= 80) return theme.primary;
    if (grade >= 70) return theme.warning;
    return theme.error;
  };

  const getGradeLabel = (grade) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "F";
  };

  const renderCourseCard = (course, index) => {
    const isExpanded = expandedCourseId === course._id;
    const courseworkColor = getGradeColor(course.coursework || 0);
    const finalColor = getGradeColor(course.final || 0);

    return (
      <TouchableOpacity
        key={course._id || index}
        style={styles.courseCard}
        onPress={() => setExpandedCourseId(isExpanded ? null : course._id)}
        activeOpacity={0.7}
      >
        {/* Course Header */}
        <View style={styles.courseHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.courseCode}>{course.code}</Text>
            <Text style={styles.courseTitle}>{course.title}</Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={theme.onSurfaceVariant}
          />
        </View>

        {/* Grade Summary */}
        <View style={styles.gradeSummary}>
          <View style={styles.gradeQuickView}>
            <Text style={styles.gradeLabel}>الدرجة</Text>
            <View
              style={[
                styles.gradeBadge,
                {
                  backgroundColor: getGradeColor(
                    (course.coursework || 0) * 0.4 + (course.final || 0) * 0.6,
                  ),
                },
              ]}
            >
              <Text style={styles.gradeBadgeText}>
                {getGradeLabel(
                  (course.coursework || 0) * 0.4 + (course.final || 0) * 0.6,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.expandedDivider} />

            {/* Coursework Grade */}
            <View style={styles.gradeDetail}>
              <View style={styles.gradeDetailHeader}>
                <Text style={styles.gradeDetailLabel}>أعمال السنة</Text>
                <Text
                  style={[styles.gradeDetailScore, { color: courseworkColor }]}
                >
                  {course.coursework?.toFixed(1) || "--"} / 40
                </Text>
              </View>
              <View style={styles.gradeBar}>
                <Animated.View
                  style={[
                    styles.gradeProgress,
                    {
                      width: `${Math.min((course.coursework || 0) * 2.5, 100)}%`,
                      backgroundColor: courseworkColor,
                      transform: [{ scaleX: scaleAnim }],
                    },
                  ]}
                />
              </View>
              <Text style={styles.gradePercentage}>
                {(((course.coursework || 0) / 40) * 100).toFixed(0)}%
              </Text>
            </View>

            {/* Final Grade */}
            <View style={[styles.gradeDetail, { marginTop: 16 }]}>
              <View style={styles.gradeDetailHeader}>
                <Text style={styles.gradeDetailLabel}>الامتحان النهائي</Text>
                <Text style={[styles.gradeDetailScore, { color: finalColor }]}>
                  {course.final?.toFixed(1) || "--"} / 60
                </Text>
              </View>
              <View style={styles.gradeBar}>
                <Animated.View
                  style={[
                    styles.gradeProgress,
                    {
                      width: `${Math.min((course.final || 0) * 1.67, 100)}%`,
                      backgroundColor: finalColor,
                      transform: [{ scaleX: scaleAnim }],
                    },
                  ]}
                />
              </View>
              <Text style={styles.gradePercentage}>
                {(((course.final || 0) / 60) * 100).toFixed(0)}%
              </Text>
            </View>

            {/* Total Score */}
            <View style={styles.totalScore}>
              <Text style={styles.totalScoreLabel}>المجموع</Text>
              <Text
                style={[
                  styles.totalScoreValue,
                  {
                    color: getGradeColor(
                      (course.coursework || 0) + (course.final || 0),
                    ),
                  },
                ]}
              >
                {((course.coursework || 0) + (course.final || 0)).toFixed(1)} /
                100
              </Text>
            </View>

            {/* Grade Letter */}
            <View
              style={[
                styles.gradeLetter,
                {
                  backgroundColor:
                    getGradeColor(
                      (course.coursework || 0) + (course.final || 0),
                    ) + "20",
                },
              ]}
            >
              <Text style={styles.gradeLetterLabel}>التقدير</Text>
              <Text
                style={[
                  styles.gradeLetterValue,
                  {
                    color: getGradeColor(
                      (course.coursework || 0) + (course.final || 0),
                    ),
                  },
                ]}
              >
                {getGradeLabel((course.coursework || 0) + (course.final || 0))}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Semester Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.semesterTitle}>{semester.displayName}</Text>
            <Text style={styles.semesterSubtitle}>الترم الحالي</Text>
          </View>
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={theme.primary}
            />
            <Text style={styles.statusBadgeText}>جاري</Text>
          </View>
        </View>

        {/* Average Grades Summary */}
        {courses.length > 0 && (
          <View style={styles.averageSummary}>
            <View style={styles.averageCard}>
              <View style={styles.averageCardContent}>
                <Text style={styles.averageLabel}>متوسط أعمال السنة</Text>
                <Text
                  style={[
                    styles.averageValue,
                    { color: getGradeColor(averageCoursework) },
                  ]}
                >
                  {averageCoursework.toFixed(1)}
                </Text>
              </View>
              <View
                style={[
                  styles.averageIcon,
                  {
                    backgroundColor: getGradeColor(averageCoursework) + "20",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={24}
                  color={getGradeColor(averageCoursework)}
                />
              </View>
            </View>

            <View style={styles.averageCard}>
              <View style={styles.averageCardContent}>
                <Text style={styles.averageLabel}>متوسط الفاينال</Text>
                <Text
                  style={[
                    styles.averageValue,
                    { color: getGradeColor(averageFinal) },
                  ]}
                >
                  {averageFinal.toFixed(1)}
                </Text>
              </View>
              <View
                style={[
                  styles.averageIcon,
                  {
                    backgroundColor: getGradeColor(averageFinal) + "20",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="pencil-circle-outline"
                  size={24}
                  color={getGradeColor(averageFinal)}
                />
              </View>
            </View>
          </View>
        )}

        {/* Overall Average */}
        {courses.length > 0 && (
          <View style={styles.overallCard}>
            <View style={styles.overallHeader}>
              <Text style={styles.overallLabel}>المعدل الكلي</Text>
              <Text
                style={[
                  styles.overallValue,
                  { color: getGradeColor(overallAverage) },
                ]}
              >
                {overallAverage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.overallBar}>
              <Animated.View
                style={[
                  styles.overallProgress,
                  {
                    width: `${Math.min(overallAverage, 100)}%`,
                    backgroundColor: getGradeColor(overallAverage),
                    transform: [{ scaleX: scaleAnim }],
                  },
                ]}
              />
            </View>
            <View style={styles.overallGradeRow}>
              <Text style={styles.overallGrade}>
                {getGradeLabel(overallAverage)}
              </Text>
              <Text style={styles.overallGradeLabel}>التقدير الكلي</Text>
            </View>
          </View>
        )}

        {/* Courses List */}
        <View style={styles.coursesSection}>
          <Text style={styles.coursesSectionTitle}>
            المقررات ({courses.length})
          </Text>
          <View style={styles.coursesList}>
            {courses.length > 0 ? (
              courses.map((course, index) => renderCourseCard(course, index))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="folder-outline"
                  size={48}
                  color={theme.onSurfaceVariant}
                />
                <Text style={styles.emptyStateText}>
                  لا توجد درجات حتى الآن
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    color: theme.onSurface,
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: theme.onSurface,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 16,
  },
  semesterTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.primary,
  },
  semesterSubtitle: {
    fontSize: 13,
    color: theme.onSurfaceVariant,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 209, 108, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primary,
  },
  averageSummary: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  averageCard: {
    flex: 1,
    backgroundColor: theme.containerLow,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  averageCardContent: {
    flex: 1,
  },
  averageLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  averageIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  overallCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: theme.containerHigh,
    borderRadius: 20,
    padding: 16,
  },
  overallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  overallLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.onSurfaceVariant,
    textTransform: "uppercase",
  },
  overallValue: {
    fontSize: 28,
    fontWeight: "900",
  },
  overallBar: {
    height: 8,
    backgroundColor: theme.surface,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  overallProgress: {
    height: "100%",
    borderRadius: 4,
  },
  overallGradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  overallGrade: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.primary,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.primary + "20",
    textAlign: "center",
    textAlignVertical: "center",
  },
  overallGradeLabel: {
    fontSize: 12,
    color: theme.onSurfaceVariant,
    fontWeight: "600",
  },
  coursesSection: {
    paddingHorizontal: 16,
  },
  coursesSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.primary,
    marginBottom: 12,
  },
  coursesList: {
    gap: 12,
  },
  courseCard: {
    backgroundColor: theme.containerLow,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.outline,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.primary,
    textTransform: "uppercase",
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.onSurface,
    marginTop: 4,
  },
  gradeSummary: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  gradeQuickView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gradeLabel: {
    fontSize: 11,
    color: theme.onSurfaceVariant,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  gradeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  gradeBadgeText: {
    fontWeight: "800",
    color: "#000",
    fontSize: 14,
  },
  expandedContent: {
    backgroundColor: theme.containerHigh,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.outline,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: theme.outline,
    marginBottom: 16,
  },
  gradeDetail: {
    marginBottom: 0,
  },
  gradeDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gradeDetailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.onSurface,
  },
  gradeDetailScore: {
    fontSize: 13,
    fontWeight: "700",
  },
  gradeBar: {
    height: 6,
    backgroundColor: theme.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  gradeProgress: {
    height: "100%",
    borderRadius: 3,
  },
  gradePercentage: {
    fontSize: 11,
    color: theme.onSurfaceVariant,
    marginTop: 4,
    fontWeight: "500",
  },
  totalScore: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.outline,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalScoreLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.onSurface,
  },
  totalScoreValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  gradeLetter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  gradeLetterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.onSurfaceVariant,
  },
  gradeLetterValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.onSurfaceVariant,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#604700",
  },
});
