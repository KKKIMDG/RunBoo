package com.runboo.domain.auth.service;

import com.runboo.domain.auth.entity.EmailVerification;
import com.runboo.domain.auth.repository.EmailVerificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
     * - HTML + Plain Text 멀티파트 메일 방식
     */
    public void send(String email, String code) {

        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("[RunBoo] 이메일 인증 코드");
            helper.setFrom("RunBoo <no-reply@runboo.com>");

            // plain text (스팸/호환 대비)
            String plainText = """
                RunBoo 이메일 인증 코드입니다.

                인증 코드: %s

                ※ 5분 이내에 입력해주세요.
                """.formatted(code);

            // html
            String htmlText = """
<!doctype html>
<html lang="ko">
<body style="margin:0;padding:0;background:#f6f7fb;">
  <table width="100%%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table width="600"
          style="background:#ffffff;border:1px solid #e7e9f0;">
          <tr>
            <td style="padding:24px;font-family:Arial,sans-serif;">
              <div style="font-size:30px;font-weight:800;color:#2E3D6E;text-align: center;">
                RunBoo
              </div>

              <p style="margin-top:16px;font-size:14px;color:#374151;">
                이메일 인증을 위해 아래 인증 코드를 입력해주세요.<br/>
                <b>5분 이내</b>에만 유효합니다.
              </p>

              <div style="
                margin:20px 0;
                padding:18px;
                text-align:center;
                background:#EEF1FA;
                font-size:32px;
                font-weight:800;
                letter-spacing:15px;
                color:#000;
                font-family:monospace;">
                %s
              </div>

              <p style="font-size:12px;color:#6b7280;">
                본 메일을 요청하지 않았다면 무시하셔도 됩니다.<br/>
                인증 코드는 타인에게 공유하지 마세요.
              </p>

              <p style="font-size:11px;color:#9ca3af;margin-top:24px;">
                © %d RunBoo
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
                """.formatted(
                    code,
                    java.time.Year.now().getValue()
            );

            // 핵심
            helper.setText(plainText, htmlText);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new IllegalStateException("이메일 인증 메일 전송 실패", e);
        }
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
