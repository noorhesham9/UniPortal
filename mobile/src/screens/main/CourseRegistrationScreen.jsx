import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, RefreshControl, FlatList, TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchAvailableCourses, registerForCourse, joinWaitlist } from '../../store/slices/enrollmentSlice';
import { useAppTheme } from '../../context/ThemeContext';

const MAX_CREDITS = 18;

export default function CourseRegistrationScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useAppTheme();
  const { courses: availableCourses, sections: availableSections, loading, error } = useSelector((state) => state.enrollment);

  const [refreshing, setRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingSectionId, setEnrollingSectionId] = useState(null);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = () => dispatch(fetchAvailableCourses());

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const courseGroups = useMemo(() => {
    if (!availableCourses || !availableSections) return [];
    const availableIds = new Set(availableCourses.map((c) => c._id));
    const map = new Map();
    for (const sec of availableSections) {
      const cid = sec.course_id?._id;
      if (!cid || !availableIds.has(cid)) continue;
      if (!map.has(cid)) {
        const course = availableCourses.find((c) => c._id === cid);
        map.set(cid, { course, sections: [] });
      }
      map.get(cid).sections.push(sec);
    }
    return Array.from(map.entries()).map(([courseId, { course, sections }]) => ({ courseId, course, sections }));
  }, [availableCourses, availableSections]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return courseGroups;
    const q = searchQuery.trim().toLowerCase();
    return courseGroups.filter((g) => {
      const code = (g.course?.code || '').toLowerCase();
      const title = (g.course?.title || '').toLowerCase();
      return code.includes(q) || title.includes(q);
    });
  }, [courseGroups, searchQuery]);

  const toggleCollapsed = (courseId) =>
    setCollapsed((prev) => ({ ...prev, [courseId]: !prev[courseId] }));

  const handleEnroll = async (sectionId) => {
    if (!user?._id) { Alert.alert('Error', 'Please log in first'); return; }
    setEnrollingSectionId(sectionId);
    const result = await dispatch(registerForCourse({ studentId: user._id, sectionId }));
    if (registerForCourse.fulfilled.match(result)) {
      Alert.alert('Enrolled', 'You have been enrolled successfully.');
      loadCourses();
    } else {
      Alert.alert('Error', error || 'Enrollment failed');
    }
    setEnrollingSectionId(null);
  };

  const handleWaitlist = async (sectionId) => {
    if (!user?._id) { Alert.alert('Error', 'Please log in first'); return; }
    setEnrollingSectionId(sectionId);
    const result = await dispatch(joinWaitlist({ studentId: user._id, sectionId }));
    if (joinWaitlist.fulfilled.match(result)) {
      Alert.alert('Added', 'You have been added to the waitlist.');
      loadCourses();
    } else {
      Alert.alert('Error', error || 'Failed to join waitlist');
    }
    setEnrollingSectionId(null);
  };

  // ── Styles (built from theme, before any early return) ───────────────────
  const s = StyleSheet.create({
    container:         { flex: 1, backgroundColor: theme.bg },
    listContent:       { paddingHorizontal: 16, paddingBottom: 32 },
    listHeader:        { paddingTop: 0, paddingBottom: 12, gap: 12 },
    subtitle:          { fontSize: 13, color: theme.textSub, lineHeight: 18 },
    searchBox:         { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    searchInput:       { flex: 1, fontSize: 14, color: theme.text },
    emptyBox:          { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyText:         { fontSize: 14, color: theme.textSub, textAlign: 'center' },
    courseGroup:       { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
    courseGroupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
    courseGroupLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    chevron:           { fontSize: 12, color: theme.textSub, transform: [{ rotate: '-90deg' }] },
    chevronOpen:       { transform: [{ rotate: '0deg' }] },
    courseBadge:       { width: 48, height: 48, borderRadius: 8, backgroundColor: theme.cardAlt, alignItems: 'center', justifyContent: 'center' },
    courseBadgeLabel:  { fontSize: 10, fontWeight: '700', color: theme.textSub, textTransform: 'uppercase' },
    courseBadgeVal:    { fontSize: 14, fontWeight: '700', color: theme.text },
    courseTitleWrap:   { flex: 1 },
    courseCode:        { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 2 },
    courseTitle:       { fontSize: 13, color: theme.textSub },
    sectionsContainer: { borderTopWidth: 1, borderTopColor: theme.border, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    sectionRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6, gap: 12 },
    sectionInfo:       { flex: 1, flexWrap: 'wrap', flexDirection: 'row', gap: 6, alignItems: 'center' },
    sectionNum:        { fontSize: 13, fontWeight: '700', color: theme.text },
    sectionMeta:       { fontSize: 12, color: theme.textSub },
    sectionActions:    { flexShrink: 0 },
    btn:               { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 72 },
    btnEnroll:         { backgroundColor: theme.accent },
    btnEnrollText:     { fontSize: 13, fontWeight: '600', color: theme.accentFg },
    btnWaitlist:       { backgroundColor: 'rgba(249,115,22,0.1)', borderWidth: 1, borderColor: '#f97316' },
    btnWaitlistText:   { fontSize: 13, fontWeight: '600', color: '#f97316' },
  });

  // ── Sub-components (defined after s so they can reference it) ────────────

  const SectionRow = ({ sec }) => {
    const isFull = (sec.enrolled_students?.length ?? 0) >= sec.capacity;
    const instructor = sec.instructor_id?.name ?? '–';
    const room = sec.room_id?.room_number ?? sec.room_id?.number ?? '–';
    const time = [sec.day, sec.start_time, sec.end_time].filter(Boolean).join(' ');
    const isLoading = enrollingSectionId === sec._id;

    return (
      <View style={s.sectionRow}>
        <View style={s.sectionInfo}>
          <Text style={s.sectionNum}>Sec {sec.sectionNumber}</Text>
          <Text style={s.sectionMeta}>{time || '–'}</Text>
          <Text style={s.sectionMeta}>{instructor}</Text>
          <Text style={s.sectionMeta}>Room {room}</Text>
          <Text style={s.sectionMeta}>Cap. {sec.capacity}</Text>
        </View>
        <View style={s.sectionActions}>
          {isFull ? (
            <TouchableOpacity style={[s.btn, s.btnWaitlist]} onPress={() => handleWaitlist(sec._id)} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color="#f97316" /> : <Text style={s.btnWaitlistText}>Waitlist</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.btn, s.btnEnroll]} onPress={() => handleEnroll(sec._id)} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color={theme.accentFg} /> : <Text style={s.btnEnrollText}>Enroll</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const CourseGroup = ({ item }) => {
    const { courseId, course, sections } = item;
    const isOpen = !collapsed[courseId];
    return (
      <View style={s.courseGroup}>
        <TouchableOpacity style={s.courseGroupHeader} onPress={() => toggleCollapsed(courseId)} activeOpacity={0.7}>
          <View style={s.courseGroupLeft}>
            <Text style={[s.chevron, isOpen && s.chevronOpen]}>▼</Text>
            <View style={s.courseBadge}>
              <Text style={s.courseBadgeLabel}>CR</Text>
              <Text style={s.courseBadgeVal}>{course?.credits ?? '–'}</Text>
            </View>
            <View style={s.courseTitleWrap}>
              <Text style={s.courseCode}>{course?.code ?? '–'}</Text>
              <Text style={s.courseTitle} numberOfLines={2}>{course?.title ?? ''}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {isOpen && (
          <View style={s.sectionsContainer}>
            {sections.map((sec) => <SectionRow key={sec._id} sec={sec} />)}
          </View>
        )}
      </View>
    );
  };

  const ListHeader = () => (
    <View style={s.listHeader}>
      <Text style={s.subtitle}>Select a section per course to enroll. Max {MAX_CREDITS} credits.</Text>
      <View style={s.searchBox}>
        <Ionicons name="search" size={16} color={theme.textSub} style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by code or title"
          placeholderTextColor={theme.textSub}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={s.emptyBox}>
      <Ionicons name="alert-circle-outline" size={48} color={theme.border} />
      <Text style={s.emptyText}>
        {courseGroups.length === 0 ? 'No courses available for this semester.' : 'No courses match your search.'}
      </Text>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading && courseGroups.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg, gap: 12 }}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ fontSize: 14, color: theme.textSub }}>Loading courses…</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.courseId}
        renderItem={({ item }) => <CourseGroup item={item} />}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<ListEmpty />}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      />
    </View>
  );
}
