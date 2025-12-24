package com.runboo.global.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SwaggerStartupLogger implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        log.info("==================================================");
        log.info("🚀 RunBoo Server Started");
        log.info("📄 Swagger UI : http://localhost:8080/swagger-ui/index.html");
        log.info("==================================================");
    }
}
