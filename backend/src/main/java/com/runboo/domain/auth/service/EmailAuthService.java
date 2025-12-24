package com.runboo.domain.auth.service;

import com.runboo.domain.auth.entity.EmailVerification;
import com.runboo.domain.auth.repository.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

/**
 * 이메일 인증 처리 전용 서비스

 * 책임
 * - 인증 코드 생성
 * - 인증 코드 저장 및 갱신
 * - 이메일 발송
 * - 인증 코드 검증 및 완료 처리

 * 주의
 * - 인증이 완료되면 해당 이메일에 대한 인증 데이터는 삭제된다.
 * - "존재하지 않음 = 인증 완료" 상태로 간주한다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EmailAuthService {

    private final EmailVerificationRepository repository;
    private final JavaMailSender mailSender;

    /**
     * 6자리 숫자 인증 코드 생성
     * - 앞자리가 0일 수 있음
     */
    public String generateCode() {
        return String.format("%06d", new Random().nextInt(1_000_000));
    }

    /**
     * 인증 코드 저장

     * 규칙
     * - 동일 이메일로 재요청 시 기존 인증 코드를 제거하고 새로 발급
     * - 인증 유효 시간은 5분
     */
    public void saveCode(String email, String code) {
        repository.deleteById(email); // 재요청 시 기존 코드 제거
        repository.save(EmailVerification.create(email, code, 5));
    }

    /**
     * 이메일 인증 코드 발송
     * - 단순 텍스트 메일 방식
     */
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

    /**
     * 인증 코드 검증 및 인증 완료 처리

     * 처리 흐름
     * 1. 이메일 기준 인증 요청 조회
     * 2. 만료 여부 및 코드 일치 여부 검증
     * 3. 인증 완료 시 인증 데이터 삭제
     */
    public void verify(String email, String code) {
        EmailVerification ev = repository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("인증 요청이 없습니다."));
        ev.verify(code);

        repository.delete(ev);
    }

    /**
     * 이메일 인증 완료 여부 검증

     * 사용 시점
     * - 회원가입 전 최종 검증 단계

     * 규칙
     * - 인증 데이터가 존재하면 아직 인증되지 않은 상태
     * - 인증 데이터가 존재하지 않으면 인증 완료 상태
     */
    public void assertVerified(String email) {
        if (repository.existsById(email)) {
            throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
        }
    }
}
