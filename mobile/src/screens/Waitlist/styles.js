import { StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../../context/ThemeContext';

const makeStyles = (t) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: t.bg, paddingTop: 50 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  headerTitle:    { color: t.text, fontSize: 20, fontWeight: 'bold' },
  tabContainer:   { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: t.border, marginBottom: 20 },
  tabItem:        { paddingVertical: 10, paddingHorizontal: 15 },
  activeTab:      { borderBottomWidth: 3, borderBottomColor: t.accent },
  tabText:        { color: t.textSub, fontWeight: '600' },
  activeTabText:  { color: t.text },
  summaryCard:    { backgroundColor: t.cardAlt, marginHorizontal: 20, padding: 20, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: t.border },
  summaryText:    { color: t.text, fontSize: 18, fontWeight: 'bold' },
  sectionTitle:   { color: t.textSub, fontSize: 14, fontWeight: 'bold', marginLeft: 20, marginBottom: 15, textTransform: 'uppercase' },
  courseCard:     { backgroundColor: t.card, marginHorizontal: 20, borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: t.border },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  courseName:     { color: t.text, fontSize: 18, fontWeight: 'bold', flex: 1 },
  badge:          { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: t.cardAlt },
  badgeText:      { fontSize: 10, fontWeight: 'bold', color: '#16a34a' },
  courseInfo:     { color: t.textSub, fontSize: 14, marginBottom: 20 },
  statsRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statLabel:      { color: t.textSub, fontSize: 12, marginBottom: 5 },
  statValue:      { color: t.text, fontSize: 16, fontWeight: 'bold' },
  buttonRow:      { flexDirection: 'row', gap: 10 },
  viewButton:     { flex: 2, backgroundColor: t.accent, padding: 12, borderRadius: 8, alignItems: 'center' },
  viewButtonText: { color: t.accentFg, fontWeight: 'bold' },
  withdrawButton: { flex: 1, borderWidth: 1, borderColor: '#fecaca', padding: 12, borderRadius: 8, alignItems: 'center' },
  withdrawText:   { color: '#ef4444', fontWeight: '600' },
});

// Export a hook-friendly getter — WaitlistScreen will call this with the theme
export { makeStyles };

// Keep a static light export for backward compat
export const styles = makeStyles(lightTheme);
