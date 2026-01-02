package com.runboo.domain.tier.entity;

import com.runboo.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_tier")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserTier {

}
