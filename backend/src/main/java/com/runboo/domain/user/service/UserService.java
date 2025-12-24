package com.runboo.domain.user.service;

import com.runboo.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

//    @Transactional
//    public void signupSocial(SocialUserCreateRequestDto dto) {
//
//        User user = User.createSocial(
//                dto.getEmail(),
//                dto.getProfileImageUrl()
//        );
//
//        userRepository.save(user);
//    }
}
