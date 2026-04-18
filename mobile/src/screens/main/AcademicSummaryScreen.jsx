import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useAppTheme } from "../../context/ThemeContext";
import { fetchFullAcademicRecord } from "../../store/slices/enrollmentSlice";

export default function AcademicSummaryScreen() {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { fullAcademicRecord, loading, error } = useSelector(
    (state) => state.enrollment,
  );
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadAcademicRecord();
    }
  }, [user?._id]);

  const loadAcademicRecord = async () => {
    if (user?._id) {
      await dispatch(fetchFullAcademicRecord(user._id));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAcademicRecord();
    setRefreshing(false);
  };

  if (loading && !fullAcademicRecord) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSub }]}>
            Loading academic record...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.accent }]}
            onPress={loadAcademicRecord}
          >
            <Text style={[styles.retryText, { color: theme.accentFg }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const record = fullAcademicRecord;
  if (!record) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.center}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={theme.border}
          />
          <Text style={[styles.emptyText, { color: theme.textSub }]}>
            No academic record found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { student, summary, semesterRecords } = record;

  const summaryCards = [
    {
      icon: "trophy-outline",
      value: summary.cumulativeGPA,
      label: "Cumulative GPA",
      color: "#667eea",
    },
    {
      icon: "book-outline",
      value: `${summary.totalCreditsEarned} / ${summary.requiredCredits}`,
      label: "Credits Earned",
      color: "#22c55e",
    },
    {
      icon: "trending-up-outline",
      value: `${summary.completionPercentage}%`,
      label: "Completion",
      color: "#f59e0b",
    },
    {
      icon: "school-outline",
      value: summary.remainingCredits,
      label: "Credits Remaining",
      color: "#ef4444",
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
      >
        <View style={styles.header}>
          <Ionicons name="school" size={32} color={theme.accent} />
          <Text style={[styles.title, { color: theme.text }]}>
            Academic Record
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSub }]}>
            {student.name} • {student.studentId}
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          {summaryCards.map((card, index) => (
            <View
              key={index}
              style={[styles.summaryCard, { borderLeftColor: card.color }]}
            >
              <Ionicons name={card.icon} size={28} color={card.color} />
              <View>
                <Text style={[styles.cardValue, { color: theme.text }]}>
                  {card.value}
                </Text>
                <Text style={[styles.cardLabel, { color: theme.textSub }]}>
                  {card.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.deptInfo,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.deptText, { color: theme.text }]}>
            <Text style={{ fontWeight: "bold" }}>Department:</Text>{" "}
            {student.department} ({student.departmentCode})
          </Text>
        </View>

        <View style={styles.semestersContainer}>
          {semesterRecords.map((sr, index) => (
            <View
              key={index}
              style={[
                styles.semesterBlock,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={styles.semesterHeader}>
                <View>
                  <Text style={[styles.semesterTitle, { color: theme.text }]}>
                    {sr.semester.term} {sr.semester.year}
                  </Text>
                  <Text
                    style={[styles.semesterCredits, { color: theme.textSub }]}
                  >
                    {sr.creditsEarned} credits earned • {sr.creditsAttempted}{" "}
                    attempted
                  </Text>
                </View>
                <View style={styles.semesterGpa}>
                  <Text style={[styles.gpaLabel, { color: theme.textSub }]}>
                    Semester GPA
                  </Text>
                  <Text style={[styles.gpaValue, { color: "#f59e0b" }]}>
                    {sr.semesterGPA}
                  </Text>
                </View>
              </View>

              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text
                    style={[styles.tableHeaderText, { color: theme.textSub }]}
                  >
                    Code
                  </Text>
                  <Text
                    style={[styles.tableHeaderText, { color: theme.textSub }]}
                  >
                    Title
                  </Text>
                  <Text
                    style={[styles.tableHeaderText, { color: theme.textSub }]}
                  >
                    Credits
                  </Text>
                  <Text
                    style={[styles.tableHeaderText, { color: theme.textSub }]}
                  >
                    Grade
                  </Text>
                  <Text
                    style={[styles.tableHeaderText, { color: theme.textSub }]}
                  >
                    Points
                  </Text>
                  <Text
                    style={[styles.tableHeaderText, { color: theme.textSub }]}
                  >
                    Status
                  </Text>
                </View>
                {sr.courses.map((c, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tableRow,
                      {
                        backgroundColor: c.passed
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(239,68,68,0.1)",
                      },
                    ]}
                  >
                    <Text style={[styles.tableCell, { color: theme.text }]}>
                      {c.courseCode}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.titleCell,
                        { color: theme.text },
                      ]}
                      numberOfLines={1}
                    >
                      {c.courseTitle}
                    </Text>
                    <Text style={[styles.tableCell, { color: theme.text }]}>
                      {c.credits}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { color: c.isLocked ? theme.text : theme.textSub },
                      ]}
                    >
                      {c.isLocked ? c.grade : "—"}
                    </Text>
                    <Text style={[styles.tableCell, { color: theme.text }]}>
                      {c.isLocked ? c.gradePoint.toFixed(1) : "—"}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { color: c.passed ? "#22c55e" : "#ef4444" },
                      ]}
                    >
                      {!c.isLocked ? "Pending" : c.passed ? "✓ Pass" : "✗ Fail"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { fontSize: 16, marginTop: 10 },
  errorText: { fontSize: 16, marginTop: 10, textAlign: "center" },
  retryBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: { fontSize: 16, fontWeight: "600" },
  emptyText: { fontSize: 16, marginTop: 10, textAlign: "center" },
  scrollContent: { padding: 20 },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  subtitle: { fontSize: 16, marginTop: 5 },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardValue: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  cardLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  deptInfo: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20 },
  deptText: { fontSize: 14 },
  semestersContainer: { gap: 16 },
  semesterBlock: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  semesterHeader: {
    backgroundColor: "rgba(245,158,11,0.12)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245,158,11,0.2)",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  semesterTitle: { fontSize: 18, fontWeight: "bold" },
  semesterCredits: { fontSize: 12, marginTop: 4 },
  semesterGpa: { alignItems: "flex-end" },
  gpaLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  gpaValue: { fontSize: 20, fontWeight: "bold" },
  tableContainer: { padding: 12 },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableCell: { flex: 1, fontSize: 12 },
  titleCell: { flex: 1.5 },
});
