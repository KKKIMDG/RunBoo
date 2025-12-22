package
com.runboo.domain.tier.repository;

import com.runboo.domain.tier.entity.Tier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TierRepository extends JpaRepository<Tier, Long> {

    //pace(초/킬로)와 distanceType으로 해당되는 티어 찾기
    @Query("""
        SELECT t
        FROM Tier t
        WHERE t.distanceType = :distanceType
          AND t.minPaceSecPerKm <= :pace
          AND t.maxPaceSecPerKm >= :pace
    """)
    Optional<Tier> findTierByPace(@Param("distanceType") String distanceType, @Param("pace") int pace);

}
