package com.runboo.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProfileImgUpdateRequest {

    @NotBlank
    private String profileImageUrl;
}
