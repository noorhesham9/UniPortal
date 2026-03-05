import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121008', // لون الخلفية الغامق من كود الـ CSS
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#2A261A',
    marginBottom: 20,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#EBB72F', // اللون الذهبي
  },
  tabText: {
    color: '#8E8A7D',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#EBB72F',
  },
  summaryCard: {
    backgroundColor: '#231F14',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#8E8A7D',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  courseCard: {
    backgroundColor: '#231F14',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#332F23',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  courseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#1A2E1A',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  courseInfo: {
    color: '#8E8A7D',
    fontSize: 14,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statLabel: {
    color: '#8E8A7D',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewButton: {
    flex: 2,
    backgroundColor: '#EBB72F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#121008',
    fontWeight: 'bold',
  },
  withdrawButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4A2020',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawText: {
    color: '#FF5252',
    fontWeight: '600',
  }
});