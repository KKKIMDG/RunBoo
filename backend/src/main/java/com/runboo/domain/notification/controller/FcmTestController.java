package com.runboo.domain.notification.controller;

import com.runboo.domain.notification.service.FcmSendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test/fcm")
@RequiredArgsConstructor
public class FcmTestController {

    private final FcmSendService fcmSendService;

    @PostMapping("/send")
    public void send(@RequestBody Map<String, String> body) {
        String token = body.get("token");

        fcmSendService.send(
                token,
                "RunBoo",
                "FCM 테스트 성공 🎉",
                Map.of("type", "TEST")
        );
    }

}
