package com.smartcampus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartCampusApplication {

    private static final Logger logger = LoggerFactory.getLogger(SmartCampusApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
        logger.info("SmartCampus Application started successfully");
    }
}
