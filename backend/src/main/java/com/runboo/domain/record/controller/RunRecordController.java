package com.runboo.domain.record.controller;

import com.runboo.domain.record.dto.RecordDetailResponse;
import com.runboo.domain.record.service.RecordService;
import com.runboo.domain.record.service.RunRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // ✅ REST API 컨트롤러임을 선언
@RequestMapping("/api/run-records") // ✅ 공통 경로 설정
@RequiredArgsConstructor // ✅ recordService 필드 자동 주입
public class RunRecordController {

    private final RunRecordService runRecordService;

    /**
     * 기록 상세 정보 조회
     * GET http://localhost:8080/api/run-records/1
     */
    @GetMapping("/{recordId}")
    public ResponseEntity<RecordDetailResponse> getRecord(@PathVariable Long recordId) {
        // 서비스에서 DTO로 변환된 데이터를 받아 반환합니다.
        return ResponseEntity.ok(runRecordService.getRecordDetail(recordId));
    }
}