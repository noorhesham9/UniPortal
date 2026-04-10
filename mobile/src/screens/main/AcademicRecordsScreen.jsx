import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchAcademicRecords } from "../../store/slices/enrollmentSlice";

const theme = {
  primary: "#ffd16c",
  surface: "#080e1d",
  containerHigh: "#171f33",
  containerLow: "#0c1324",
  onSurface: "#e0e5fb",
  onSurfaceVariant: "#a5aabf",
  outline: "#6f7588",
};

export default function AcademicRecordsScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { academicRecords, loading, error } = useSelector(
    (state) => state.enrollment,
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadAcademicRecords();
    }
  }, [user?._id]);

  const loadAcademicRecords = async () => {
    if (user?._id) {
      await dispatch(fetchAcademicRecords(user._id));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAcademicRecords();
    setRefreshing(false);
  };

  if (loading && !academicRecords) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (error && !academicRecords) {
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
          <Ionicons name="alert-circle" size={48} color={theme.primary} />
          <Text
            style={[styles.errorText, { marginTop: 16, textAlign: "center" }]}
          >
            {error || "Failed to load academic records"}
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 24 }]}
            onPress={loadAcademicRecords}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const data = academicRecords || {};
  const cumulativeGPA = data.cumulativeGPA || 0;
  const totalCredits = data.totalCredits || 0;
  const averageGrade = data.averageGrade || "N/A";
  const semesters = data.semesters || [];
  const gpaProgress = (cumulativeGPA / 4) * 100;

  const renderSemesterItem = ({ item, index }) => (
    <View style={[styles.semesterCard, index === 0 && styles.activeCard]}>
      <View style={styles.semesterHeader}>
        <View>
          <Text style={styles.semesterTitle}>{item.displayName}</Text>
          <Text style={styles.semesterSubtitle}>
            {index === 0 ? "Current Term • Full-Time" : "Completed"}
          </Text>
        </View>
        {index === 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>In Progress</Text>
          </View>
        )}
      </View>

      <View style={styles.semesterStats}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Semester GPA</Text>
          <Text style={styles.statValue}>{item.gpa.toFixed(2)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Credits</Text>
          <Text style={styles.statValue}>{item.credits.toFixed(1)}</Text>
        </View>
      </View>

      {index === 0 && (
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons
            name="arrow-forward"
            size={14}
            color={theme.primary}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderIconForSemester = (semesterIndex) => {
    if (semesterIndex === 0) {
      return "school";
    } else if (semesterIndex === 1) {
      return "history";
    } else {
      return "verified";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section: GPA Display */}
        <View style={styles.gpaSection}>
          <View style={styles.gpaCard}>
            {/* GPA Circle */}
            <View style={styles.gpaCircleContainer}>
              <View style={[styles.gpaCircle, { borderRadius: 96 }]}>
                {/* SVG alternative: circular progress indicator */}
                <View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: 96,
                    borderWidth: 12,
                    borderColor: theme.containerHigh,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: 96,
                    borderWidth: 12,
                    borderColor: "transparent",
                    borderTopColor: theme.primary,
                    borderRightColor: theme.primary,
                    borderBottomColor: "transparent",
                    borderLeftColor: "transparent",
                    transform: [{ rotate: `${gpaProgress}deg` }],
                  }}
                />
              </View>
              <View style={styles.gpaCenterText}>
                <Text style={styles.gpaValue}>{cumulativeGPA.toFixed(2)}</Text>
                <Text style={styles.gpaLabel}>Cumulative GPA</Text>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>{totalCredits}</Text>
                <Text style={styles.statItemLabel}>Credits Earned</Text>
              </View>
              <View style={[styles.statItem, styles.statItemBorder]}>
                <Text style={styles.statItemValue}>{averageGrade}</Text>
                <Text style={styles.statItemLabel}>Avg Grade</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Semester History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Academic History</Text>
            <Text style={styles.semetersCount}>
              {semesters.length} Semesters
            </Text>
          </View>

          <View style={styles.semestersList}>
            {semesters.map((semester, index) => (
              <View key={semester._id || index}>
                {index === 0 ? (
                  renderSemesterItem({ item: semester, index })
                ) : (
                  <TouchableOpacity
                    style={styles.semesterCardCollapsed}
                    activeOpacity={0.7}
                  >
                    <View style={styles.collapsedHeader}>
                      <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                          name={renderIconForSemester(index)}
                          size={24}
                          color={theme.onSurfaceVariant}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.collapsedTitle}>
                          {semester.displayName}
                        </Text>
                        <View style={styles.collapsedStats}>
                          <Text style={styles.collapsedStat}>
                            GPA:{" "}
                            <Text style={styles.collapsedStatValue}>
                              {semester.gpa.toFixed(2)}
                            </Text>
                          </Text>
                          <Text style={styles.collapsedStat}>
                            Credits:{" "}
                            <Text style={styles.collapsedStatValue}>
                              {semester.credits.toFixed(1)}
                            </Text>
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={theme.onSurfaceVariant}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Load More Button */}
          {semesters.length > 0 && (
            <TouchableOpacity style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Load Older Records</Text>
            </TouchableOpacity>
          )}
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
  gpaSection: {
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  gpaCard: {
    backgroundColor: theme.containerLow,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
  },
  gpaCircleContainer: {
    width: 192,
    height: 192,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  gpaCircle: {
    width: 192,
    height: 192,
    justifyContent: "center",
    alignItems: "center",
  },
  gpaCenterText: {
    position: "absolute",
    alignItems: "center",
  },
  gpaValue: {
    fontSize: 48,
    fontWeight: "800",
    color: theme.primary,
    fontFamily: "Plus Jakarta Sans",
  },
  gpaLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.onSurfaceVariant,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 32,
    width: "100%",
    maxWidth: 280,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "#424859",
    paddingLeft: 16,
  },
  statItemValue: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.onSurface,
    fontFamily: "Plus Jakarta Sans",
  },
  statItemLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.onSurfaceVariant,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  historySection: {
    paddingHorizontal: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.primary,
    fontFamily: "Plus Jakarta Sans",
    letterSpacing: -0.5,
  },
  semetersCount: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  semestersList: {
    gap: 16,
  },
  activeCard: {
    backgroundColor: theme.containerHigh,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  semesterCard: {
    backgroundColor: theme.containerLow,
    borderRadius: 20,
    padding: 20,
  },
  semesterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.onSurface,
    fontFamily: "Plus Jakarta Sans",
  },
  semesterSubtitle: {
    fontSize: 12,
    color: theme.onSurfaceVariant,
    marginTop: 4,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "rgba(255, 209, 108, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: theme.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  semesterStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(29, 37, 59, 0.5)",
    borderRadius: 16,
    padding: 12,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.primary,
    fontFamily: "Plus Jakarta Sans",
  },
  detailsButton: {
    width: "100%",
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#604700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "Plus Jakarta Sans",
  },
  semesterCardCollapsed: {
    backgroundColor: theme.containerLow,
    borderRadius: 20,
    padding: 20,
  },
  collapsedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.containerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  collapsedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.onSurface,
    fontFamily: "Plus Jakarta Sans",
  },
  collapsedStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  collapsedStat: {
    fontSize: 12,
    color: theme.onSurfaceVariant,
  },
  collapsedStatValue: {
    color: theme.onSurface,
    fontWeight: "600",
  },
  loadMoreButton: {
    marginTop: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(160, 170, 191, 0.4)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  primaryButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#604700",
  },
  errorText: {
    fontSize: 16,
    color: theme.onSurface,
    fontWeight: "500",
  },
});
