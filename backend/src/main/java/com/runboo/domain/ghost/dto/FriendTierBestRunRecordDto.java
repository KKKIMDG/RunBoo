package com.runboo.domain.ghost.dto;

import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.user.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class FriendTierBestRunRecordDto {

    private Long friendUserId;
    private String friendNickname;
    private String friendProfileImageUrl;

    private Long runRecordId;
    private Integer avgPace;
    private String mode; // "TIER"

    private Double distanceM;
    private LocalDateTime startedAt;
    private LocalDateTime createdAt;

    public FriendTierBestRunRecordDto(User friend, RunRecord rr) {
        this.friendUserId = friend.getId();
        this.friendNickname = friend.getNickname();
        this.friendProfileImageUrl = friend.getProfileImageUrl();

        this.runRecordId = rr.getId();
        this.avgPace = rr.getAvgPace();
        this.mode = rr.getMode();

        this.distanceM = rr.getDistanceM();
        this.startedAt = rr.getStartedAt();
        this.createdAt = rr.getCreatedAt();
    }
}
