package com.upv.examcalendar.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String course;

    @Column(nullable = false)
    private String degree;

    @Column(nullable = false)
    private String semester;

    @Column(nullable = false)
    private LocalDate date;

    @Column
    private String time;

    @Column
    private String location;
}