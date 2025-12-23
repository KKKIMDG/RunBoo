package com.runboo.domain.tier.repository;

import com.runboo.domain.tier.entity.TierResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TierResultRepository extends JpaRepository<TierResult, Long> {

}
