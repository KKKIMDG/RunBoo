package com.runboo.domain.ghost.dto;

import com.runboo.domain.ghost.entity.GhostProfile;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
public class FriendTierGhostDto {

    // friend
    private Long friendUserId;
    private String friendNickname;
    private String friendProfileImageUrl;

    // best Tier runRecord
    private Long runRecordId;
    private Integer avgPace;
    private String mode; // "Tier"

    // ghost profile (runRecordId 기반)
    private Long ghostProfileId;
    private String type;
    private Double targetDistanceKm;
    private OffsetDateTime createdAt;

    public FriendTierGhostDto(
            Long friendUserId,
            String friendNickname,
            String friendProfileImageUrl,
            Long runRecordId,
            Integer avgPace,
            String mode,
            GhostProfile gp
    ) {
        this.friendUserId = friendUserId;
        this.friendNickname = friendNickname;
        this.friendProfileImageUrl = friendProfileImageUrl;

        this.runRecordId = runRecordId;
        this.avgPace = avgPace;
        this.mode = mode;

        this.ghostProfileId = gp.getId();
        this.type = gp.getType();
        this.targetDistanceKm = gp.getTargetDistanceKm();
        this.createdAt = gp.getCreatedAt();
    }
}
