package com.upv.examcalendar.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entity representing an exam in the ETSINF faculty
 * Maps to the etsinf_exams table in the database
 */
@Entity
@Table(name = "etsinf_exams")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtsinfExam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_day", nullable = false)
    private LocalDate examDay;

    @Column(name = "exam_hour", nullable = false)
    private LocalTime examHour;

    @Column(name = "duration_min", nullable = false)
    private Integer durationMin;

    @Column(name = "subject_code", nullable = false, length = 20)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false)
    private String subjectName;

    @Column(name = "acronym", length = 20)
    private String acronym;

    @Column(name = "degree", nullable = false)
    private String degree;

    @Column(name = "course_year", nullable = false)
    private Integer courseYear;

    @Column(name = "semester", nullable = false)
    private String semester;

    @Column(name = "exam_place")
    private String examPlace;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
}