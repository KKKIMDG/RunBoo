
import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchMyRecords } from '@/services/record/records';
import { DEFAULT_USER_ID } from '@/constants/env';
import type { RecordDto } from '@/types/record';

// 네비게이션 스택 파라미터 타입 정의
type RootStackParamList = {
    Stats: undefined;
};

type RecordsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Stats'>;

export const useRecordsScreen = () => {
    const navigation = useNavigation<RecordsScreenNavigationProp>();
    const [tab, setTab] = useState<'left' | 'right'>('left');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<RecordDto[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const userId = DEFAULT_USER_ID;

    const loadRecords = useCallback(async () => {
        try {
            setErrorMsg(null);
            const records = await fetchMyRecords(userId);
            console.log("📦 records from backend:", records);
            setData(records);
        } catch (e) {
            console.log("❌ records api error:", e);
            setErrorMsg("기록을 불러오지 못했어요. 네트워크/서버 상태를 확인해줘.");
            setData([]);
        }
    }, [userId]);

    useEffect(() => {
        (async () => {
            try {
                await loadRecords();
            } finally {
                setLoading(false);
            }
        })();
    }, [loadRecords]);

    const handleChangeTab = (v: 'left' | 'right') => {
        if (v === 'right') {
            navigation.navigate('Stats');
            // 'Stats' 화면으로 갔다가 돌아왔을 때 '기록' 탭이 선택된 상태로 유지하기 위해
            // navigation.addListener를 사용하거나 별도의 상태 관리가 필요할 수 있으나,
            // 현재 구조에서는 일단 'left'로 리셋합니다.
            setTab('left'); 
            return;
        }
        setTab(v);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadRecords();
        } finally {
            setRefreshing(false);
        }
    }, [loadRecords]);

    return {
        tab,
        loading,
        refreshing,
        data,
        errorMsg,
        handlers: {
            handleChangeTab,
            onRefresh,
        },
    };
};
