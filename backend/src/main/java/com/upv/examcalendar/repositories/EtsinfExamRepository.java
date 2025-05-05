package com.upv.examcalendar.repositories;

import com.upv.examcalendar.models.EtsinfExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Repository for EtsinfExam entity
 * Provides CRUD operations and custom queries
 */
@Repository
public interface EtsinfExamRepository extends JpaRepository<EtsinfExam, Long> {

        /**
         * Find exams by subject code
         */
        List<EtsinfExam> findBySubjectCodeIgnoreCase(String subjectCode);

        /**
         * Find exams by degree
         */
        List<EtsinfExam> findByDegreeIgnoreCase(String degree);

        /**
         * Find exams by degree starting with (for school filtering)
         */
        @Query("SELECT e FROM EtsinfExam e WHERE LOWER(e.degree) LIKE LOWER(CONCAT(:school, '%'))")
        List<EtsinfExam> findByDegreeStartingWithIgnoreCase(@Param("school") String school);

        /**
         * Find exams by course year and semester
         */
        List<EtsinfExam> findByCourseYearAndSemester(Integer courseYear, String semester);

        /**
         * Find exams by date range
         */
        List<EtsinfExam> findByExamDayBetween(LocalDate startDate, LocalDate endDate);

        /**
         * Find exams by subject name containing text (case insensitive)
         */
        List<EtsinfExam> findBySubjectNameContainingIgnoreCase(String subjectNamePart);

        /**
         * Custom query to find exams by exam place containing text
         */
        @Query("SELECT e FROM EtsinfExam e WHERE LOWER(e.examPlace) LIKE LOWER(CONCAT('%', :place, '%'))")
        List<EtsinfExam> findByExamPlaceContaining(String place);

        /**
         * Get all unique schools (first word of degree)
         */
        @Query(value = "SELECT DISTINCT SPLIT_PART(degree, ' ', 1) as school FROM etsinf_exams ORDER BY school", nativeQuery = true)
        List<String> findAllSchools();

        /**
         * Get all unique degrees
         */
        @Query(value = "SELECT DISTINCT degree FROM etsinf_exams ORDER BY degree", nativeQuery = true)
        List<String> findAllDegrees();

        /**
         * Get all unique distinct degrees
         */
        @Query(value = "SELECT DISTINCT degree FROM etsinf_exams ORDER BY degree", nativeQuery = true)
        List<String> findDistinctDegrees();

        /**
         * Get all unique sub-degrees (derived from the degree name)
         * Using native SQL query for PostgreSQL compatibility
         */
        @Query(value = "SELECT DISTINCT degree FROM etsinf_exams ORDER BY degree", nativeQuery = true)
        List<String> findAllSubDegrees();

        /**
         * Get degrees for a specific school
         * Using parameter placeholder for PostgreSQL compatibility
         */
        @Query(value = "SELECT DISTINCT degree FROM etsinf_exams WHERE degree LIKE :pattern ORDER BY degree", nativeQuery = true)
        List<String> findDegreesBySchool(@Param("pattern") String pattern);

        /**
         * Get sub-degrees for a specific parent degree
         * Using simple parameter placeholder for PostgreSQL compatibility
         */
        @Query(value = "SELECT DISTINCT degree FROM etsinf_exams WHERE degree LIKE :pattern ORDER BY degree", nativeQuery = true)
        List<String> findSubDegreesByParentDegree(@Param("pattern") String pattern);

        /**
         * Get all unique semesters
         */
        @Query(value = "SELECT DISTINCT semester FROM etsinf_exams ORDER BY semester", nativeQuery = true)
        List<String> findAllSemesters();

        /**
         * Get all unique distinct semesters
         */
        @Query(value = "SELECT DISTINCT semester FROM etsinf_exams ORDER BY semester", nativeQuery = true)
        List<String> findDistinctSemesters();

        /**
         * Get all unique course years
         */
        @Query(value = "SELECT DISTINCT course_year FROM etsinf_exams ORDER BY course_year", nativeQuery = true)
        List<Integer> findAllCourseYears();

        /**
         * Get all unique distinct course years
         */
        @Query(value = "SELECT DISTINCT course_year FROM etsinf_exams ORDER BY course_year", nativeQuery = true)
        List<Integer> findDistinctCourseYears();

        /**
         * Get all unique subjects with acronyms
         * Using native SQL query for better PostgreSQL compatibility
         */
        @Query(value = "SELECT DISTINCT subject_name as name, acronym FROM etsinf_exams ORDER BY subject_name", nativeQuery = true)
        List<Object[]> findAllSubjectsWithAcronyms();

        /**
         * Get all unique distinct subjects with acronyms
         * Using native SQL query for better PostgreSQL compatibility
         */
        @Query(value = "SELECT DISTINCT subject_name as name, acronym FROM etsinf_exams ORDER BY subject_name", nativeQuery = true)
        List<Object[]> findDistinctSubjectsWithAcronyms();
}