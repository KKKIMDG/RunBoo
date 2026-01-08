// UserPushDeviceRepository.java
package com.runboo.domain.notification.repository;

import com.runboo.domain.notification.entity.UserPushDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPushDeviceRepository
        extends JpaRepository<UserPushDevice, Long> {

    List<UserPushDevice> findAllByUserIdAndEnabledTrue(Long userId);

    Optional<UserPushDevice> findByToken(String token);
}
