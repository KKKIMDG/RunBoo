package com.runboo.domain.friend.controller;

import com.runboo.domain.friend.service.FriendService;
import com.runboo.domain.user.dto.UserDto;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<String> requestFriend(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long receiverId
    ) {
        friendService.requestFriend(user.getUserId(), receiverId);
        return ResponseEntity.ok("친구 요청을 보냈습니다.");
    }

    @PostMapping("/accept/{friendshipId}")
    public ResponseEntity<String> acceptFriend(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long friendshipId
    ) {
        friendService.acceptFriend(user.getUserId(), friendshipId);
        return ResponseEntity.ok("친구가 되었습니다!");
    }

    @GetMapping
    public List<UserDto> getMyFriends(@AuthenticationPrincipal CustomUserDetails user) {
        return friendService.getMyFriends(user.getUserId());
    }

    @GetMapping("/requests")
    public List<UserDto> getReceivedRequests(@AuthenticationPrincipal CustomUserDetails user) {
        return friendService.getReceivedFriendRequests(user.getUserId());
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<String> deleteFriend(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long friendId
    ) {
        friendService.deleteFriend(user.getUserId(), friendId);
        return ResponseEntity.ok("친구가 삭제되었습니다.");
    }
}
