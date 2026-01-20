package com.runboo.domain.ghost.service;

import com.runboo.domain.friend.entity.FriendStatus;
import com.runboo.domain.friend.entity.Friendship;
import com.runboo.domain.friend.repository.FriendshipLookupRepository;
import com.runboo.domain.ghost.dto.FriendTierBestRunRecordDto;
import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.record.repository.RunRecordRepository;
import com.runboo.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FriendTierBestRunRecordService {

    private final FriendshipLookupRepository friendshipLookupRepository;
    private final RunRecordRepository runRecordRepository;

    public List<FriendTierBestRunRecordDto> getFriendsBestTierRunRecords(Long myUserId) {

        // 1) 친구관계 조회 (ACCEPTED)
        List<Friendship> asRequester =
                friendshipLookupRepository.findByRequester_IdAndStatus(myUserId, FriendStatus.ACCEPTED);
        List<Friendship> asReceiver =
                friendshipLookupRepository.findByReceiver_IdAndStatus(myUserId, FriendStatus.ACCEPTED);

        Map<Long, User> friendMap = new LinkedHashMap<>();

        if (asRequester != null) {
            for (Friendship f : asRequester) {
                User u = f.getReceiver();
                if (u != null) friendMap.put(u.getId(), u);
            }
        }
        if (asReceiver != null) {
            for (Friendship f : asReceiver) {
                User u = f.getRequester();
                if (u != null) friendMap.put(u.getId(), u);
            }
        }

        if (friendMap.isEmpty()) return List.of();

        List<Long> friendIds = new ArrayList<>(friendMap.keySet());

        // 2) 친구들의 TIER 기록 조회 (avgPace 빠른 순)
        List<RunRecord> tierRecords =
                runRecordRepository
                        .findByUser_IdInAndModeIgnoreCaseAndAvgPaceGreaterThanOrderByAvgPaceAsc(
                                friendIds,
                                "TIER",
                                0
                        );

        if (tierRecords == null || tierRecords.isEmpty()) return List.of();

        // 3) 친구별 best 1개 선택 (정렬되어 있으니 첫 등장만)
        Map<Long, RunRecord> bestByFriendId = new LinkedHashMap<>();
        for (RunRecord rr : tierRecords) {
            Long ownerId = rr.getUser().getId(); // ✅ RunRecord 구조에 맞는 정답
            if (!bestByFriendId.containsKey(ownerId)) {
                bestByFriendId.put(ownerId, rr);
            }
        }

        if (bestByFriendId.isEmpty()) return List.of();

        // 4) DTO 변환 (Tier 기록 없는 친구는 자동 제외)
        List<FriendTierBestRunRecordDto> result = new ArrayList<>();
        for (Map.Entry<Long, RunRecord> e : bestByFriendId.entrySet()) {
            Long friendId = e.getKey();
            RunRecord rr = e.getValue();
            User friend = friendMap.get(friendId);
            if (friend == null) continue;

            result.add(new FriendTierBestRunRecordDto(friend, rr));
        }

        // 빠른 페이스 순 유지
        result.sort(Comparator.comparingInt(FriendTierBestRunRecordDto::getAvgPace));
        return result;
    }
}
