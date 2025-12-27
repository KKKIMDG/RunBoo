
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

export const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors[scheme].background,
    ...Platform.select({
      web: {
        height: '100%' as any,
      },
      default: {
        flex: 1,
      }
    })
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.select({
      ios: 75,
      default: 85,
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors[scheme].card,
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors[scheme].secondaryBackground,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: Colors[scheme].primary,
  },
  tabItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors[scheme].icon,
    marginLeft: 6,
  },
  activeTabText: {
    color: Colors[scheme].background,
  },
  mapBox: {
    flex: 1,
    backgroundColor: Colors[scheme].card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors[scheme].secondaryBackground,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  mapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors[scheme].secondaryBackground,
  },
  mapPlaceholderText: {
    color: Colors[scheme].icon,
    fontSize: 16,
  },
  zoomBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors[scheme].card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  mapBottomRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)', // This might need a dark theme equivalent
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  countText: {
    color: Colors[scheme].primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  detailText: {
    color: Colors[scheme].primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonSection: {
    marginBottom: 0,
  },
  blackButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors[scheme].text,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 24,
    position: 'relative',
  },
  startBtn: {
    height: 58,
    marginBottom: 0,
  },
  buttonTextMain: {
    color: Colors[scheme].background,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chevronIcon: {
    position: 'absolute',
    right: 20,
  },
  buttonContentCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
