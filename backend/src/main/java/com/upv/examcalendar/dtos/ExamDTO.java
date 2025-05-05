package com.upv.examcalendar.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Data Transfer Object for exams
 * Used for API requests and responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDTO {

    private Long id;

    @NotNull(message = "Exam day is required")
    private LocalDate examDay;

    @NotNull(message = "Exam hour is required")
    private LocalTime examHour;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be greater than 0")
    private Integer durationMin;

    @NotBlank(message = "Subject code is required")
    private String subjectCode;

    @NotBlank(message = "Subject name is required")
    private String subjectName;

    private String acronym;

    @NotBlank(message = "Degree is required")
    private String degree;

    @NotNull(message = "Course year is required")
    @Min(value = 1, message = "Course year must be greater than 0")
    private Integer courseYear;

    @NotNull(message = "Semester is required")
    private String semester;

    private String examPlace;

    private String comment;
}