package com.runboo.domain.user.service;

import com.runboo.domain.user.entity.EmailVerification;
import com.runboo.domain.user.repository.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailAuthService {

    private final EmailVerificationRepository repository;
    private final JavaMailSender mailSender;

    public String generateCode() {
        return String.format("%06d", new Random().nextInt(1_000_000));
    }

    public void saveCode(String email, String code) {
        repository.deleteById(email); // 재요청 시 기존 코드 제거
        repository.save(EmailVerification.create(email, code, 5));
    }

    public void send(String email, String code) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("[RunBoo] 이메일 인증 코드");
        message.setText(
                """
                RunBoo 이메일 인증 코드입니다.

                인증 코드: %s

                ※ 5분 이내에 입력해주세요.
                """
                        .formatted(code)
        );

        mailSender.send(message);
    }

    public void verify(String email, String code) {
        EmailVerification ev = repository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("인증 요청이 없습니다."));
        ev.verify(code);

        repository.delete(ev);
    }

    public void assertVerified(String email) {
        if (repository.existsById(email)) {
            throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
        }
    }
}
