package com.runboo.domain.friend.repository;

import com.runboo.domain.friend.entity.FriendStatus;
import com.runboo.domain.friend.entity.Friendship;
import com.runboo.domain.user.entity.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.hibernate.annotations.processing.SQL;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    boolean existsByRequesterAndReceiver(User request, User receiver);

    List<Friendship> findByReceiverAndStatus(User receiver, FriendStatus status);

    @Query("SELECT f FROM Friendship f WHERE (f.requester.id = :userId OR f.receiver.id = :userId) AND f.status = 'ACCEPTED'")
    List<Friendship> findAllFriends(@Param("userId") Long userId);

    Optional<Friendship> findByRequesterIdAndReceiverId(Long requesterId, Long receiverId);

    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.requester.id = :userId AND f.receiver.id = :friendId) OR " +
            "(f.requester.id = :friendId AND f.receiver.id = :userId)")
    Optional<Friendship> findFriendship(@Param("userId") Long userId, @Param("friendId") Long friendId);
}
