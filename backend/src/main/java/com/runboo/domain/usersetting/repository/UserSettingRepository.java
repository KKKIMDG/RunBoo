package com.runboo.domain.usersetting.repository;

import com.runboo.domain.usersetting.entity.UserSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingRepository extends JpaRepository<UserSetting, Long> {
}
