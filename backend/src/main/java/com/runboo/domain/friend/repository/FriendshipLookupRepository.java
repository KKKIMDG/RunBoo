package com.runboo.domain.friend.repository;

import com.runboo.domain.friend.entity.FriendStatus;
import com.runboo.domain.friend.entity.Friendship;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendshipLookupRepository extends JpaRepository<Friendship, Long> {

    @EntityGraph(attributePaths = {"requester", "receiver"})
    List<Friendship> findByRequesterIdAndStatus(Long requesterId, FriendStatus status);

    @EntityGraph(attributePaths = {"requester", "receiver"})
    List<Friendship> findByReceiverIdAndStatus(Long receiverId, FriendStatus status);
}
