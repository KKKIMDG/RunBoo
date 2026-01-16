package com.runboo.domain.notice.controller;


import com.runboo.domain.notice.entity.Notice;
import com.runboo.domain.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeRepository noticeRepository;

    @GetMapping
    public ResponseEntity<List<Notice>> getNotices() {
        return ResponseEntity.ok(noticeRepository.findAllByOrderByCreatedAtDesc());
    }
}
