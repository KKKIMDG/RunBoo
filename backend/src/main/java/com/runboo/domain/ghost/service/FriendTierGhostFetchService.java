package com.runboo.domain.ghost.service;

import com.runboo.domain.friend.entity.FriendStatus;
import com.runboo.domain.friend.entity.Friendship;
import com.runboo.domain.friend.repository.FriendshipLookupRepository;
import com.runboo.domain.ghost.dto.FriendTierGhostDto;
import com.runboo.domain.ghost.entity.GhostProfile;
import com.runboo.domain.ghost.repository.GhostProfileRepository;
import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.record.repository.RunRecordRepository;
import com.runboo.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendTierGhostFetchService {

    private final FriendshipLookupRepository friendshipLookupRepository;
    private final RunRecordRepository runRecordRepository;
    private final GhostProfileRepository ghostProfileRepository;

    /**
     * 친구별:
     * - mode="Tier" 기록 중 avgPace가 가장 작은 RunRecord 1개 선택
     * - 그 RunRecord에 연결된 GhostProfile이 있을 때만 내려줌
     * - Tier 기록이 없는 친구는 제외
     */
    public List<FriendTierGhostDto> getFriendsBestTierGhosts(Long myUserId) {

        // 1) 친구관계(ACCEPTED) 가져오기 (내가 requester + receiver)
        List<Friendship> asRequester =
                friendshipLookupRepository.findByRequesterIdAndStatus(myUserId, FriendStatus.ACCEPTED);
        List<Friendship> asReceiver =
                friendshipLookupRepository.findByReceiverIdAndStatus(myUserId, FriendStatus.ACCEPTED);

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

        // 2) 친구들의 Tier 기록을 avgPace 오름차순으로 싹 가져오기
        //    => 같은 친구가 여러 개 있어도 "처음 만나는 것"이 best
        List<RunRecord> tierRecords =
                runRecordRepository.findByUserIdInAndModeOrderByAvgPaceAsc(friendIds, "Tier");

        if (tierRecords == null || tierRecords.isEmpty()) return List.of();

        // 3) 친구별 best Tier RunRecord 1개만 뽑기
        Map<Long, RunRecord> bestByFriendId = new LinkedHashMap<>();
        for (RunRecord rr : tierRecords) {

            Long ownerId = rr.getUserId(); // ✅ RunRecord에 userId(Long) 있다고 가정
            // 만약 RunRecord가 User user 연관이면 여기: rr.getUser().getId()

            if (!bestByFriendId.containsKey(ownerId)) {
                // 첫 번째가 avgPace 가장 작은 기록
                bestByFriendId.put(ownerId, rr);
            }
        }

        if (bestByFriendId.isEmpty()) return List.of();

        List<Long> bestRunRecordIds = bestByFriendId.values().stream()
                .map(RunRecord::getId)
                .distinct()
                .toList();

        // 4) bestRunRecordIds에 해당하는 GhostProfile 가져오기 (최신순)
        List<GhostProfile> gps =
                ghostProfileRepository.findByRunRecordIdInOrderByCreatedAtDesc(bestRunRecordIds);

        if (gps == null || gps.isEmpty()) {
            // 고스트가 하나도 없으면 고스트 선택 자체가 의미 없어서 빈 리스트
            return List.of();
        }

        // runRecordId별 "최신" GhostProfile 1개만 매핑
        Map<Long, GhostProfile> latestGhostByRunRecordId = new HashMap<>();
        for (GhostProfile gp : gps) {
            latestGhostByRunRecordId.putIfAbsent(gp.getRunRecordId(), gp);
        }

        // 5) 최종 응답: Tier 기록 있고 + GhostProfile도 있는 친구만 포함
        List<FriendTierGhostDto> result = new ArrayList<>();

        for (Map.Entry<Long, RunRecord> e : bestByFriendId.entrySet()) {
            Long friendId = e.getKey();
            RunRecord best = e.getValue();

            GhostProfile gp = latestGhostByRunRecordId.get(best.getId());
            if (gp == null) continue; // ✅ 고스트가 없으면 제외 (고스트 선택에 뜨면 안 됨)

            User friend = friendMap.get(friendId);
            if (friend == null) continue;

            // ✅ 너희 User 엔티티 필드명에 맞게 여기만 수정하면 됨
            String nickname = friend.getNickname();
            String profileImageUrl = friend.getProfileImageUrl();

            result.add(new FriendTierGhostDto(
                    friend.getId(),
                    nickname,
                    profileImageUrl,
                    best.getId(),
                    best.getAvgPace(),
                    best.getMode(), // "Tier"
                    gp
            ));
        }

        // 친구별 1개씩이므로 이미 “친구 한 명당 1개” 보장됨.
        // 정렬 기준이 필요하면 여기서 추가 가능(예: avgPace asc)
        result.sort(Comparator.comparingInt(FriendTierGhostDto::getAvgPace));

        return result;
    }
}
