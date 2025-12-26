import { StyleSheet, Dimensions } from 'react-native';
import { TierTheme } from './useTierResult'; // TierTheme 타입을 임포트합니다.

const { width, height } = Dimensions.get('window');

export const getStyles = (theme: TierTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  // 상단 섹션
  topSection: {
    height: 452,
    alignItems: 'center',
    paddingTop: 60,
    zIndex: 10,
  },
  tierLabelBox: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tierTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.text,
  },
  tierName: {
    fontSize: 34,
    fontWeight: '900',
    color: theme.text,
    marginTop: 15,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  ghostContainer: {
    position: 'absolute',
    top: 175,
    width: 241,
    height: 241,
    borderRadius: 120.5,
    backgroundColor: 'rgba(224, 231, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  // 하단 리포트 시트
  bottomSheet: {
    position: 'absolute',
    top: 452,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.card,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    paddingTop: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 15,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  checkBadge: {
    backgroundColor: theme.point,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
  },
  checkText: {
    color: theme.card,
    fontSize: 14,
    fontWeight: 'bold',
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  // 통계 그리드
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: theme.icon,
    marginTop: 5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
  },
  statUnit: {
    fontSize: 11,
    color: theme.icon,
    fontWeight: '600',
  },
  paceValue: {
    color: theme.point,
  },
  // 버튼 그룹
  buttonGroup: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: theme.text,
  },
  homeButton: {
    backgroundColor: theme.card,
    borderWidth: 1.5,
    borderColor: theme.secondaryBackground,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  whiteText: {
    color: theme.card,
  },
  blackText: {
    color: theme.text,
  },
});