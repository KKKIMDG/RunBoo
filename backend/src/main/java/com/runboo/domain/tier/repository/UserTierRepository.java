package
com.runboo.domain.tier.repository;

import com.runboo.domain.tier.entity.UserTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserTierRepository extends JpaRepository<UserTier, Long> {
}
