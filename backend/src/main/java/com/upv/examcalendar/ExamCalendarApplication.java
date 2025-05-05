package com.upv.examcalendar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for the UPV Exam Calendar
 * BIND-MOUNT TEST - This comment was added to test bind-mount functionality
 */
@SpringBootApplication
public class ExamCalendarApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamCalendarApplication.class, args);
    }
}