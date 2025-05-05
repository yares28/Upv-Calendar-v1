package com.upv.examcalendar.repositories;

import com.upv.examcalendar.models.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByDegreeIn(List<String> degrees);

    List<Exam> findBySemesterIn(List<String> semesters);

    List<Exam> findBySubjectIn(List<String> subjects);

    List<Exam> findByDate(LocalDate date);

    @Query("SELECT DISTINCT e.degree FROM Exam e ORDER BY e.degree")
    List<String> findAllDegrees();

    @Query("SELECT DISTINCT e.semester FROM Exam e ORDER BY e.semester")
    List<String> findAllSemesters();

    @Query("SELECT DISTINCT e.subject FROM Exam e ORDER BY e.subject")
    List<String> findAllSubjects();

    @Query("SELECT e FROM Exam e WHERE " +
            "(:degrees IS NULL OR e.degree IN :degrees) AND " +
            "(:semesters IS NULL OR e.semester IN :semesters) AND " +
            "(:subjects IS NULL OR e.subject IN :subjects)")
    List<Exam> findByFilters(List<String> degrees, List<String> semesters, List<String> subjects);
}