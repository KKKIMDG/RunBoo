package com.runboo.domain.auth.service;

import com.runboo.domain.auth.entity.PasswordReset;
import com.runboo.domain.auth.repository.PasswordResetRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetService {

    private final PasswordResetRepository repository;
    private final JavaMailSender mailSender;

    /**
     * 6자리 숫자 코드 생성
     */
    public String generateCode() {
        return String.format("%06d", new SecureRandom().nextInt(1_000_000));
    }

    /**
     * 재설정 코드 저장
     * - 동일 이메일 재요청 시 덮어씀
     * - 유효시간 5분
     */
    public void saveCode(String email, String code) {
        repository.deleteById(email);
        repository.save(PasswordReset.create(email, code, 5));
    }

    /**
     * 비밀번호 재설정 메일 발송
     */
    public void sendMail(String email, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("[RunBoo] 비밀번호 재설정 코드");
            helper.setFrom("RunBoo <no-reply@runboo.com>");

            String plainText = """
                RunBoo 비밀번호 재설정 코드입니다.

                인증 코드: %s

                ※ 10분 이내에 입력해주세요.
                """.formatted(code);

            String htmlText = """
<!doctype html>
<html lang="ko">
<body style="margin:0;padding:0;background:#f6f7fb;">
  <table width="100%%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table width="600" style="background:#ffffff;border:1px solid #e7e9f0;">
          <tr>
            <td style="padding:24px;font-family:Arial,sans-serif;">
              <div style="font-size:30px;font-weight:800;color:#2E3D6E;text-align:center;">
                RunBoo
              </div>

              <p style="margin-top:16px;font-size:14px;color:#374151;">
                비밀번호 재설정을 위해 아래 인증 코드를 입력해주세요.<br/>
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
                본 요청을 하지 않았다면 이 메일을 무시하세요.
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
                """.formatted(code, java.time.Year.now().getValue());

            helper.setText(plainText, htmlText);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new IllegalStateException("비밀번호 재설정 메일 전송 실패", e);
        }
    }

    /**
     * 재설정 코드 검증
     * - 성공 시 엔티티 반환 (다음 단계에서 token 발급용)
     */
    public PasswordReset verifyCode(String email, String inputCode) {
        PasswordReset pr = repository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("비밀번호 재설정 요청이 없습니다."));

        pr.verify(inputCode);
        return pr;
    }

    /**
     * 재설정 요청 삭제
     */
    public void delete(String email) {
        repository.deleteById(email);
    }
}
