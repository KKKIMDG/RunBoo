package com.runboo.domain.friend.service;

import com.runboo.domain.friend.entity.FriendStatus;
import com.runboo.domain.friend.entity.Friendship;
import com.runboo.domain.friend.repository.FriendshipRepository;
import com.runboo.domain.user.dto.UserDto;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public void requestFriend(Long requesterId, Long receiverId) {
        if (requesterId.equals(receiverId)) throw new IllegalArgumentException("자신에게 요청할 수 없습니다.");

        User requester = userRepository.findById(requesterId).orElseThrow();
        User receiver = userRepository.findById(receiverId).orElseThrow();

        if (friendshipRepository.existsByRequesterAndReceiver(requester, receiver)) {
            throw new IllegalArgumentException("이미 요청을 보냈거나 친구입니다.");
        }

        Friendship friendship = new Friendship(requester, receiver);
        friendshipRepository.save(friendship);
    }

    public List<UserDto> getMyFriends(Long userId) {
        List<Friendship> friendships = friendshipRepository.findAllFriends(userId);

        return friendships.stream().map(f -> {
            User friend = f.getRequester().getId().equals(userId) ? f.getReceiver() : f.getRequester();
            return new UserDto(friend);
        }).collect(Collectors.toList());
    }

    @Transactional
    public List<UserDto> getReceivedFriendRequests(Long userId) {
        User me = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        List<Friendship> requests = friendshipRepository.findByReceiverAndStatus(me, FriendStatus.PENDING);

        return requests.stream()
                .map(f -> new UserDto(f.getRequester()))
                .collect(Collectors.toList());
    }

    public void acceptFriend(Long myId, Long partnerId) {
        Friendship friendship = friendshipRepository.findByRequesterIdAndReceiverId(partnerId, myId)
                .orElseThrow(() -> new IllegalArgumentException("해당 친구 요청이 존재하지 않습니다."));

        if (friendship.getStatus() == FriendStatus.PENDING) {
            friendship.accept();
        } else {
            throw new IllegalArgumentException("이미 처리된 요청입니다.");
        }
    }

    public void deleteFriend(Long userId, Long friendId) {
        Friendship friendship = friendshipRepository.findFriendship(userId, friendId)
                .orElseThrow(() -> new IllegalArgumentException("친구 관계가 존재하지 않습니다."));

        friendshipRepository.delete(friendship);
    }
}
