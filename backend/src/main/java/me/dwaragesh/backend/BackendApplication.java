package me.dwaragesh.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @org.springframework.context.annotation.Bean("syncExecutor")
    public org.springframework.core.task.TaskExecutor syncExecutor() {
        org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor ex = new org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor();
        ex.setCorePoolSize(2);
        ex.setMaxPoolSize(4);
        ex.setQueueCapacity(500);
        ex.setThreadNamePrefix("sync-");
        return ex;
    }

}
