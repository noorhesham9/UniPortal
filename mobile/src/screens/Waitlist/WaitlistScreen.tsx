import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { styles } from './styles'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';


interface WaitlistItem {
  id: string;
  name: string;
  code: string;
  credits: number;
  pos: string;
  chance: string;
  level: 'HIGH' | 'MODERATE' | 'LOW';
}

const WaitlistScreen: React.FC = () => {
  
  const waitlistData: WaitlistItem[] = [
    { id: '1', name: 'Advanced Machine Learning', code: 'CS402', credits: 3, pos: '5 of 20', chance: '85%', level: 'HIGH' },
    { id: '2', name: 'Distributed Systems', code: 'CS350', credits: 4, pos: '12 of 25', chance: '45%', level: 'MODERATE' },
    { id: '3', name: 'UI/UX Design Patterns', code: 'DES201', credits: 3, pos: '42 of 50', chance: '10%', level: 'LOW' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
           <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waitlist Status</Text>
        <TouchableOpacity>
           <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tabs -*/}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>Withdrawn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={{color: '#EBB72F', fontSize: 12, fontWeight: 'bold'}}>QUEUE SUMMARY</Text>
            <Text style={styles.summaryText}>3 Active Waitlists</Text>
          </View>
                <MaterialCommunityIcons name={"hourglass-empty" as any} size={32} color="#EBB72F" />        </View>

        <Text style={styles.sectionTitle}>Current Enrollments</Text>

        {/* Waitlist Cards */}
        {waitlistData.map((item) => (
          <View key={item.id} style={styles.courseCard}>
            <View style={styles.cardTop}>
              <Text style={styles.courseName}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: item.level === 'HIGH' ? '#1A2E1A' : '#2E2A1A' }]}>
                <Text style={[styles.badgeText, { color: item.level === 'HIGH' ? '#4CAF50' : '#EBB72F' }]}>
                  {item.level} CHANCE
                </Text>
              </View>
            </View>
            <Text style={styles.courseInfo}>{item.code} • {item.credits} Credits</Text>
            
            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>Position</Text>
                <Text style={styles.statValue}>{item.pos}</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Est. Chance</Text>
                <Text style={styles.statValue}>{item.chance}</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.withdrawButton}>
                <Text style={styles.withdrawText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WaitlistScreen;