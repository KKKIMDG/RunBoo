// src/screens/Challange/Challenge.styles.ts
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[scheme].background, // rgba(248, 249, 250, 1) 대응
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // --- 헤더 섹션 수정 ---
  header: {
    marginLeft: 12,
  },
  backButton: {
    marginRight: 12, // 버튼과 텍스트 사이 간격
    marginLeft: -4,  // 버튼 아이콘의 여백 때문에 조금 왼쪽으로 당김
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors[scheme].text,
    lineHeight: 32,
  },
  headerTextContainer: {
    flex: 1, // 남은 공간 모두 차지
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors[scheme].icon, // rgba(134, 142, 150, 1) 대응
    marginTop: 4,
  },
  // 탭 스위처 (진행 중 / 완료)
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors[scheme].card,
    borderRadius: 20,
    padding: 7,
    borderWidth: 1,
    borderColor: Colors[scheme].secondaryBackground,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: Colors[scheme].primary, // rgba(58, 74, 152, 1) 대응
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors[scheme].icon,
    marginLeft: 8,
  },
  tabButtonTextActive: {
    color: '#FFF',
  },
  // 달성 현황 카드 (완료 탭 전용)
  summaryCard: {
    width: '100%',
    padding: 25,
    backgroundColor: Colors[scheme].card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors[scheme].secondaryBackground,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  summaryHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors[scheme].text,
    marginLeft: 8,
  },
  summaryValueContainer: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors[scheme].primary, // rgba(46, 61, 110, 1) 계열
    letterSpacing: 0.37,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors[scheme].icon,
    marginTop: 4,
  },
  // 완료된 도전과제 카드
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors[scheme].card,
    borderRadius: 24,
    padding: 21,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors[scheme].secondaryBackground,
  },
  badgeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(46, 61, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors[scheme].text,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: Colors[scheme].icon,
    marginBottom: 4,
  },
  cardReward: {
    fontSize: 14,
    color: Colors[scheme].primary,
  },
  listContainer: {
    paddingBottom: 100,
  },
});