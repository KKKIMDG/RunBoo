package com.runboo.domain.admin.controller;

import com.runboo.domain.notice.entity.Notice;
import com.runboo.domain.notice.repository.NoticeRepository;
import com.runboo.global.security.CustomUserDetails;
import jakarta.servlet.http.HttpSession;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final NoticeRepository noticeRepository;

    @Value("${admin.password}")
    private String adminPassword;

    private static final String ADMIN_SESSION_KEY = "IS_ADMIN";

    @PostMapping("/login")
    public ResponseEntity<String> adminLogin(
            @RequestBody AdminLoginRequest request,
            HttpSession session
    ){
        if(adminPassword.equals(request.getPassword())){
            session.setAttribute(ADMIN_SESSION_KEY, true);
            return ResponseEntity.ok("관리자 로그인 성공");
        }
        return ResponseEntity.status(401).body("비밀번호가 올바르지 않습니다.");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> adminLogout(HttpSession session){
        session.removeAttribute(ADMIN_SESSION_KEY);
        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> getAllNotices(HttpSession session){
        validateAdmin(session);
        return ResponseEntity.ok(noticeRepository.findAll());
    }

    @PostMapping("/notices")
    public ResponseEntity<Notice> createNotice(
            @RequestBody Notice notice,
            HttpSession session
    ){
        validateAdmin(session);
        Notice saved = noticeRepository.save(notice);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/notices/{id}")
    public ResponseEntity<Notice> updateNotice(
            @PathVariable Long id,
            @RequestBody Notice notice,
            HttpSession session
    ){
        validateAdmin(session);

        Notice existing = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 없습니다."));

        existing.setTitle(notice.getTitle());
        existing.setContent(notice.getContent());

        Notice updated = noticeRepository.save(existing);

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<String> deleteNotice(
            @PathVariable Long id,
            HttpSession session
    ){
        validateAdmin(session);

        noticeRepository.deleteById(id);

        return ResponseEntity.ok("삭제되었습니다.");
    }

    private void validateAdmin(HttpSession session){
        Boolean isAdmin = (Boolean) session.getAttribute(ADMIN_SESSION_KEY);

        if(isAdmin == null || !isAdmin){
            throw new RuntimeException("관리자 권한이 없습니다.");
        }
    }

    @Data
    public static class AdminLoginRequest{
        private String password;
    }
}
