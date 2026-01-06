package com.runboo.domain.notification.template;

public class RunResultNotificationTemplate {

    public static NotificationMessageDto prAchieved(int distanceKm) {
        return new NotificationMessageDto(
                "개인 최고 기록 달성!",
                distanceKm + "km 최고 기록을 갱신했어요 🎉"
        );
    }

}
