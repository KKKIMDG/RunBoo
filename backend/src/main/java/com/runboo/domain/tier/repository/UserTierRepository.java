package
com.runboo.domain.tier.repository;

import com.runboo.domain.tier.entity.UserTier;
import com.runboo.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserTierRepository extends JpaRepository<UserTier, Long> {
    Optional<UserTier> findByUserAndDistanceType(User user, UserTier.DistanceType distanceEnum);
}
