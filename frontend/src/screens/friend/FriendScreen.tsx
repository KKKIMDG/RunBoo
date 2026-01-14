import React, { useState, useCallback, useMemo } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    Image, TextInput, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { FriendService, Friend } from '@/services/friend/friendService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSettings } from "@/screens/Settings/useSettings";
import { scaleFont } from "@/utils/fontScale";
import FilterChip from '@/components/FilterChip';
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

// 탭 타입 정의
type TabType = 'FRIENDS' | 'REQUESTS';

const FRIEND_TABS: { label: string; type: TabType }[] = [
    { label: "👥 내 친구", type: 'FRIENDS' },
    { label: "📩 받은 요청", type: 'REQUESTS' },
];

export default function FriendScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('FRIENDS');

    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 모달 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<Friend[]>([]);
    const [searching, setSearching] = useState(false);

    const { settings } = useSettings();
    const colorScheme = useResolvedTheme(settings?.themeMode);
    const colors = Colors[colorScheme];

    const styles = useMemo(() => getStyles(colorScheme, settings?.fontSize || "MEDIUM"), [colorScheme, settings?.fontSize]);

    // 데이터 불러오기
    const fetchData = async (isBackground = false) => {
        if (!isBackground) setIsLoading(true);

        try {
            if (activeTab === 'FRIENDS') {
                const data = await FriendService.getMyFriends();
                setFriends(data);
            } else {
                const data = await FriendService.getReceivedRequests();
                setRequests(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (!isBackground) setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const hasData = (activeTab === 'FRIENDS' && friends.length > 0) || (activeTab === 'REQUESTS' && requests.length > 0);
            fetchData(hasData);
        }, [activeTab])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData(true);
    };

    const handleSearch = async () => {
        if (!searchText.trim()) return;
        setSearching(true);
        try {
            const results = await FriendService.searchUsers(searchText);
            setSearchResults(results);
        } catch (e) {
            Alert.alert("알림", "검색 중 오류가 발생했습니다.");
        } finally {
            setSearching(false);
        }
    };

    const handleAccept = async (friendshipIdOrUserId: number) => {
        try {
            await FriendService.acceptFriend(friendshipIdOrUserId);
            Alert.alert("환영합니다", "친구가 되었습니다!");
            fetchData(true);
        } catch (e) {
            Alert.alert("오류", "수락 실패");
        }
    };

    // ✅ [추가] 친구 삭제 핸들러

    const renderItem = ({ item }: { item: Friend }) => (
        <View style={styles.itemContainer}>
            <Image
                source={item.profileImageUrl ? { uri: item.profileImageUrl } : require('@/assets/images/runboo.png')}
                style={styles.profileImage}
            />
            <View style={styles.textContainer}>
                <Text style={styles.nickname}>{item.nickname}</Text>
                <Text style={styles.emailText}>{item.email}</Text>
            </View>

            {/* ✅ [수정] 탭에 따라 '삭제' 또는 '수락' 버튼 표시 */}
            {activeTab === 'FRIENDS' ? (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteFriend(item.id, item.nickname)}
                >
                    <Ionicons name="trash-outline" size={20} color="#FF5252" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(item.id)}
                >
                    <Text style={styles.acceptButtonText}>수락</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.mainHeader}>친구</Text>
                    <Text style={styles.subHeader}>함께 달리는 즐거움</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="person-add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    data={FRIEND_TABS}
                    keyExtractor={(item) => item.type}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <FilterChip
                            label={item.label}
                            isActive={activeTab === item.type}
                            onPress={() => setActiveTab(item.type)}
                            scheme={colorScheme}
                        />
                    )}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                />
            </View>

            {isLoading && !isRefreshing && (friends.length === 0 && requests.length === 0) ? (
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'FRIENDS' ? friends : requests}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {activeTab === 'FRIENDS' ? "친구가 없습니다." : "받은 요청이 없습니다."}
                            </Text>
                        </View>
                    }
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                />
            )}

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>친구 검색</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{color: colors.icon, marginBottom: 8}}>이메일 또는 닉네임으로 검색하세요</Text>
                        <View style={styles.searchBox}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="example@email.com"
                                placeholderTextColor={colors.icon}
                                value={searchText}
                                onChangeText={setSearchText}
                                autoCapitalize="none"
                                returnKeyType="search"
                                onSubmitEditing={handleSearch}
                            />
                            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                                <Ionicons name="search" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {searching ? (
                            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => String(item.id)}
                                style={{ marginTop: 10 }}
                                renderItem={({ item }) => (
                                    <View style={styles.searchItem}>
                                        <View style={{flexDirection:'row', alignItems:'center', flex:1}}>
                                            <Image
                                                source={
                                                    item.profileImageUrl
                                                        ? { uri: item.profileImageUrl }
                                                        : require('@/assets/images/runboo.png')
                                                }
                                                style={styles.smallProfile}
                                            />
                                            <View>
                                                <Text style={styles.searchName}>{item.nickname}</Text>
                                                <Text style={styles.searchEmail}>{item.email}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.requestButton}
                                            onPress={async () => {
                                                try {
                                                    await FriendService.requestFriend(item.id);
                                                    Alert.alert("성공", "요청을 보냈습니다.");
                                                } catch(e) { Alert.alert("실패", "이미 요청했거나 친구입니다."); }
                                            }}
                                        >
                                            <Text style={styles.requestButtonText}>요청</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const getStyles = (scheme: "light" | "dark", fontSize: any) => {
    const colors = Colors[scheme];
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, paddingTop: 20 },
        header: { paddingHorizontal: 32, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
        headerText: { flex: 1 },
        mainHeader: { fontSize: scaleFont(24, fontSize), fontWeight: '700', color: colors.text, lineHeight: 32 },
        subHeader: { fontSize: scaleFont(14, fontSize), color: colors.icon, marginTop: 4 },
        addButton: { padding: 8 },

        filterContainer: { marginBottom: 16 },
        listContent: { paddingHorizontal: 20, paddingBottom: 80, paddingTop: 8 },

        itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
        profileImage: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
        textContainer: { marginLeft: 16, flex: 1 },
        nickname: { fontSize: scaleFont(16, fontSize), fontWeight: '600', color: colors.text },
        emailText: { fontSize: scaleFont(13, fontSize), color: colors.icon },

        acceptButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
        acceptButtonText: { color: '#fff', fontWeight: 'bold' },

        // ✅ [추가] 삭제 버튼 스타일
        deleteButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },

        emptyContainer: { alignItems: 'center', marginTop: 100 },
        emptyText: { fontSize: 16, color: colors.icon },

        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
        modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '80%' },
        modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
        modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
        searchBox: { flexDirection: 'row', gap: 10 },
        searchInput: { flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.text, borderWidth: 1, borderColor: colors.border },
        searchButton: { backgroundColor: colors.primary, borderRadius: 10, padding: 12, justifyContent: 'center' },

        searchItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        smallProfile: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', marginRight: 10 },
        searchName: { color: colors.text, fontWeight: '600' },
        searchEmail: { color: colors.icon, fontSize: 12 },
        requestButton: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
        requestButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    });
};