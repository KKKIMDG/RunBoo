import * as TaskManager from 'expo-task-manager';
import { useRecordStore } from '../../stores/recordStore';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: { data: any, error: any }) => {
    if (error) {
        console.error('❌ 백그라운드 위치 추적 에러:', error);
        return;
    }

    if (data) {
        const { locations } = data;
        // locations는 배열 형태로 들어옵니다.
        if (locations && locations.length > 0) {
            const newLocation = locations[0]; // 가장 최신 위치
            // 스토어 업데이트 (로직은 스토어 내부에서 처리)
            useRecordStore.getState().updateLocation(newLocation);
        }
    }
});